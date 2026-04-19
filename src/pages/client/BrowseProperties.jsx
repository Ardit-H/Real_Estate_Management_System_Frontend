import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/layout/Layout";
import api from "../../api/axios";

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
  </svg>
);
const BedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M22 8H2"/><path d="M22 20V8l-4-4H6L2 8"/><path d="M6 8v4"/><path d="M18 8v4"/>
  </svg>
);
const BathIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>
    <line x1="10" y1="5" x2="8" y2="7"/><line x1="2" y1="12" x2="22" y2="12"/>
  </svg>
);
const AreaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "VILLA", "COMMERCIAL", "LAND", "OFFICE"];
const LISTING_TYPES  = ["SALE", "RENT", "BOTH"];
const PAGE_SIZE      = 12;

const DEFAULT_FILTERS = {
  minPrice: "", maxPrice: "",
  minBedrooms: "", maxBedrooms: "",
  minBathrooms: "",
  minArea: "", maxArea: "",
  city: "", country: "",
  type: "", listingType: "",
  status: "AVAILABLE",
  isFeatured: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (price, currency = "EUR") => {
  if (!price) return "–";
  return new Intl.NumberFormat("en-EU", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(price);
};

const typeLabel = (type) => ({
  APARTMENT: "Apartment", HOUSE: "House", VILLA: "Villa",
  COMMERCIAL: "Commercial", LAND: "Land", OFFICE: "Office",
}[type] || type);

const listingBadge = (type) => ({
  SALE: { label: "For Sale",    color: "#2a6049" },
  RENT: { label: "For Rent",    color: "#5a3e2b" },
  BOTH: { label: "Sale / Rent", color: "#3a3a6b" },
}[type] || { label: type, color: "#555" });

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect fill='%23e8e4da' width='400' height='260'/%3E%3Cpath d='M160 180 L200 120 L240 180Z' fill='%23c5bfaf'/%3E%3Crect x='175' y='155' width='50' height='25' fill='%23b0a894'/%3E%3C/svg%3E";

const gridStyle = (mode) => ({
  display: mode === "grid" ? "grid" : "flex",
  gridTemplateColumns: mode === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : undefined,
  flexDirection: mode === "list" ? "column" : undefined,
  gap: "16px",
});

// ─── Property Card ─────────────────────────────────────────────────────────────
function PropertyCard({ property, viewMode }) {
  const badge  = listingBadge(property.listing_type);
  const imageSrc =
  property.primaryImage ||
  property.primary_image ||
  property.imageUrl;

const img = imageSrc
  ? (imageSrc.startsWith("http")
      ? imageSrc
      : BASE_URL + imageSrc)
  : PLACEHOLDER;
  const isGrid = viewMode === "grid";
  console.log("PROPERTY:", property);

  return (
    <div
      style={{
        background: "#fff", borderRadius: "14px", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(90,95,58,0.10)", cursor: "pointer",
        display: isGrid ? "block" : "flex",
        transition: "transform 0.18s, box-shadow 0.18s",
        border: "1px solid #ede9df",
        minHeight: isGrid ? "auto" : "160px",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(90,95,58,0.18)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(90,95,58,0.10)";
      }}
    >
      {/* Image */}
      <div style={{
        position: "relative",
        width: isGrid ? "100%" : "220px",
        minWidth: isGrid ? "auto" : "220px",
        height: isGrid ? "200px" : "100%",
        minHeight: isGrid ? "200px" : "160px",
        background: "#f0ece3", flexShrink: 0,
      }}>
        <img
          src={img} alt={property.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.src = PLACEHOLDER; }}
        />
        <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "6px" }}>
          <span style={{
            background: badge.color, color: "#fff", fontSize: "11px", fontWeight: 700,
            padding: "3px 9px", borderRadius: "20px", letterSpacing: "0.4px",
          }}>{badge.label}</span>
          {property.is_featured && (
            <span style={{
              background: "#c9a84c", color: "#fff", fontSize: "11px", fontWeight: 700,
              padding: "3px 8px", borderRadius: "20px",
              display: "flex", alignItems: "center", gap: "3px",
            }}>
              <StarIcon /> Featured
            </span>
          )}
        </div>
        <span style={{
          position: "absolute", bottom: "10px", right: "10px",
          background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "11px",
          padding: "2px 8px", borderRadius: "8px", backdropFilter: "blur(4px)",
        }}>{typeLabel(property.type)}</span>
      </div>

      {/* Content */}
      <div style={{
        padding: isGrid ? "16px" : "16px 20px",
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div>
          {(property.city || property.country) && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#8a8469", fontSize: "12px", marginBottom: "6px" }}>
              <LocationIcon />
              <span>{[property.city, property.country].filter(Boolean).join(", ")}</span>
            </div>
          )}
          <h3 style={{
            margin: "0 0 8px", fontSize: isGrid ? "15px" : "16px", fontWeight: 700,
            color: "#2c2c1e", lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>{property.title}</h3>
          <div style={{ fontSize: isGrid ? "18px" : "20px", fontWeight: 800, color: "#5a5f3a", marginBottom: "10px" }}>
            {formatPrice(property.price, property.currency)}
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", color: "#6b6651", fontSize: "12.5px", flexWrap: "wrap" }}>
          {property.bedrooms  != null && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <BedIcon /> {property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}
            </span>
          )}
          {property.bathrooms != null && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <BathIcon /> {property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}
            </span>
          )}
          {property.area_sqm  != null && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <AreaIcon /> {property.area_sqm} m²
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Number Selector ──────────────────────────────────────────────────────────
function NumberSelector({ label, filterKey, filters, setFilters, max = 8 }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={S.filterLabel}>{label}</label>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        <button
          onClick={() => setFilters(f => ({ ...f, [filterKey]: "" }))}
          style={{ ...S.numBtn, background: filters[filterKey] === "" ? "#5a5f3a" : "#f0ece3", color: filters[filterKey] === "" ? "#fff" : "#5a5f3a" }}
        >Any</button>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => setFilters(f => ({ ...f, [filterKey]: n }))}
            style={{ ...S.numBtn, background: Number(filters[filterKey]) === n ? "#5a5f3a" : "#f0ece3", color: Number(filters[filterKey]) === n ? "#fff" : "#5a5f3a" }}
          >{n}+</button>
        ))}
      </div>
    </div>
  );
}

