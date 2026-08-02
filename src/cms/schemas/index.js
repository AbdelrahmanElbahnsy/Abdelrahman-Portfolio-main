export const heroSchema = {
  collectionName: 'hero',
  docId: 'main',
  title: 'Hero Header',
  isSingleDoc: true,
  fields: [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'badge', label: 'Professional Title (Badge)', type: 'text', required: true },
    { name: 'roles', label: 'Roles / Headlines (Comma separated)', type: 'textarea', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'portrait', label: 'Hero Image', type: 'image' },
    { name: 'cvUrl', label: 'Resume URL', type: 'file' },
    { name: 'availabilityStatus', label: 'Availability Status', type: 'text' },
    { name: 'cta1', label: 'CTA Button 1 Text', type: 'text' },
    { name: 'cta2', label: 'CTA Button 2 Text', type: 'text' }
  ]
};

export const aboutSchema = {
  collectionName: 'about',
  docId: 'main',
  title: 'About Section',
  isSingleDoc: true,
  fields: [
    { name: 'subtitle', label: 'Subtitle', type: 'text', required: true },
    { name: 'title', label: 'Section Title', type: 'text', required: true },
    { name: 'lead', label: 'Lead Text', type: 'textarea' },
    { name: 'paragraphsJson', label: 'Paragraphs (JSON Array of {text, highlight, suffix})', type: 'textarea' },
    { name: 'badgesJson', label: 'Badges (JSON Array of {icon, label})', type: 'textarea' },
    { name: 'terminalItemsJson', label: 'Terminal Items (JSON Array of {key, value})', type: 'textarea' }
  ]
};

export const projectsSchema = {
  collectionName: 'projects',
  title: 'Projects',
  isSingleDoc: false,
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'image', label: 'Project Image', type: 'image' },
    { name: 'technologies', label: 'Technologies', type: 'array' }, // Custom array or tag input
    { name: 'github', label: 'GitHub URL', type: 'url' },
    { name: 'live', label: 'Live URL', type: 'url' }
  ]
};

export const skillsSchema = {
  collectionName: 'skills',
  title: 'Skills & Tools',
  isSingleDoc: false,
  fields: [
    { name: 'name', label: 'Skill Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text', required: true },
    { name: 'categoryIcon', label: 'Category Icon (FontAwesome/React Icon)', type: 'text' },
    { name: 'percent', label: 'Proficiency (%)', type: 'number', required: true, min: 0, max: 100 },
    { name: 'isCircular', label: 'Show in Top Circular Section?', type: 'boolean' },
    { name: 'circularSub', label: 'Circular Subtitle', type: 'text' },
    { name: 'order', label: 'Display Order', type: 'number' }
  ]
};

export const journeySchema = {
  collectionName: 'journey',
  title: 'Journey / Experience',
  isSingleDoc: false,
  fields: [
    { name: 'title', label: 'Title / Role', type: 'text', required: true },
    { name: 'company', label: 'Company', type: 'text' },
    { name: 'organization', label: 'Organization', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'date', label: 'Date', type: 'text' },
    { name: 'order', label: 'Order / Phase Number (e.g. 01)', type: 'text', required: true },
    { name: 'badge', label: 'Badge', type: 'text' },
    { name: 'technologies', label: 'Technologies (Comma separated)', type: 'text' },
    { name: 'status', label: 'Status', type: 'text' },
    { name: 'icon', label: 'Icon', type: 'text' },
    { name: 'color', label: 'Color', type: 'text' }
  ]
};

export const certificationsSchema = {
  collectionName: 'certifications',
  title: 'Certifications',
  isSingleDoc: false,
  fields: [
    { name: 'title', label: 'Certificate Title', type: 'text', required: true },
    { name: 'issuer', label: 'Issuing Organization', type: 'text', required: true },
    { name: 'link', label: 'Credential URL', type: 'url' },
    { name: 'date', label: 'Issue Date', type: 'date' }
  ]
};

export const contactSchema = {
  collectionName: 'content',
  docId: 'contact',
  title: 'Contact Info',
  isSingleDoc: true,
  fields: [
    { name: 'email', label: 'Contact Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'text' },
    { name: 'location', label: 'Location / Address', type: 'text' }
  ]
};

export const socialLinksSchema = {
  collectionName: 'socials',
  title: 'Social Accounts',
  isSingleDoc: false,
  fields: [
    { name: 'platform', label: 'Platform (e.g. GitHub, LinkedIn)', type: 'text', required: true },
    { name: 'url', label: 'Profile URL', type: 'url', required: true },
    { name: 'icon', label: 'Icon Name', type: 'text' }
  ]
};

export const settingsSchema = {
  collectionName: 'settings',
  docId: 'general',
  title: 'General Settings',
  isSingleDoc: true,
  fields: [
    { name: 'siteTitle', label: 'Site Title', type: 'text' },
    { name: 'siteDescription', label: 'Site Description', type: 'textarea' },
    { name: 'theme', label: 'Default Theme', type: 'select', options: ['dark', 'light'] }
  ]
};

export const schemas = {
  hero: heroSchema,
  about: aboutSchema,
  projects: projectsSchema,
  skills: skillsSchema,
  journey: journeySchema,
  certifications: certificationsSchema,
  contact: contactSchema,
  socialLinks: socialLinksSchema,
  settings: settingsSchema,
};
