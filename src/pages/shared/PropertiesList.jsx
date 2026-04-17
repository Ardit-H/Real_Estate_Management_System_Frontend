import { useState } from "react";
import useProperties from "../../hooks/useProperties";
import PropertyCard from "../../components/property/PropertyCard";

export default function PropertiesList() {
    const [page, setPage] = useState(0);

    const { properties = [], totalPages = 0, loading } = useProperties(page);

    return (
        <div className="container">
            <h1>All Properties</h1>

            {loading && <p>Loading...</p>}

            {!loading && properties.length === 0 && (
                <p>No properties found.</p>
            )}

            {/* GRID */}
            <div className="grid">
                {properties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                ))}
            </div>

            {/* PAGINATION */}
            <div className="pagination">
                <button
                    disabled={page === 0}
                    onClick={() => setPage((prev) => prev - 1)}
                >
                    Prev
                </button>

                <span>
                    Page {page + 1} / {totalPages}
                </span>

                <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}