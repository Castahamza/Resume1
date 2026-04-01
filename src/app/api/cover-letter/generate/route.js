import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { resolveAiQuota, incrementFreeAiUsage } from "@/lib/aiQuotaServer";
import { isPaidPlan } from "@/lib/checkPlan";

const MODEL = "gpt-4o-mini";

function parseLetterFromContent(raw) {
  let text = typeof raw === "string" ? raw.trim() : "";
  if (!text) throw new Error("Empty model response");
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "");
  }
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed.letter !== "string") {
    throw new Error("Response missing letter string");
  }
  return parsed.letter.trim();
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
        { error: authError || "Sign in to generate a cover letter." },
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
    const companyName =
      typeof body.companyName === "string" ? body.companyName.trim() : "";
    const jobDescription =
      typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";
    const resumeContext =
      typeof body.resumeContext === "string" ? body.resumeContext.trim() : "";

    if (!jobTitle) {
      return NextResponse.json(
        { error: "Job title is required." },
        { status: 400 }
      );
    }
    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      );
    }
    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 }
      );
    }
    if (!resumeContext) {
      return NextResponse.json(
        { error: "Resume context is required. Select a resume." },
        { status: 400 }
      );
    }

    const userPrompt = `You are an expert career coach. Write a tailored cover letter using ONLY facts from the resume summary below (do not invent employers, degrees, dates, or skills not implied there).

Resume summary for the candidate:
${resumeContext}

Target role: ${jobTitle}
Company: ${companyName}

Job description / posting:
${jobDescription}

Output requirements:
- Return JSON with a single key "letter" whose value is the full cover letter as plain text.
- 3–4 short paragraphs plus a greeting (Dear Hiring Manager, or Dear [Company] Team,) and a professional sign-off (Sincerely, + line for the candidate's name from the resume).
- No markdown, no bullet lists, no bracket placeholders like [Your Name].
- Confident, specific, and concise; connect 2–3 resume achievements to needs implied in the job description.`;

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
              "You write excellent cover letters. Respond only with valid JSON: {\"letter\": \"...\"}.",
          },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.65,
        max_tokens: 1800,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI API error:", res.status, errText);
      return NextResponse.json(
        {
          error:
            "We couldn’t generate a letter right now. Please try again shortly.",
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    let letter;
    try {
      letter = parseLetterFromContent(content);
    } catch (parseErr) {
      console.error("Parse error:", parseErr, content);
      return NextResponse.json(
        {
          error:
            "The AI returned an unexpected format. Please try generating again.",
        },
        { status: 502 }
      );
    }

    if (!letter) {
      return NextResponse.json(
        { error: "Empty letter generated. Add more job or resume detail." },
        { status: 422 }
      );
    }

    if (!isPaidPlan(quota.plan)) {
      await incrementFreeAiUsage(quota.admin, user.id, quota.plan);
    }

    return NextResponse.json({ letter });
  } catch (err) {
    console.error("cover-letter generate:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
