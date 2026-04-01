import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { resolveAiQuota, incrementFreeAiUsage } from "@/lib/aiQuotaServer";
import { isPaidPlan } from "@/lib/checkPlan";

const MODEL = "gpt-4o-mini";

function parseBulletsFromContent(raw) {
  let text = typeof raw === "string" ? raw.trim() : "";
  if (!text) {
    throw new Error("Empty model response");
  }
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "");
  }
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.bullets)) {
    throw new Error("Response missing bullets array");
  }
  return parsed.bullets
    .filter((b) => typeof b === "string" && b.trim().length > 0)
    .map((b) => b.trim().replace(/^[•\-\*]\s*/u, ""));
}

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "AI generation isn’t available right now. Please try again later.",
        },
        { status: 503 }
      );
    }

    const { user, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: authError || "Sign in to generate with AI." },
        { status: 401 }
      );
    }

    const quota = await resolveAiQuota(user);
    if (!quota.allowed) {
      return NextResponse.json(quota.body, { status: quota.status });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Please use JSON." },
        { status: 400 }
      );
    }

    const jobTitle =
      typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (!jobTitle) {
      return NextResponse.json(
        { error: "Job title is required to generate bullet points." },
        { status: 400 }
      );
    }

    const userPrompt = `Job title: ${jobTitle}
Role / responsibilities (may be brief or empty): ${description || "Not specified — infer reasonable professional achievements for this role."}

Return a JSON object with exactly this shape: {"bullets": ["...", "..."]}
Include 4–6 bullet points. Each bullet should:
- Start with a strong action verb
- Be one sentence (ideally under 28 words)
- Sound credible and professional for resume / ATS use
- Use measurable outcomes when plausible; avoid fluff and clichés
Do not include numbering or bullet symbols in the strings.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume writer. Respond only with valid JSON matching the user's requested shape.",
          },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.65,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI API error:", res.status, errText);
      return NextResponse.json(
        {
          error:
            "We couldn’t generate content right now. Please wait a moment and try again.",
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    let bullets;
    try {
      bullets = parseBulletsFromContent(content);
    } catch (parseErr) {
      console.error("Failed to parse OpenAI response:", parseErr, content);
      return NextResponse.json(
        {
          error:
            "The AI returned an unexpected format. Please try generating again.",
        },
        { status: 502 }
      );
    }

    if (bullets.length === 0) {
      return NextResponse.json(
        { error: "No bullet points were generated. Try adding more detail." },
        { status: 422 }
      );
    }

    if (!isPaidPlan(quota.plan)) {
      await incrementFreeAiUsage(quota.admin, user.id, quota.plan);
    }

    return NextResponse.json({ bullets });
  } catch (err) {
    console.error("generate route error:", err);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
