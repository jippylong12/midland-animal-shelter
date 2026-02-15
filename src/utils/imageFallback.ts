export const OFFLINE_IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="380" viewBox="0 0 640 380">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#eef7ec" />
      <stop offset="100%" stop-color="#fff5e7" />
    </linearGradient>
  </defs>
  <rect width="640" height="380" fill="url(#bg)" />
  <path d="M180 240 C230 170, 410 170, 460 240" stroke="#7f8c75" stroke-width="16" fill="none" stroke-linecap="round" />
  <circle cx="240" cy="150" r="28" fill="#8ea18b" opacity="0.35" />
  <circle cx="395" cy="158" r="28" fill="#8ea18b" opacity="0.35" />
  <circle cx="320" cy="205" r="74" fill="#a9c2a0" opacity="0.28" />
  <text x="50%" y="285" text-anchor="middle" fill="#3a4f3c" font-size="28" font-family="Arial, Helvetica, sans-serif" font-weight="600">
    Photo unavailable offline
  </text>
</svg>
`)}`;
