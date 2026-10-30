/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Safe Base64 helper for embedded default placeholder graphics
function toBase64Svg(svgStr: string) {
  if (typeof btoa !== 'undefined') {
    return `data:image/svg+xml;base64,${btoa(svgStr)}`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(svgStr).toString('base64')}`;
}

const DEFAULT_AVATAR = toBase64Svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#2D3748"/><circle cx="100" cy="80" r="42" fill="#E2E8F0"/><path d="M40 180 C40 135 70 120 100 120 C130 120 160 135 160 180 Z" fill="#CBD5E1"/></svg>`
);
const DEFAULT_LOGO = toBase64Svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80" viewBox="0 0 160 80"><rect width="160" height="80" rx="12" fill="#0F172A"/><path d="M30 40 L50 20 L70 40 L50 60 Z" fill="#38BDF8"/><text x="75" y="48" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="20">STUDIO</text></svg>`
);
const DEFAULT_TEXTURE = toBase64Svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#0F172A"/></linearGradient></defs><rect width="400" height="600" fill="url(#g)"/><circle cx="200" cy="300" r="160" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="8 8"/></svg>`
);

export interface CardTemplate {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  imageSlotCount: number;
  description: string;
  svgContent: string;
}

export const SAMPLE_TEMPLATES: CardTemplate[] = [
  {
    id: 'executive-mono',
    name: 'Executive Studio',
    subtitle: 'Classic Monochrome',
    category: 'Design & Creative',
    imageSlotCount: 2,
    description: 'Clean typographic layout with circular profile portrait and brand emblem.',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1050 600" width="1050" height="600">
  <defs>
    <clipPath id="avatar-clip">
      <circle cx="160" cy="180" r="90" />
    </clipPath>
    <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141416" />
      <stop offset="100%" stop-color="#1c1c1f" />
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="1050" height="600" rx="24" fill="url(#card-grad)" />
  <rect x="2" y="2" width="1046" height="596" rx="22" fill="none" stroke="#2D2D32" stroke-width="2" />

  <!-- Subtle divider rule -->
  <line x1="70" y1="360" x2="980" y2="360" stroke="#2c2c30" stroke-width="1.5" />

  <!-- SLOT 1: Profile Portrait (Clipped circle) -->
  <circle cx="160" cy="180" r="94" fill="none" stroke="#3A3A40" stroke-width="3" />
  <image id="profile_headshot" x="70" y="90" width="180" height="180" clip-path="url(#avatar-clip)" preserveAspectRatio="xMidYMid slice" href="${DEFAULT_AVATAR}" xlink:href="${DEFAULT_AVATAR}" />

  <!-- SLOT 2: Brand Logo / Insignia Slot -->
  <image id="company_logo" x="800" y="110" width="180" height="80" preserveAspectRatio="xMidYMid meet" href="${DEFAULT_LOGO}" xlink:href="${DEFAULT_LOGO}" />

  <!-- Typography: Name & Title -->
  <text x="300" y="170" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="46" letter-spacing="-0.5">Julian Vance</text>
  <text x="300" y="215" fill="#98989F" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="22" letter-spacing="0.5">Founding Principal · Industrial Design</text>

  <!-- Contact Details Grid -->
  <text x="70" y="440" fill="#E1E1E6" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="20">julian@vancestudio.design</text>
  <text x="70" y="480" fill="#8E8E93" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="400" font-size="18">+1 (415) 890-2410</text>

  <text x="440" y="440" fill="#E1E1E6" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="20">vancestudio.design</text>
  <text x="440" y="480" fill="#8E8E93" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="400" font-size="18">San Francisco · New York</text>

  <text x="780" y="440" fill="#0071E3" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="20">@vancestudio</text>
  <text x="780" y="480" fill="#8E8E93" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="400" font-size="18">Studio No. 402, Pier 17</text>
</svg>`,
  },
  {
    id: 'architectural-split',
    name: 'Architectural Slate',
    subtitle: 'Split Imagery Edition',
    category: 'Architecture & Real Estate',
    imageSlotCount: 3,
    description: 'Triple-image placeholder layout with portfolio banner, firm crest, and director portrait.',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1050 600" width="1050" height="600">
  <defs>
    <clipPath id="arch-banner-clip">
      <rect x="650" y="0" width="400" height="600" rx="0" />
    </clipPath>
    <clipPath id="director-clip">
      <rect x="70" y="70" width="130" height="130" rx="20" />
    </clipPath>
  </defs>

  <!-- Card Background -->
  <rect width="1050" height="600" rx="24" fill="#F8F9FA" />
  <rect x="1" y="1" width="1048" height="598" rx="23" fill="none" stroke="#E2E8F0" stroke-width="2" />

  <!-- SLOT 1: Hero Showcase Right Wing -->
  <image id="portfolio_showcase" x="650" y="0" width="400" height="600" clip-path="url(#arch-banner-clip)" preserveAspectRatio="xMidYMid slice" href="${DEFAULT_TEXTURE}" xlink:href="${DEFAULT_TEXTURE}" />

  <!-- Left Content Area -->
  <!-- SLOT 2: Director Avatar -->
  <image id="director_portrait" x="70" y="70" width="130" height="130" clip-path="url(#director-clip)" preserveAspectRatio="xMidYMid slice" href="${DEFAULT_AVATAR}" xlink:href="${DEFAULT_AVATAR}" />

  <!-- SLOT 3: Firm Monogram -->
  <image id="firm_monogram" x="420" y="70" width="160" height="60" preserveAspectRatio="xMidYMid meet" href="${DEFAULT_LOGO}" xlink:href="${DEFAULT_LOGO}" />

  <text x="70" y="260" fill="#0F172A" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="40" letter-spacing="-0.5">Elena Rostova</text>
  <text x="70" y="300" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="18" letter-spacing="1">SENIOR ARCHITECTURAL PARTNER</text>

  <!-- Architectural Coordinates -->
  <rect x="70" y="350" width="510" height="1" fill="#E2E8F0" />
  
  <text x="70" y="410" fill="#334155" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="19">elena@rostovagroup.com</text>
  <text x="70" y="450" fill="#334155" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="19">+1 (212) 555-0199</text>
  <text x="70" y="510" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="400" font-size="16">5th Avenue Atelier, Suite 1800 · Manhattan</text>
</svg>`,
  },
  {
    id: 'tech-minimal',
    name: 'Cupertino Clean',
    subtitle: 'High-Tech Minimalist',
    category: 'Technology & Startups',
    imageSlotCount: 2,
    description: 'Crisp white canvas with modern border and embedded company mark and founder slot.',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1050 600" width="1050" height="600">
  <defs>
    <clipPath id="tech-avatar-clip">
      <circle cx="160" cy="180" r="80" />
    </clipPath>
  </defs>

  <rect width="1050" height="600" rx="28" fill="#FFFFFF" />
  <rect x="2" y="2" width="1046" height="596" rx="26" fill="none" stroke="#E5E5EA" stroke-width="2" />

  <!-- Subtle corner accent line -->
  <line x1="80" y1="360" x2="970" y2="360" stroke="#F2F2F7" stroke-width="2" />

  <!-- SLOT 1: Founder Avatar Slot -->
  <circle cx="160" cy="180" r="84" fill="#F2F2F7" />
  <image id="avatar_founder" x="80" y="100" width="160" height="160" clip-path="url(#tech-avatar-clip)" preserveAspectRatio="xMidYMid slice" href="${DEFAULT_AVATAR}" xlink:href="${DEFAULT_AVATAR}" />

  <!-- SLOT 2: Brand Emblem Slot -->
  <image id="tech_emblem" x="810" y="100" width="160" height="80" preserveAspectRatio="xMidYMid meet" href="${DEFAULT_LOGO}" xlink:href="${DEFAULT_LOGO}" />

  <text x="280" y="165" fill="#1D1D1F" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="44">Sophia Sterling</text>
  <text x="280" y="210" fill="#86868B" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="22">Founder & Chief Executive Officer</text>

  <text x="80" y="440" fill="#1D1D1F" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="20">sophia@aurora-labs.io</text>
  <text x="80" y="480" fill="#86868B" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="400" font-size="18">+1 (650) 441-2099</text>

  <text x="440" y="440" fill="#0071E3" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="20">aurora-labs.io</text>
  <text x="440" y="480" fill="#86868B" font-family="-apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif" font-weight="400" font-size="18">Sand Hill Road · Menlo Park, CA</text>
</svg>`,
  },
];
