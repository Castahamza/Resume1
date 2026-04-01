const DEFAULT_PERSONAL = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  summary: "",
};

export function newClientId() {
  return crypto.randomUUID();
}

export function emptyExperience() {
  return {
    id: newClientId(),
    company: "",
    jobTitle: "",
    dates: "",
    roleDescription: "",
    bullets: [""],
  };
}

export function emptyEducation() {
  return {
    id: newClientId(),
    school: "",
    degree: "",
    dates: "",
  };
}

function normalizeExperience(raw) {
  const e = raw && typeof raw === "object" ? raw : {};
  const bullets = Array.isArray(e.bullets)
    ? e.bullets.map((b) => (typeof b === "string" ? b : ""))
    : [];
  return {
    id: typeof e.id === "string" ? e.id : newClientId(),
    company: typeof e.company === "string" ? e.company : "",
    jobTitle: typeof e.jobTitle === "string" ? e.jobTitle : "",
    dates: typeof e.dates === "string" ? e.dates : "",
    roleDescription:
      typeof e.roleDescription === "string" ? e.roleDescription : "",
    bullets: bullets.length > 0 ? bullets : [""],
  };
}

function normalizeEducation(raw) {
  const ed = raw && typeof raw === "object" ? raw : {};
  return {
    id: typeof ed.id === "string" ? ed.id : newClientId(),
    school: typeof ed.school === "string" ? ed.school : "",
    degree: typeof ed.degree === "string" ? ed.degree : "",
    dates: typeof ed.dates === "string" ? ed.dates : "",
  };
}

/**
 * Maps Supabase JSON content into editor state shapes.
 */
export function normalizeResumeContent(raw) {
  const c = raw && typeof raw === "object" ? raw : {};

  const personal = {
    ...DEFAULT_PERSONAL,
    ...(c.personal && typeof c.personal === "object" ? c.personal : {}),
  };
  for (const k of Object.keys(DEFAULT_PERSONAL)) {
    if (typeof personal[k] !== "string") personal[k] = "";
  }

  const experiences = Array.isArray(c.experiences)
    ? c.experiences.map(normalizeExperience)
    : [];
  const educations = Array.isArray(c.educations)
    ? c.educations.map(normalizeEducation)
    : [];
  const skills = Array.isArray(c.skills)
    ? c.skills.filter((s) => typeof s === "string")
    : [];

  return {
    personal,
    experiences: experiences.length > 0 ? experiences : [emptyExperience()],
    educations: educations.length > 0 ? educations : [emptyEducation()],
    skills,
  };
}

export function buildResumeContentPayload(personal, experiences, educations, skills) {
  return {
    personal,
    experiences,
    educations,
    skills,
  };
}
