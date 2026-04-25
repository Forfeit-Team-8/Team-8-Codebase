import type Anthropic from "@anthropic-ai/sdk";

/**
 * Tool definitions for the verification agent. Plain JSON Schema (not Zod) —
 * the SDK accepts both, and JSON Schema reads cleanly here.
 *
 * `submit_verdict` is the structured-output sink: when the model calls it,
 * `runAgent` captures the input as the final verdict and stops the loop.
 */
export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: "analyze_photo",
    description:
      "Analyze a user-uploaded photo to check whether it visually supports a specific claim. Use this for photo evidence (gym selfie, screenshot of grade, finished painting, etc.). Pass the exact file_id from the user message. Returns a description of what the photo shows and whether it matches the claim.",
    input_schema: {
      type: "object",
      properties: {
        fileId: {
          type: "string",
          description:
            "Anthropic Files API id of the uploaded photo (starts with 'file_'). Use the exact id from the evidence in the user message.",
        },
        claim: {
          type: "string",
          description:
            "The specific claim you want to verify. Be concrete: 'this shows the user inside a gym with weights' is better than 'gym evidence'.",
        },
      },
      required: ["fileId", "claim"],
    },
  },
  {
    name: "fetch_url",
    description:
      "Fetch a public URL and read its content to check whether it supports the goal. Works for blog posts, public Strava activities, public Notion / Google docs, GitHub PRs, Goodreads pages, Letterboxd entries, etc. Returns the page text (truncated to a reasonable length).",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Public URL to fetch.",
        },
        lookingFor: {
          type: "string",
          description:
            "What you're trying to verify in the page content. E.g. 'an activity dated after 2026-04-20 with distance >= 5km'.",
        },
      },
      required: ["url", "lookingFor"],
    },
  },
  {
    name: "submit_verdict",
    description:
      "Submit your final verdict. Call this exactly once when you've gathered enough evidence to decide. After this is called the agent loop ends.",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["PASS", "FORFEIT"],
          description:
            "PASS if evidence convincingly shows the goal was achieved; FORFEIT otherwise.",
        },
        reasoning: {
          type: "string",
          description:
            "1-3 sentences anchored in the specific evidence you saw. Quote details — don't generalize.",
        },
        userMessage: {
          type: "string",
          description:
            "Message shown to the user on the verdict screen. Warm-but-direct on PASS, playfully empathetic on FORFEIT. Mention the NGO on FORFEIT.",
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
          description:
            "high = clear-cut; medium = judgment call; low = genuinely ambiguous.",
        },
      },
      required: ["status", "reasoning", "userMessage", "confidence"],
    },
  },
];

/**
 * Tool executors. Run when the model calls a tool. submit_verdict isn't here —
 * it's intercepted by `runAgent` directly because it ends the loop.
 */
export const TOOL_EXECUTORS: Record<
  string,
  (input: unknown) => Promise<{ content: string; isError?: boolean }>
> = {
  analyze_photo: async (input) => {
    const { fileId, claim } = input as { fileId: string; claim: string };
    return analyzePhoto(fileId, claim);
  },
  fetch_url: async (input) => {
    const { url, lookingFor } = input as { url: string; lookingFor: string };
    return fetchUrlForAgent(url, lookingFor);
  },
};

// ---------------------------------------------------------------------------
// analyze_photo: vision sub-call to Claude. The agent asks "does this photo
// show X?" and we run a single-shot Claude call on the image to answer.
// ---------------------------------------------------------------------------

async function analyzePhoto(
  fileId: string,
  claim: string,
): Promise<{ content: string; isError?: boolean }> {
  // Lazy import keeps the SDK out of any non-server bundle by accident.
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();

  try {
    const response = await client.beta.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      betas: ["files-api-2025-04-14"],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "file", file_id: fileId },
            },
            {
              type: "text",
              text: `Look at this photo carefully. The claim being verified is: "${claim}"\n\nDescribe what you actually see in the photo (be specific about objects, setting, people, text). Then state whether the photo supports the claim, contradicts it, or is ambiguous. Be concise — under 150 words.`,
            },
          ],
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return { content: text };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: `analyze_photo failed: ${msg}`, isError: true };
  }
}

// ---------------------------------------------------------------------------
// fetch_url: GET the URL, return text content (HTML stripped, truncated).
// Intentionally simple — no Playwright, no JS rendering.
// ---------------------------------------------------------------------------

const MAX_FETCH_BYTES = 200_000; // ~50K chars-ish before stripping
const MAX_RETURN_CHARS = 8_000;

async function fetchUrlForAgent(
  url: string,
  lookingFor: string,
): Promise<{ content: string; isError?: boolean }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "ForfeitVerificationAgent/0.1 (+https://forfeit.app/agent)",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      return {
        content: `fetch_url got HTTP ${res.status} ${res.statusText} for ${url}`,
        isError: true,
      };
    }

    const contentType = res.headers.get("content-type") ?? "";
    const reader = res.body?.getReader();
    if (!reader) {
      return { content: `fetch_url: no body returned`, isError: true };
    }

    let total = 0;
    const chunks: Uint8Array[] = [];
    while (total < MAX_FETCH_BYTES) {
      const result = (await reader.read()) as {
        done: boolean;
        value?: Uint8Array;
      };
      if (result.done) break;
      const value = result.value;
      if (!value) break;
      chunks.push(value);
      total += value.byteLength;
    }
    await reader.cancel().catch(() => undefined);

    const buf = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      buf.set(c, offset);
      offset += c.byteLength;
    }
    const raw = new TextDecoder("utf-8", { fatal: false }).decode(buf);

    const text = contentType.includes("html") ? stripHtml(raw) : raw;
    const truncated = text.slice(0, MAX_RETURN_CHARS);
    const note =
      text.length > truncated.length
        ? `\n\n[truncated — ${text.length - truncated.length} more chars not shown]`
        : "";

    return {
      content: `URL: ${url}\nLooking for: ${lookingFor}\nContent-Type: ${contentType}\n\n--- BEGIN CONTENT ---\n${truncated}${note}\n--- END CONTENT ---`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { content: `fetch_url failed: ${msg}`, isError: true };
  } finally {
    clearTimeout(timeoutId);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
