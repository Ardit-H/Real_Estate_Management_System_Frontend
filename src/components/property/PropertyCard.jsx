export default function PropertyCard({ property }) {
    return (
        <div className="card">
            <img
                src={property.primary_image || "https://via.placeholder.com/300"}
                alt={property.title}
            />

            <div className="card-body">
                <h3>{property.title}</h3>

                <p>
                    {property.price} {property.currency}
                </p>

                <p>{property.city}, {property.country}</p>

                <p>
                    🛏 {property.bedrooms} | 🛁 {property.bathrooms}
                </p>

                <button>View Details</button>
            </div>
        </div>
    );
}