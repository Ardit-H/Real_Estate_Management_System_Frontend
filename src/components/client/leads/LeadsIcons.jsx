const Ico = (d, w = 15, sw = 1.8) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
 
export const PlusIcon       = () => Ico(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>, 14, 2.2);
export const HomeIcon       = () => Ico(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, 14);
export const TagIcon        = () => Ico(<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>, 14);
export const KeyIcon        = () => Ico(<><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2 10.58 12.42M13 7l3 3M18 2l3 3-6 6-3-3"/></>, 14);
export const ChartIcon      = () => Ico(<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>, 14);
export const CalendarIcon   = () => Ico(<><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, 13);
export const UserIcon       = () => Ico(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>, 13);
export const PinIcon        = () => Ico(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>, 12);
export const AreaIcon       = () => Ico(<><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/></>, 13);
export const BedIcon        = () => Ico(<><path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 20V8l-4-4H6L2 8"/><path d="M6 8v4"/><path d="M18 8v4"/></>, 13);
export const ArrowRightIcon = () => Ico(<><path d="m9 18 6-6-6-6"/></>, 13, 2.2);
export const ClockIcon      = () => Ico(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, 13);
 
export const TYPE_ICON = {
  SELL:      <TagIcon />,
  RENT:      <KeyIcon />,
  VALUATION: <ChartIcon />,
};
 