"use client";

import { normalizeResumeContent } from "@/lib/resumeContent";
import { normalizeTemplateId, templateMap } from "./index";

/**
 * Scaled-down live preview of a resume using the same template as the full editor.
 */
export function ResumeThumbnail({ template, content }) {
  const templateId = normalizeTemplateId(template);
  const Template = templateMap[templateId] ?? templateMap.modern;
  const data = normalizeResumeContent(content);

  return (
    <div
      className="relative h-28 w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
      aria-hidden
    >
      <div className="absolute left-0 top-0 w-[640px] origin-top-left scale-[0.2] transform-gpu [contain:paint]">
        <div className="min-h-[120px] bg-white px-8 py-6 text-slate-900 shadow-none">
          <Template
            personal={data.personal}
            experiences={data.experiences}
            educations={data.educations}
            skills={data.skills}
          />
        </div>
      </div>
    </div>
  );
}