// ─── Range Input ──────────────────────────────────────────────────────────────
function RangeInput({ label, minKey, maxKey, filters, setFilters, ph = ["Min", "Max"] }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={S.filterLabel}>{label}</label>
      <div style={{ display: "flex", gap: "8px" }}>
        <input type="number" min="0" placeholder={ph[0]} value={filters[minKey]}
          onChange={e => setFilters(f => ({ ...f, [minKey]: e.target.value }))}
          style={S.filterInput} />
        <input type="number" min="0" placeholder={ph[1]} value={filters[maxKey]}
          onChange={e => setFilters(f => ({ ...f, [maxKey]: e.target.value }))}
          style={S.filterInput} />
      </div>
    </div>
  );
}

// ─── Filter Sidebar ────────────────────────────────────────────────────────────
function FilterSidebar({ filters, setFilters, onApply, onReset }) {
  return (
    <aside style={{
      width: "270px", minWidth: "270px", background: "#faf8f3",
      borderRadius: "14px", border: "1px solid #e5e0d4",
      padding: "22px 18px", height: "fit-content",
      position: "sticky", top: "24px",
      maxHeight: "calc(100vh - 48px)", overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", fontWeight: 700, color: "#2c2c1e", fontSize: "15px" }}>
          <FilterIcon /> Filters
        </div>
        <button onClick={onReset} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8469", fontSize: "12px", textDecoration: "underline", fontFamily: "inherit" }}>
          Reset all
        </button>
      </div>

      {/* Listing Type */}
      <div style={{ marginBottom: "16px" }}>
        <label style={S.filterLabel}>Listing Type</label>
        <div style={{ display: "flex", gap: "6px" }}>
          {["", ...LISTING_TYPES].map(lt => (
            <button key={lt} onClick={() => setFilters(f => ({ ...f, listingType: lt }))}
              style={{
                flex: 1, padding: "6px 4px", borderRadius: "8px", border: "1.5px solid",
                borderColor: filters.listingType === lt ? "#5a5f3a" : "#d9d4c7",
                background:  filters.listingType === lt ? "#5a5f3a" : "#fff",
                color:       filters.listingType === lt ? "#fff"    : "#5a5f3a",
                cursor: "pointer", fontSize: "11.5px", fontWeight: 600,
                transition: "all 0.15s", fontFamily: "inherit",
              }}>
              {lt === "" ? "All" : lt === "SALE" ? "Sale" : lt === "RENT" ? "Rent" : "Both"}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div style={{ marginBottom: "16px" }}>
        <label style={S.filterLabel}>Property Type</label>
        <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} style={S.select}>
          <option value="">All Types</option>
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </select>
      </div>

      {/* City */}
      <div style={{ marginBottom: "16px" }}>
        <label style={S.filterLabel}>City</label>
        <input type="text" placeholder="e.g. Tirana" value={filters.city}
          onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
          style={S.filterInputFull} />
      </div>

      <RangeInput label="Price (EUR)" minKey="minPrice" maxKey="maxPrice" filters={filters} setFilters={setFilters} ph={["Min €", "Max €"]} />
      <NumberSelector label="Min. Bedrooms"  filterKey="minBedrooms"  filters={filters} setFilters={setFilters} />
      <NumberSelector label="Min. Bathrooms" filterKey="minBathrooms" filters={filters} setFilters={setFilters} max={5} />
      <RangeInput label="Area (m²)" minKey="minArea" maxKey="maxArea" filters={filters} setFilters={setFilters} ph={["Min m²", "Max m²"]} />

      {/* Featured */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#4a4a36", fontSize: "13px" }}>
          <input type="checkbox" checked={filters.isFeatured === true}
            onChange={e => setFilters(f => ({ ...f, isFeatured: e.target.checked ? true : "" }))}
            style={{ accentColor: "#5a5f3a", width: "16px", height: "16px" }} />
          <span style={{ fontWeight: 600 }}>Featured only</span>
        </label>
      </div>

      <button onClick={onApply} style={S.applyBtn}>Apply Filters</button>
    </aside>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages   = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "36px", flexWrap: "wrap" }}>
      <button disabled={page === 0} onClick={() => onChange(page - 1)} style={S.pageBtn(false, page === 0)}>‹</button>
      {visible.map((p, i) => {
        const gap = visible[i - 1] != null && p - visible[i - 1] > 1;
        return (
          <span key={p} style={{ display: "flex", gap: "6px" }}>
            {gap && <span style={{ padding: "6px 4px", color: "#8a8469" }}>…</span>}
            <button onClick={() => onChange(p)} style={S.pageBtn(p === page, false)}>{p + 1}</button>
          </span>
        );
      })}
      <button disabled={page === totalPages - 1} onClick={() => onChange(page + 1)} style={S.pageBtn(false, page === totalPages - 1)}>›</button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ viewMode }) {
  return (
    <div style={gridStyle(viewMode)}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{
          background: "#f0ece3", borderRadius: "14px",
          height: viewMode === "grid" ? "320px" : "160px",
          animation: "pulse 1.4s ease-in-out infinite",
        }} />
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BrowseProperties() {
  const [properties,     setProperties]     = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);
  const [page,           setPage]           = useState(0);
  const [totalPages,     setTotalPages]     = useState(0);
  const [totalElements,  setTotalElements]  = useState(0);
  const [viewMode,       setViewMode]       = useState("grid");
  const [mode,           setMode]           = useState("filter");

  // ── GET /api/properties/filter ────────────────────────────────────────────
  const fetchFiltered = useCallback(async (f, pg = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pg, size: PAGE_SIZE };;

      if (f.minPrice)     params.minPrice     = f.minPrice;
if (f.maxPrice)     params.maxPrice     = f.maxPrice;

if (f.minBedrooms)  params.minBedrooms  = f.minBedrooms;
if (f.maxBedrooms)  params.maxBedrooms  = f.maxBedrooms;

if (f.minBathrooms) params.minBathrooms = f.minBathrooms;

if (f.minArea)      params.minArea      = f.minArea;
if (f.maxArea)      params.maxArea      = f.maxArea;

if (f.city)         params.city         = f.city;
if (f.country)      params.country      = f.country;

if (f.type)         params.type         = f.type;

if (f.listingType)  params.listingType  = f.listingType;

if (f.isFeatured)   params.isFeatured   = true;

      const res  = await api.get("/api/properties/filter", { params });
      const data = res.data;

      setProperties(data.content || []);
      setTotalPages(data.totalPages    ?? data.total_pages    ?? 0);
      setTotalElements(data.totalElements ?? data.total_elements ?? 0);
      setPage(pg);
    } catch {
      setError("Could not load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── GET /api/properties/search ────────────────────────────────────────────
  const fetchSearch = useCallback(async (keyword, pg = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await api.get("/api/properties/search", {
        params: { keyword, page: pg, size: PAGE_SIZE, sort: "createdAt,desc" },
      });
      const data = res.data;

      setProperties(data.content || []);
      setTotalPages(data.totalPages    ?? data.total_pages    ?? 0);
      setTotalElements(data.totalElements ?? data.total_elements ?? 0);
      setPage(pg);
    } catch {
      setError("Could not load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiltered(DEFAULT_FILTERS, 0); }, [fetchFiltered]);

  const handleSearch = () => {
    if (searchQuery.trim()) { setMode("search"); fetchSearch(searchQuery.trim(), 0); }
    else                    { setMode("filter"); fetchFiltered(filters, 0); }
  };

  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    setMode("filter");
    setSearchQuery("");
    fetchFiltered(pendingFilters, 0);
  };

  const handleResetFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setMode("filter");
    setSearchQuery("");
    fetchFiltered(DEFAULT_FILTERS, 0);
  };

  const handlePageChange = (p) => {
    mode === "search" && searchQuery.trim()
      ? fetchSearch(searchQuery.trim(), p)
      : fetchFiltered(filters, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k !== "status" && v !== "" && v !== null && v !== undefined && v !== false
  ).length;

  return (
    <MainLayout role="client">
      <div style={{ background: "#f5f2eb", minHeight: "100vh", fontFamily: "'Georgia', serif" }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #5a5f3a 0%, #3d4228 100%)", padding: "48px 32px 40px", textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: "32px", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            Find Your Perfect Property
          </h1>
          <p style={{ margin: "0 0 24px", color: "#c8ccaa", fontSize: "15px" }}>
            Browse thousands of listings — apartments, villas, offices and more.
          </p>
          <div style={{ display: "flex", gap: "10px", maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "#fff", borderRadius: "10px", padding: "10px 14px" }}>
              <span style={{ color: "#8a8469", flexShrink: 0 }}><SearchIcon /></span>
              <input
                type="text" placeholder="Search city, title, keyword…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                style={{ flex: 1, border: "none", outline: "none", fontSize: "14.5px", color: "#2c2c1e", background: "transparent", fontFamily: "inherit" }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setMode("filter"); fetchFiltered(filters, 0); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8469", padding: "0 4px" }}>
                  <CloseIcon />
                </button>
              )}
            </div>
            <button onClick={handleSearch} style={{
              display: "flex", alignItems: "center", gap: "7px",
              background: "#a3a380", color: "#1f1f1f",
              border: "none", borderRadius: "10px", padding: "10px 20px",
              fontSize: "14px", fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", fontFamily: "inherit",
            }}>
              <SearchIcon /> Search
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 24px", maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

            <FilterSidebar
              filters={pendingFilters}
              setFilters={setPendingFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />

            <main style={{ flex: 1, minWidth: 0 }}>
              {/* Toolbar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ color: "#8a8469", fontSize: "13.5px" }}>
                    {loading ? "Loading…" : `${totalElements.toLocaleString()} propert${totalElements !== 1 ? "ies" : "y"} found`}
                  </span>
                  {activeFilterCount > 0 && (
                    <button onClick={handleResetFilters} style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      background: "#fff0f0", color: "#c0392b",
                      border: "1px solid #f5c6c6", borderRadius: "8px",
                      padding: "5px 12px", fontSize: "12.5px",
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      Clear filters <CloseIcon />
                    </button>
                  )}
                  {mode === "search" && searchQuery && (
                    <span style={{
                      background: "#edf2e8", color: "#5a5f3a",
                      border: "1px solid #c8d4b0", borderRadius: "8px",
                      padding: "4px 10px", fontSize: "12.5px",
                    }}>
                      Results for: <strong>{searchQuery}</strong>
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[{ m: "grid", icon: <GridIcon /> }, { m: "list", icon: <ListIcon /> }].map(({ m, icon }) => (
                    <button key={m} onClick={() => setViewMode(m)} style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "7px 10px", borderRadius: "8px", border: "none",
                      background: viewMode === m ? "#5a5f3a" : "#f0ece3",
                      color:      viewMode === m ? "#fff"    : "#5a5f3a",
                      cursor: "pointer", transition: "all 0.15s",
                    }}>{icon}</button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "#fff5f5", border: "1px solid #fecaca",
                  borderRadius: "10px", padding: "14px 18px",
                  color: "#c0392b", fontSize: "14px", marginBottom: "16px",
                  display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
                }}>
                  <strong>Error:</strong> {error}
                  <button
                    onClick={() => mode === "search" ? fetchSearch(searchQuery, page) : fetchFiltered(filters, page)}
                    style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontSize: "12.5px", fontFamily: "inherit" }}
                  >Retry</button>
                </div>
              )}

              {loading && <Skeleton viewMode={viewMode} />}

              {!loading && !error && properties.length === 0 && (
                <div style={{ textAlign: "center", padding: "64px 32px", color: "#8a8469" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏠</div>
                  <h3 style={{ color: "#5a5f3a", margin: "0 0 8px" }}>No properties found</h3>
                  <p style={{ margin: "0 0 16px" }}>Try adjusting your filters or search terms.</p>
                  <button onClick={handleResetFilters} style={{ ...S.applyBtn, width: "auto", padding: "10px 24px" }}>
                    Clear all filters
                  </button>
                </div>
              )}

              {!loading && properties.length > 0 && (
                <>
                  <div style={gridStyle(viewMode)}>
                    {properties.map(p => (
                      <PropertyCard key={p.id} property={p} viewMode={viewMode} />
                    ))}
                  </div>
                  <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
      `}</style>
    </MainLayout>
  );
}

// ─── Styles object ────────────────────────────────────────────────────────────
const S = {
  filterLabel: {
    display: "block", fontSize: "11.5px", fontWeight: 700,
    color: "#6b6651", textTransform: "uppercase",
    letterSpacing: "0.6px", marginBottom: "7px",
  },
  filterInput: {
    flex: 1, padding: "8px 10px", borderRadius: "8px",
    border: "1.5px solid #d9d4c7", fontSize: "13px",
    color: "#2c2c1e", background: "#fff", outline: "none",
    fontFamily: "inherit", width: "100%",
  },
  filterInputFull: {
    width: "100%", padding: "8px 10px", borderRadius: "8px",
    border: "1.5px solid #d9d4c7", fontSize: "13px",
    color: "#2c2c1e", background: "#fff", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  },
  select: {
    width: "100%", padding: "8px 10px", borderRadius: "8px",
    border: "1.5px solid #d9d4c7", fontSize: "13px",
    color: "#2c2c1e", background: "#fff", outline: "none",
    fontFamily: "inherit", cursor: "pointer", boxSizing: "border-box",
  },
  numBtn: {
    padding: "5px 10px", borderRadius: "7px",
    border: "1.5px solid #d9d4c7", cursor: "pointer",
    fontSize: "12px", fontWeight: 600,
    transition: "all 0.15s", fontFamily: "inherit",
  },
  applyBtn: {
    width: "100%", padding: "11px",
    background: "#5a5f3a", color: "#fff",
    border: "none", borderRadius: "10px",
    fontSize: "14px", fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit",
  },
  pageBtn: (active, disabled) => ({
    padding: "7px 13px", borderRadius: "8px", border: "1.5px solid",
    borderColor: active   ? "#5a5f3a" : "#d9d4c7",
    background:  active   ? "#5a5f3a" : "#fff",
    color:       active   ? "#fff" : disabled ? "#c5bfaf" : "#5a5f3a",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "13px", fontWeight: active ? 700 : 400,
    fontFamily: "inherit", transition: "all 0.15s",
  }),
};
