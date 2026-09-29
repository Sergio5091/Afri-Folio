// ============================================================
// Conversion des lignes DB (snake_case) → objets API (camelCase)
// ============================================================

function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    plan: user.plan,
    referralCode: user.referral_code,
    isAdmin: Boolean(user.is_admin),
    status: user.status || "active",
    createdAt: user.created_at,
  };
}

function formatProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    profileType: row.profile_type,
    profession: row.profession || null,
    professionCustom: row.profession_custom || null,
    template: row.template || null,
    fullName: row.full_name,
    title: row.title,
    tagline: row.tagline,
    bio: row.bio,
    photoUrl: row.photo_url,
    logoUrl: row.logo_url,
    skills: parseJson(row.skills, []),
    services: row.services,
    whatsapp: row.whatsapp,
    emailContact: row.email_contact,
    linkedin: row.linkedin,
    twitter: row.twitter,
    instagram: row.instagram || null,
    facebook: row.facebook || null,
    tiktok: row.tiktok || null,
    youtube: row.youtube || null,
    github: row.github,
    website: row.website,
    country: row.country,
    city: row.city,
    styleTheme: row.style_theme,
    primaryColor: row.primary_color,
    fontFamily: row.font_family,
    yearsExperience: row.years_experience,
    completedProjects: row.completed_projects,
    satisfiedClients: row.satisfied_clients,
    availableForWork: Boolean(row.available_for_work),
    isFeatured: Boolean(row.is_featured),
    listedInDirectory: row.listed_in_directory == null ? true : Boolean(row.listed_in_directory),
    updatedAt: row.updated_at,
  };
}

function formatBlock(row) {
  return {
    id: row.id,
    type: row.type,
    position: row.position,
    visible: Boolean(row.visible),
    data: parseJson(row.data, {}),
  };
}

function formatProject(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    projectUrl: row.project_url,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

function formatLead(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

/** Transforme un nom en identifiant d'URL : "Aminata Diallo" → "aminata-diallo" */
function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

module.exports = {
  parseJson,
  formatUser,
  formatProfile,
  formatBlock,
  formatProject,
  formatLead,
  slugify,
};
