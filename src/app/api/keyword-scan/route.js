import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/apiAuth";
import { resolveAiQuota, incrementFreeAiUsage } from "@/lib/aiQuotaServer";
import { isPaidPlan } from "@/lib/checkPlan";

const MODEL = "gpt-4o-mini";

function parseScanResult(raw) {
  let text = typeof raw === "string" ? raw.trim() : "";
  if (!text) throw new Error("Empty model response");
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/u, "");
  }
  const parsed = JSON.parse(text);

  const matched = Array.isArray(parsed.matched_keywords)
    ? parsed.matched_keywords
    : [];
  const missing = Array.isArray(parsed.missing_keywords)
    ? parsed.missing_keywords
    : [];
  const suggestions = Array.isArray(parsed.suggestions)
    ? parsed.suggestions
    : [];

  let matchScore = parsed.match_score;
  if (typeof matchScore !== "number" || Number.isNaN(matchScore)) {
    matchScore = 0;
  }
  matchScore = Math.max(0, Math.min(100, Math.round(matchScore)));

  return {
    matchedKeywords: matched
      .filter((k) => typeof k === "string" && k.trim())
      .map((k) => k.trim()),
    missingKeywords: missing
      .filter((k) => typeof k === "string" && k.trim())
      .map((k) => k.trim()),
    matchScore,
    suggestions: suggestions
      .filter((s) => typeof s === "string" && s.trim())
      .map((s) => s.trim()),
  };
}

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Keyword scanning isn’t available right now. Please try again later.",
        },
        { status: 503 }
      );
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

    const jobDescription =
      typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";
    const resumeContext =
      typeof body.resumeContext === "string" ? body.resumeContext.trim() : "";

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 }
      );
    }
    if (!resumeContext) {
      return NextResponse.json(
        { error: "Resume content is required. Select a resume." },
        { status: 400 }
      );
    }

    const userPrompt = `You help job seekers optimize resumes for ATS (applicant tracking systems).

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME (plain text):
${resumeContext}

Tasks:
1) Extract 15–28 of the most important ATS-relevant keywords or short phrases from the job description (technical skills, tools, platforms, methodologies, certifications, domain terms). Prefer concrete nouns/phrases over vague words like "team player".
2) For each extracted keyword, decide if the resume clearly supports it (exact mention, close synonym, or obvious equivalent experience). If supported → matched; if not → missing.
3) Compute match_score as an integer 0–100: approximate percentage of extracted keywords that are matched (weight important terms slightly higher mentally, but output one integer only).
4) Give 4–7 actionable suggestions: bullet-level edits the candidate could make (where to add terms, how to rephrase bullets, skills section tips). Be specific; no generic fluff.

Return ONLY valid JSON with this exact shape:
{
  "matched_keywords": ["...", "..."],
  "missing_keywords": ["...", "..."],
  "match_score": 72,
  "suggestions": ["...", "..."]
}

Rules: No markdown in strings. matched_keywords and missing_keywords should be disjoint and together cover every extracted keyword exactly once.`;

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
              'Respond only with valid JSON matching the user schema. Keys must be matched_keywords, missing_keywords, match_score, suggestions.',
          },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.35,
        max_tokens: 2500,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenAI keyword-scan error:", res.status, errText);
      return NextResponse.json(
        {
          error:
            "We couldn’t complete the scan. Please try again in a moment.",
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    let result;
    try {
      result = parseScanResult(content);
    } catch (e) {
      console.error("keyword-scan parse error:", e, content);
      return NextResponse.json(
        {
          error:
            "The scan returned unexpected data. Try running the scan again.",
        },
        { status: 502 }
      );
    }

    if (!isPaidPlan(quota.plan)) {
      await incrementFreeAiUsage(quota.admin, user.id, quota.plan);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("keyword-scan route:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
