// src/hooks/useUrlQueryFilters.js
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// export const useUrlSyncedFilters = (initialFilters) => {
//     const [searchParams, setSearchParams] = useSearchParams();
//     const navigate = useNavigate();

//     // Helper: parse URL params
//     const parseFiltersFromUrl = () => {
//         const filters = {};
//         for (const [key, value] of searchParams.entries()) {
//             try {
//                 filters[key] = JSON.parse(value);
//             } catch (e) {
//                 filters[key] = value;
//             }
//         }

//         return Object.keys(filters).length > 0 ? filters : initialFilters;
//     };

//     const [filters, setFilters] = useState(parseFiltersFromUrl);

//     useEffect(() => {
//         const newParams = {};

//         for (const key in filters) {
//             const value = filters[key];
//             if (value === '' || value === null || value === undefined || value === 'All') continue;
//             if (typeof value === 'object' && !Array.isArray(value)) {
//                 if (key === 'dateRange') {
//                     const { startDate, endDate } = value;
//                     if (startDate) newParams.startDate = startDate;
//                     if (endDate) newParams.endDate = endDate;
//                 }
//             } else {
//                 newParams[key] = value;
//             }
//         }

//         navigate({ search: new URLSearchParams(newParams).toString() }, { replace: true });
//     }, [filters, navigate]);



//     const resetFilters = () => {
//         setFilters(initialFilters);
//         navigate({}, { replace: true });
//     };

//     return { filters, setFilters, resetFilters };
// };










// useEffect(() => {
//     const newParams = {};

//     for (const key in filters) {
//         const value = filters[key];
//         if (value === '' || value === null || value === undefined) continue;
//         if (typeof value === 'object' && !Array.isArray(value)) {
//             if (key === 'dateRange') {
//                 const { startDate, endDate } = value;
//                 if (startDate || endDate) {
//                     newParams.startDate = startDate;
//                     newParams.endDate = endDate;
//                 }
//             } else {
//                 continue;
//             }
//         } else {
//             newParams[key] = value;
//         }
//     }

//     navigate({ search: new URLSearchParams(newParams).toString() }, { replace: true });
// }, [filters, navigate]);


export const useUrlSyncedFilters = (initialFilters) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const filterKeys = ['search', 'startDate', 'endDate', 'trainingType', 'trainingMode', 'status'];

    const parseFiltersFromUrl = () => {
        const filters = { ...initialFilters };

        for (const key of filterKeys) {
            const value = searchParams.get(key);
            if (value !== null) {
                if (key === 'startDate' || key === 'endDate') {
                    filters.dateRange[key] = value;
                } else {
                    filters[key] = value;
                }
            }
        }

        return filters;
    };

    const [filters, setFilters] = useState(parseFiltersFromUrl);

    useEffect(() => {
        const newParams = {};

        if (filters.search) newParams.search = filters.search;
        if (filters.dateRange.startDate) newParams.startDate = filters.dateRange.startDate;
        if (filters.dateRange.endDate) newParams.endDate = filters.dateRange.endDate;
        if (filters.trainingType && filters.trainingType !== "All") newParams.trainingType = filters.trainingType;
        if (filters.trainingMode && filters.trainingMode !== "All") newParams.trainingMode = filters.trainingMode;
        if (filters.status && filters.status !== "All") newParams.status = filters.status;

        // Preserve non-filter params like ?sp, ifid, pid
        const preservedParams = {};
        for (const [key, value] of searchParams.entries()) {
            if (!filterKeys.includes(key)) {
                preservedParams[key] = value;
            }
        }

        const combinedParams = new URLSearchParams({ ...preservedParams, ...newParams });
        navigate({ search: combinedParams.toString() }, { replace: true });
    }, [filters, navigate]);

    const resetFilters = () => {
        setFilters(initialFilters);
        const preservedParams = {};
        for (const [key, value] of searchParams.entries()) {
            if (!filterKeys.includes(key)) {
                preservedParams[key] = value;
            }
        }
        navigate({ search: new URLSearchParams(preservedParams).toString() }, { replace: true });
    };

    return { filters, setFilters, resetFilters };
};
