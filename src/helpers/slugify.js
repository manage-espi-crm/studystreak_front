// Turns a course title (or any text) into a URL/SEO friendly slug.
// Mirrors Django's slugify closely enough that the value typed in the
// admin form matches what the backend would generate on save.
const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // drop anything not alphanumeric/space/dash
    .replace(/[\s_-]+/g, "-") // collapse whitespace & underscores to a single dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes

export default slugify;
