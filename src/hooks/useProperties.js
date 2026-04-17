import { useEffect, useState } from "react";
import { mockProperties } from "../mocks/properties";

export default function useProperties(page) {
    const [properties, setProperties] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        // simulate API call
        setTimeout(() => {
            setProperties(mockProperties);
            setTotalPages(1);
            setLoading(false);
        }, 500);
    }, [page]);

    return { properties, totalPages, loading };
}