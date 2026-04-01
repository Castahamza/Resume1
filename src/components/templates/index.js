import ModernTemplate from "./ModernTemplate";
import ClassicTemplate from "./ClassicTemplate";
import CreativeTemplate from "./CreativeTemplate";

export const RESUME_TEMPLATES = [
  {
    id: "modern",
    label: "Modern",
    description: "Clean & minimal with blue accents",
  },
  {
    id: "classic",
    label: "Classic",
    description: "Traditional black & white",
  },
  {
    id: "creative",
    label: "Creative",
    description: "Bold color accents",
  },
];

export const templateMap = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
};

/** Maps legacy DB values and unknown ids to a known template. */
export function normalizeTemplateId(id) {
  if (!id || id === "default") return "modern";
  if (Object.prototype.hasOwnProperty.call(templateMap, id)) return id;
  return "modern";
}

export function getTemplateLabel(id) {
  const key = normalizeTemplateId(id);
  return RESUME_TEMPLATES.find((t) => t.id === key)?.label ?? "Modern";
}

export { ModernTemplate, ClassicTemplate, CreativeTemplate };
