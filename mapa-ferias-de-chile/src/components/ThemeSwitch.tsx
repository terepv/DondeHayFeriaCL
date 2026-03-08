import React from 'react';
import { useTheme } from '../context/ThemeContext';

const W = 56;
const H = 28;
const R = H / 2;

/** Full sun SVG for the light-mode thumb: central disc + 8 rays (no white circle). */
const SunThumbSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <defs>
      <radialGradient id="sun-center" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="60%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#ea580c" stopOpacity="0.95" />
      </radialGradient>
      <linearGradient id="sun-ray" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    {/* Central disc */}
    <circle cx="8" cy="8" r="4" fill="url(#sun-center)" />
    {/* 8 triangular rays: base just outside circle (same gap for cardinals and diagonals) */}
    <path fill="url(#sun-ray)" d="M8 1 L9.5 3.4 L6.5 3.4 Z" />
    <path fill="url(#sun-ray)" d="M15 8 L12.6 6.5 L12.6 9.5 Z" />
    <path fill="url(#sun-ray)" d="M8 15 L6.5 12.6 L9.5 12.6 Z" />
    <path fill="url(#sun-ray)" d="M1 8 L3.4 6.5 L3.4 9.5 Z" />
    <path fill="url(#sun-ray)" d="M12.95 3.05 L10.47 4.11 L11.89 5.53 Z" />
    <path fill="url(#sun-ray)" d="M12.95 12.95 L11.89 10.47 L10.47 11.89 Z" />
    <path fill="url(#sun-ray)" d="M3.05 12.95 L4.11 10.47 L5.53 11.89 Z" />
    <path fill="url(#sun-ray)" d="M3.05 3.05 L4.11 5.53 L5.53 4.11 Z" />
  </svg>
);

/** Full moon SVG for the dark-mode thumb: circle with crater circles inside (no icon, no white circle). */
const MoonThumbSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <defs>
      <radialGradient id="moon-surface" cx="30%" cy="28%" r="75%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#94a3b8" />
      </radialGradient>
      <radialGradient id="crater-soft" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#64748b" stopOpacity="0.9" />
        <stop offset="70%" stopColor="#94a3b8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="crater-soft-med" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#475569" stopOpacity="0.85" />
        <stop offset="65%" stopColor="#64748b" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="crater-soft-big" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#475569" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#64748b" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Main full moon: lighter top-left, darker bottom-right (spherical) */}
    <circle cx="8" cy="8" r="6" fill="url(#moon-surface)" />
    {/* Craters: same distribution, slightly larger (proportions kept) */}
    <circle cx="5.2" cy="8.5" r="2.4" fill="url(#crater-soft-big)" />
    <circle cx="9.2" cy="4.1" r="1.55" fill="url(#crater-soft-med)" />
    <circle cx="4.4" cy="5.3" r="0.51" fill="url(#crater-soft)" />
    <circle cx="11.3" cy="6.2" r="1.02" fill="url(#crater-soft)" />
    <circle cx="9.5" cy="11.6" r="1.02" fill="url(#crater-soft)" />
  </svg>
);

export const ThemeSwitch: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full overflow-visible rounded-full drop-shadow-sm"
        aria-hidden
      >
        <defs>
          <linearGradient id="theme-day-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
          <linearGradient id="theme-night-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <clipPath id="theme-capsule-clip">
          <rect x="0" y="0" width={W} height={H} rx={R} ry={R} />
        </clipPath>
        <g clipPath="url(#theme-capsule-clip)">
          {/* Left: day sky with cumulus clouds (3 overlapping ellipses per cloud) */}
          <rect x="0" y="0" width={W / 2} height={H} fill="url(#theme-day-sky)" />
          <g fill="rgba(255,255,255,0.88)">
            <ellipse cx="20" cy="10" rx="2.8" ry="1.8" />
            <ellipse cx="24" cy="10.5" rx="2.5" ry="1.6" />
            <ellipse cx="22" cy="8.5" rx="2.4" ry="1.5" />
          </g>
          <g fill="rgba(255,255,255,0.92)">
            <ellipse cx="20" cy="21" rx="4" ry="2.4" />
            <ellipse cx="25" cy="20" rx="3.5" ry="2.2" />
            <ellipse cx="23" cy="22.5" rx="3.2" ry="2" />
          </g>
          <g fill="rgba(255,255,255,0.9)">
            <ellipse cx="7" cy="8" rx="3" ry="1.9" />
            <ellipse cx="11" cy="7" rx="2.6" ry="1.7" />
            <ellipse cx="9" cy="9.5" rx="2.5" ry="1.6" />
          </g>
          <g fill="rgba(255,255,255,0.9)">
            <ellipse cx="5" cy="22" rx="3.2" ry="2" />
            <ellipse cx="9" cy="21" rx="2.8" ry="1.8" />
            <ellipse cx="7" cy="23.5" rx="2.6" ry="1.7" />
          </g>
          {/* Right: night sky with stars only (no moon) */}
          <rect x={W / 2} y="0" width={W / 2} height={H} fill="url(#theme-night-sky)" />
          <circle cx="32" cy="8" r="0.5" fill="#fff" />
          <circle cx="38" cy="12" r="0.4" fill="#fff" />
          <circle cx="44" cy="7" r="0.55" fill="#fff" />
          <circle cx="50" cy="11" r="0.35" fill="#fff" />
          <circle cx="35" cy="18" r="0.4" fill="#fff" />
          <circle cx="42" cy="20" r="0.5" fill="#fff" />
          <circle cx="48" cy="16" r="0.3" fill="#fff" />
          <circle cx="52" cy="6" r="0.25" fill="#fff" />
        </g>
      </svg>
      {/* Sliding thumb: full sun (light mode) or full moon with craters (dark mode) */}
      <span
        className={`absolute left-0.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-300 ease-out ${
          isDark ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <MoonThumbSVG className="h-full w-full drop-shadow-md" />
        ) : (
          <SunThumbSVG className="h-full w-full drop-shadow-md" />
        )}
      </span>
    </button>
  );
};
