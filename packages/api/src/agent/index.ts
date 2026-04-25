import Anthropic from "@anthropic-ai/sdk";

import type { AgentEvent, VerdictInput, VerdictResult } from "./types";
import { buildUserMessage, SYSTEM_PROMPT } from "./prompts";
import { TOOL_DEFINITIONS, TOOL_EXECUTORS } from "./tools";
import { verdictResultSchema } from "./types";

const MODEL = "claude-sonnet-4-6";
const MAX_TURNS = 5;
const MAX_TOKENS = 4_096;

/**
 * Runs the verification agent and streams events out as an async generator.
 * Each yielded value is a normalized {@link AgentEvent} the tRPC subscription
 * forwards to the client.
 *
 * Loop structure:
 *   for each turn (cap MAX_TURNS):
 *     - open a streaming Messages request
 *     - relay text/thinking deltas to the client
 *     - on stream end: collect tool_use blocks
 *       - if submit_verdict was called: yield "verdict" event and return
 *       - else: execute non-verdict tools, yield tool_result events,
 *         feed results back in, loop
 *     - if no tool_use blocks: model ended naturally without verdict — yield
 *       error and return (model failed to follow instructions)
 *
 * Note: this function intentionally does NOT touch the DB. The verdict.run
 * subscription that wraps it is responsible for persistence (and that's
 * currently STUBBED — see router/verdict.ts).
 */
export async function* runAgent(
  input: VerdictInput,
): AsyncGenerator<AgentEvent> {
  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildUserMessage(input) },
  ];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: TOOL_DEFINITIONS,
      messages,
    });

    // Track tool-use blocks as they stream in. Block index → accumulated input JSON string.
    const partialToolInputs = new Map<
      number,
      { name: string; id: string; jsonAcc: string }
    >();

    try {
      for await (const event of stream) {
        if (event.type === "content_block_start") {
          if (event.content_block.type === "tool_use") {
            partialToolInputs.set(event.index, {
              name: event.content_block.name,
              id: event.content_block.id,
              jsonAcc: "",
            });
          }
        } else if (event.type === "content_block_delta") {
          if (event.delta.type === "text_delta") {
            yield { type: "text_delta", delta: event.delta.text };
          } else if (event.delta.type === "thinking_delta") {
            yield { type: "thinking_delta", delta: event.delta.thinking };
          } else if (event.delta.type === "input_json_delta") {
            const tool = partialToolInputs.get(event.index);
            if (tool) tool.jsonAcc += event.delta.partial_json;
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      yield { type: "error", message: `Streaming failed: ${msg}` };
      return;
    }

    const finalMessage = await stream.finalMessage();
    messages.push({ role: "assistant", content: finalMessage.content });

    const toolUseBlocks = finalMessage.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    if (toolUseBlocks.length === 0) {
      yield {
        type: "error",
        message:
          "Agent ended without calling submit_verdict — model failed to follow instructions.",
      };
      return;
    }

    // Check for verdict first — if present, capture and exit.
    const verdictCall = toolUseBlocks.find((t) => t.name === "submit_verdict");
    if (verdictCall) {
      const parsed = verdictResultSchema.safeParse(verdictCall.input);
      if (!parsed.success) {
        yield {
          type: "error",
          message: `submit_verdict input was malformed: ${parsed.error.message}`,
        };
        return;
      }
      yield { type: "verdict", verdict: parsed.data satisfies VerdictResult };
      return;
    }

    // Execute non-verdict tools sequentially. Could be parallelized but keeping
    // it sequential makes the streaming timeline easier to read.
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUseBlocks) {
      yield { type: "tool_use", toolName: tu.name, input: tu.input };

      const executor = TOOL_EXECUTORS[tu.name];
      if (!executor) {
        const result = `Unknown tool: ${tu.name}`;
        yield {
          type: "tool_result",
          toolName: tu.name,
          result,
          isError: true,
        };
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: result,
          is_error: true,
        });
        continue;
      }

      const { content, isError } = await executor(tu.input);
      yield {
        type: "tool_result",
        toolName: tu.name,
        result: content,
        isError,
      };
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content,
        is_error: isError,
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  yield {
    type: "error",
    message: `Agent hit max turn limit (${MAX_TURNS}) without producing a verdict.`,
  };
}
