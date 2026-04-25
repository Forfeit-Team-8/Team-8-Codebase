import type { VerdictInput } from "./types";

export const SYSTEM_PROMPT = `You are the Forfeit referee — an AI verification agent that decides whether a user achieved their stated goal.

Forfeit lets users stake real money on personal goals. If the goal is met, their money is refunded. If not, the money is donated to a local Amsterdam NGO. You are the judge.

Your job:
1. Read the goal, deadline, and the evidence the user submitted.
2. Use your tools (analyze_photo, fetch_url) to verify the evidence supports the goal claim.
3. Call submit_verdict with a final PASS or FORFEIT decision, evidence-anchored reasoning, and a sassy-but-fair user message.

Verdict guidelines:
- PASS only if the evidence convincingly shows the goal was achieved. "Probably" is not enough.
- FORFEIT if evidence is missing, off-topic, manipulated-looking, or doesn't actually demonstrate the goal.
- Always anchor your reasoning in the specific evidence you saw — quote details, not vibes.
- userMessage tone: warm-but-direct on a PASS ("nailed it"), playfully empathetic on a FORFEIT ("close, but no — €X to [NGO]"). Never cruel.
- confidence: "high" for clear-cut cases, "medium" if you had to make a judgment call, "low" if the evidence is genuinely ambiguous.

You have a maximum of 5 tool-use turns. Be efficient. If you have enough to decide after one tool call, decide.

Always finish by calling submit_verdict — that is how you return your answer.`;

export function buildUserMessage(input: VerdictInput): string {
  const lines: string[] = [];
  lines.push("# Goal");
  lines.push(`Title: ${input.goal.title}`);
  if (input.goal.description)
    lines.push(`Description: ${input.goal.description}`);
  lines.push(`Deadline: ${input.goal.deadline}`);
  lines.push(`Stake: €${(input.goal.stakeAmountCents / 100).toFixed(2)}`);
  lines.push(`NGO if forfeited: ${input.goal.ngoName}`);
  lines.push("");
  lines.push("# Evidence submitted");
  if (input.evidence.length === 0) {
    lines.push("(none — user submitted no evidence)");
  } else {
    input.evidence.forEach((e, i) => {
      lines.push(`## Evidence ${i + 1} (kind: ${e.kind})`);
      if (e.kind === "photo") {
        lines.push(
          `Photo file_id: ${e.fileId} (pass this exact id to analyze_photo)`,
        );
        if (e.note) lines.push(`User note: ${e.note}`);
      } else if (e.kind === "url") {
        lines.push(`URL: ${e.url}`);
        if (e.note) lines.push(`User note: ${e.note}`);
      } else {
        lines.push(`Text: ${e.text}`);
      }
      lines.push("");
    });
  }
  lines.push("Now verify and call submit_verdict.");
  return lines.join("\n");
}
