import React from "react";
import { useLanguage } from "../lib/LanguageContext";

export interface AyngalLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "full" | "icon" | "horizontal";
  showSubtitle?: boolean;
}

export const AyngalLogo: React.FC<AyngalLogoProps> = ({
  className = "",
  size = "md",
  variant = "horizontal",
  showSubtitle = true
}) => {
  const { isAr } = useLanguage();

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    full: "w-36 h-36"
  };

  const IconSVG = (
    <svg
      viewBox="0 0 500 500"
      className={`${iconSizes[size]} shrink-0 drop-shadow-sm select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ayngalGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F6E7B9" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA7C11" />
          <stop offset="100%" stopColor="#C59B27" />
        </linearGradient>

        <linearGradient id="ayngalNavy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A3A60" />
          <stop offset="50%" stopColor="#0E294B" />
          <stop offset="100%" stopColor="#081A32" />
        </linearGradient>

        <linearGradient id="ayngalTeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        <linearGradient id="ayngalWaveNavy" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#081A32" />
          <stop offset="50%" stopColor="#0E294B" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        <filter id="ayngalDrop" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#081A32" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Outer Architectural Medallion Frame */}
      <g filter="url(#ayngalDrop)">
        {/* Outer Ring Base */}
        <circle cx="250" cy="230" r="160" fill="#0E294B" stroke="url(#ayngalGold)" strokeWidth="4" />
        <circle cx="250" cy="230" r="148" fill="#FAF8F5" stroke="url(#ayngalGold)" strokeWidth="2" />
        <circle cx="250" cy="230" r="142" fill="none" stroke="#0E294B" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

        {/* Traditional Crest & Points */}
        <g transform="translate(250, 230)">
          {/* Top Crest Crown */}
          <path d="M 0 -160 L 10 -178 L 0 -192 L -10 -178 Z" fill="url(#ayngalGold)" stroke="#0E294B" strokeWidth="1.5" />
          <circle cx="0" cy="-176" r="3" fill="#0E294B" />

          {/* Perimeter Accent Diamond Points */}
          <path d="M 160 0 L 175 6 L 160 12 Z" fill="url(#ayngalGold)" />
          <path d="M -160 0 L -175 6 L -160 12 Z" fill="url(#ayngalGold)" />
          <path d="M 0 160 L 6 175 L -6 175 Z" fill="url(#ayngalGold)" />
          <path d="M 113 -113 L 126 -122 L 120 -110 Z" fill="url(#ayngalGold)" />
          <path d="M -113 -113 L -126 -122 L -120 -110 Z" fill="url(#ayngalGold)" />
          <path d="M 113 113 L 124 122 L 112 124 Z" fill="url(#ayngalGold)" />
          <path d="M -113 113 L -124 122 L -112 124 Z" fill="url(#ayngalGold)" />

          {/* Geometric Lattice Ring Filigree */}
          <circle cx="0" cy="0" r="128" fill="none" stroke="url(#ayngalGold)" strokeWidth="1.5" opacity="0.7" />
          <path
            d="M -90 -90 L -70 -105 L -50 -90 L -30 -105 L -10 -90 L 10 -105 L 30 -90 L 50 -105 L 70 -90 L 90 -105"
            stroke="url(#ayngalGold)"
            strokeWidth="1.2"
            fill="none"
            opacity="0.45"
          />
        </g>

        {/* Interior Sky/White Canvas */}
        <circle cx="250" cy="230" r="124" fill="#FFFFFF" />

        {/* Central Suspension Bridge Arch */}
        <path
          d="M 120 270 C 145 130, 355 130, 380 270 C 350 255, 335 160, 250 160 C 165 160, 150 255, 120 270 Z"
          fill="url(#ayngalGold)"
          stroke="#0E294B"
          strokeWidth="2"
        />

        {/* Cable Stays */}
        <line x1="250" y1="160" x2="145" y2="265" stroke="url(#ayngalGold)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="250" y1="160" x2="170" y2="262" stroke="url(#ayngalGold)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="250" y1="160" x2="195" y2="260" stroke="url(#ayngalGold)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="250" y1="160" x2="220" y2="258" stroke="url(#ayngalGold)" strokeWidth="2.2" strokeLinecap="round" />

        <line x1="250" y1="160" x2="355" y2="265" stroke="url(#ayngalGold)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="250" y1="160" x2="330" y2="262" stroke="url(#ayngalGold)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="250" y1="160" x2="305" y2="260" stroke="url(#ayngalGold)" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="250" y1="160" x2="280" y2="258" stroke="url(#ayngalGold)" strokeWidth="2.2" strokeLinecap="round" />

        {/* Crown Tower of Arch */}
        <polygon points="250,140 256,155 244,155" fill="url(#ayngalGold)" stroke="#0E294B" strokeWidth="1.5" />

        {/* Golden Map of Ethiopia (Heart of the Arch) */}
        <g transform="translate(225, 185) scale(0.65)">
          <path
            d="M 38 5 
               C 45 4, 52 10, 58 14 
               C 65 18, 74 15, 82 20 
               C 88 24, 94 30, 92 38 
               C 90 46, 82 52, 78 58 
               C 74 65, 76 72, 70 78 
               C 62 85, 52 90, 42 92 
               C 34 94, 25 88, 18 84 
               C 12 80, 8 72, 6 64 
               C 4 56, 8 48, 12 40 
               C 16 32, 22 24, 26 16 
               C 30 10, 34 6, 38 5 Z"
            fill="url(#ayngalGold)"
            stroke="#0E294B"
            strokeWidth="2"
          />
          <path d="M 28 28 L 68 68 M 68 28 L 28 68" stroke="#0E294B" strokeWidth="1" opacity="0.45" />
          <path d="M 48 18 L 48 78 M 18 48 L 78 48" stroke="#0E294B" strokeWidth="1" opacity="0.45" />
          <circle cx="48" cy="48" r="8" fill="none" stroke="#0E294B" strokeWidth="1.2" opacity="0.6" />
        </g>

        {/* Dynamic Ocean Trade Waves & Logistics Flow */}
        <path d="M 110 270 Q 250 250 390 270 Q 250 262 110 270 Z" fill="url(#ayngalGold)" />

        {/* Teal Dynamic Trade Wave */}
        <path
          d="M 125 272 
             C 170 275, 220 285, 275 282 
             C 325 280, 360 270, 395 260 
             L 378 252 
             L 395 260 
             L 375 270 
             C 345 278, 310 292, 260 294 
             C 210 296, 160 284, 125 272 Z"
          fill="url(#ayngalTeal)"
        />

        {/* Deep Navy Primary Trade Wave */}
        <path
          d="M 135 288 
             C 180 292, 225 310, 275 308 
             C 315 306, 345 292, 380 278 
             L 362 272 
             L 380 278 
             L 364 288 
             C 335 302, 300 320, 255 320 
             C 210 320, 170 304, 135 288 Z"
          fill="url(#ayngalWaveNavy)"
        />

        {/* Cyan Flow Wave */}
        <path
          d="M 160 306 
             C 200 312, 235 332, 280 330 
             C 320 328, 350 312, 375 296 
             C 345 318, 305 342, 260 342 
             C 220 342, 185 324, 160 306 Z"
          fill="url(#ayngalTeal)"
          opacity="0.9"
        />

        {/* Foundation Wave */}
        <path
          d="M 190 328 
             C 225 334, 250 350, 285 348 
             C 310 346, 335 334, 355 320 
             C 330 338, 300 358, 265 358 
             C 235 358, 210 344, 190 328 Z"
          fill="#0E294B"
        />

        {/* Bottom Diamond Accent */}
        <polygon points="250,380 258,390 250,400 242,390" fill="url(#ayngalGold)" stroke="#0E294B" strokeWidth="1.2" />
      </g>
    </svg>
  );

  if (variant === "icon") {
    return <div className={`inline-flex items-center justify-center ${className}`}>{IconSVG}</div>;
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center text-center p-4 ${className}`}>
        {IconSVG}

        {/* Primary Name */}
        <div className="mt-3">
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-wider text-[#0E294B]">
            AYNGAL
          </h1>
          <p className="text-base sm:text-lg font-bold text-[#0E294B] mt-0.5" dir="rtl">
            جسر التجارة مع إثيوبيا
          </p>
          <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-[#0284C7] mt-0.5 uppercase">
            تسهيل التجارة - TRADE FACILITATION
          </p>
        </div>

        {/* Decorative Golden Divider */}
        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-3" />

        {/* Subtitle / Description */}
        {showSubtitle && (
          <p className="text-xs sm:text-sm font-medium text-stone-600 max-w-sm leading-relaxed" dir="rtl">
            {isAr
              ? "المنصة الرسمية المعتمدة لتوظيف الكفاءات وتسهيل التبادل التجاري والخدمات اللوجستية مع إثيوبيا"
              : "Official Platform for Recruitment, Trade Facilitation & Logistics Bridge with Ethiopia"}
          </p>
        )}
      </div>
    );
  }

  // Horizontal variant for TopBar, Header, Drawer, and Card headers
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 ${className}`}>
      {IconSVG}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-serif font-black text-lg sm:text-xl tracking-wider text-inherit">
            AYNGAL
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#D4AF37]" dir="rtl">
            جسر التجارة مع إثيوبيا
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] sm:text-[11px] font-medium opacity-85 truncate max-w-[200px] sm:max-w-md uppercase tracking-wider text-[#38BDF8]">
            تسهيل التجارة - TRADE FACILITATION
          </p>
        )}
      </div>
    </div>
  );
};
