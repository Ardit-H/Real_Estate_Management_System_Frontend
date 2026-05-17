export const BASE_URL    = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23ede9df' width='400' height='300'/%3E%3Cpath d='M160 195 L200 135 L240 195Z' fill='%23d4cfc3'/%3E%3Crect x='180' y='165' width='40' height='30' fill='%23c4bfb0'/%3E%3C/svg%3E";
export const PAGE_SIZE   = 12;

export const fmtPrice = (p, c="EUR") => p ? new Intl.NumberFormat("en-EU",{style:"currency",currency:c,maximumFractionDigits:0}).format(p) : "–";
export const typeLbl  = t => ({APARTMENT:"Apartment",HOUSE:"House",VILLA:"Villa",COMMERCIAL:"Commercial",LAND:"Land",OFFICE:"Office"}[t]||t||"–");

export const BADGE = {
  SALE: { label:"For Sale",    dot:"#e2c97e", bg:"rgba(20,16,10,0.72)" },
  RENT: { label:"For Rent",    dot:"#7eb8a4", bg:"rgba(20,16,10,0.72)" },
  BOTH: { label:"Sale & Rent", dot:"#a4b07e", bg:"rgba(20,16,10,0.72)" },
};

export const getBadge = t => BADGE[t] || { label:t||"–", dot:"#9a8c6e", bg:"rgba(20,16,10,0.72)" };
export const buildImg = src => src ? (src.startsWith("http")?src:BASE_URL+src) : null;