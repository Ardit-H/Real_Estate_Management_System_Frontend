export const BASE_URL = "http://localhost:8080";

export const STATUS_CONFIG = {
  AVAILABLE: { label: "Available", cls: "badge--green"  },
  SOLD:      { label: "Sold",      cls: "badge--red"    },
  RENTED:    { label: "Rented",    cls: "badge--blue"   },
  PENDING:   { label: "Pending",   cls: "badge--amber"  },
  INACTIVE:  { label: "Inactive",  cls: "badge--gray"   },
};

export const TYPE_OPTIONS    = ["APARTMENT","HOUSE","VILLA","COMMERCIAL","LAND","OFFICE"];
export const LISTING_OPTIONS = ["SALE","RENT","BOTH"];
export const FEATURE_OPTIONS = ["parking","pool","furnished","elevator","balcony","garden","gym","security","air_conditioning","storage","fireplace"];
export const TYPE_ICONS      = { APARTMENT:"🏢", HOUSE:"🏠", VILLA:"🏡", COMMERCIAL:"🏪", LAND:"🌿", OFFICE:"🏛️" };

export const fmtPrice = (p, c = "EUR") =>
  `${c} ${Number(p || 0).toLocaleString("en-US")}`;