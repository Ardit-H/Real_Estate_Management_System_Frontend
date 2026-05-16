

export function getFullName(u) {
  if (!u) return "";
  const first = u.first_name || "";
  const last  = u.last_name  || "";
  return `${first} ${last}`.trim() || u.email || "";
}

export function getInitials(u) {
  const name = getFullName(u);
  if (!name) return "??";
  return name.trim().split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

export function fmtDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtBudget(val) {
  if (!val) return null;
  const n = parseFloat(val);
  if (isNaN(n)) return null;
  if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `€${(n / 1000).toFixed(0)}K`;
  return `€${n}`;
}