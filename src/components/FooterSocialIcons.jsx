/**
 * Placeholder hrefs — replace in socialNav below when URLs are ready.
 */
export const socialNav = [
  { label: "LinkedIn", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Reddit", href: "#" },
];

function IconLinkedIn(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconTikTok(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function IconInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function IconYouTube(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconReddit(props) {
  /* Snoo-style mark (monochrome); official wordmark is separate */
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M9.5 11.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm6 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm-.25 3.25c-.35 0-.64.22-.76.53a3.3 3.3 0 0 1-5.98 0c-.12-.31-.41-.53-.76-.53a.85.85 0 0 0-.35 1.63 5 5 0 0 0 10 0 .85.85 0 0 0-.35-1.63z" />
      <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2zm6.93 8.27a1.48 1.48 0 0 0-2.38.35 12 12 0 0 0-5.07-1.17l1.15-3.74 3.13.69a1.25 1.25 0 1 0 .17-2.48l-4.06-.9a.63.63 0 0 0-.74.43l-1.28 4.2c-1.96.18-3.73.66-5.07 1.17a1.48 1.48 0 0 0-2.38-.35 1.5 1.5 0 0 0-.55 1.9c.12.29.34.52.6.65a7.15 7.15 0 0 0-.08 1.19c0 3.54 3.93 6.42 8.77 6.42s8.77-2.88 8.77-6.42c0-.4-.03-.8-.08-1.19.26-.13.48-.36.6-.65a1.5 1.5 0 0 0-.55-1.9z" />
    </svg>
  );
}

const ICONS = [IconLinkedIn, IconTikTok, IconInstagram, IconYouTube, IconReddit];

export function FooterSocialIcons() {
  return (
    <ul
      className="flex items-center gap-5 sm:ml-auto sm:gap-6"
      aria-label="Social media"
    >
      {socialNav.map(({ label, href }, i) => {
        const Icon = ICONS[i];
        return (
          <li key={label}>
            <a
              href={href}
              aria-label={label}
              className="block text-slate-400 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
