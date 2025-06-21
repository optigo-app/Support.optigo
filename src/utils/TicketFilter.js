function safeJsonParse(jsonString, defaultValue = []) {
    try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : defaultValue;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return defaultValue;
    }
}
function parseKeywords(keywordsString) {
    if (!keywordsString || typeof keywordsString !== 'string') return [];
    return keywordsString.split('/').filter(keyword => keyword.trim().length > 0);
}

export function filterTickets(tickets = [], filters = {}) {
    const query = filters?.searchQuery?.trim()?.toLowerCase();
    const dateKeysToExclude = ["CreatedOn", "UpdatedAt", "PromiseDate"];

    return tickets
        ?.filter((ticket) => {
            if (filters?.projectCode && ticket?.companyname !== filters?.projectCode) return false;
            if (filters?.status?.length > 0 && !filters?.status?.includes(ticket?.Status)) return false;
            if (filters?.priority && ticket?.Priority !== filters.priority) return false;
            if (filters?.followup && ticket?.FollowUp !== filters.followup) return false;
            if (filters?.category && ticket?.category !== filters.category) return false;
            if (filters?.appname && ticket?.appname !== filters.appname) return false;
            if (filters?.isStarred && ticket?.star !== true) return false;

            if (!query) return true;

            const comments = safeJsonParse(ticket.comments, []);

            const keywords = parseKeywords(ticket.keywords);
            return Object.entries(ticket).some(([key, value]) => {
                if (dateKeysToExclude.includes(key)) return false;
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(query);
                }
                if (Array.isArray(value) && key === 'tags') {
                    return value.some(tag =>
                        tag?.toLowerCase()?.includes(query)
                    );
                }
                if (key === 'comments' && comments.length > 0) {
                    return comments.some(comment => {
                        if (comment.message?.toLowerCase()?.includes(query)) return true;
                        if (comment.Name?.toLowerCase()?.includes(query)) return true;
                        if (comment.Role?.toLowerCase()?.includes(query)) return true;
                        return false;
                    });
                }

                if (key === 'keywords' && keywords.length > 0) {
                    return keywords.some(keyword =>
                        keyword.toLowerCase().includes(query)
                    );
                }

                return false;
            });
        })
        ?.sort((a, b) => new Date(b?.CreatedOn) - new Date(a?.CreatedOn));
}


// const dateKeysToExclude = ["CreatedOn", "UpdatedAt", "PromiseDate"]; // add more if needed
// export function filterTickets(tickets = [], filters = {}) {
//     console.log("🚀 ~ filterTickets ~ tickets:", tickets)
//     const query = filters?.searchQuery?.trim()?.toLowerCase();

//     return tickets
//         ?.filter((ticket) => {
//             if (filters?.projectCode && ticket?.projectCode !== filters?.projectCode) return false;
//             if (filters?.status?.length > 0 && !filters.status.includes(ticket?.Status)) return false;
//             if (filters?.priority && ticket?.Priority !== filters.priority) return false;
//             if (filters?.followup && ticket?.FollowUp !== filters.followup) return false;
//             if (filters?.category && ticket?.category !== filters.category) return false;
//             if (filters?.appname && ticket?.appname !== filters.appname) return false;
//             if (filters?.isStarred && ticket?.star !== true) return false;

//             if (query) {
//                 const matchesQuery = Object.entries(ticket).some(([key, value]) => {
//                     if (dateKeysToExclude.includes(key)) return false;
//                     if (typeof value === "string") {
//                         return value.toLowerCase().includes(query);
//                     }
//                     if (Array?.isArray(value) && key === "tags") {
//                         return value?.some(tag => tag?.toLowerCase()?.includes(query));
//                     }
//                     if (Array?.isArray(value) && key === "Comments") {
//                         return value.some((comment) => {
//                             return Object?.entries(comment)?.some(([subKey, subValue]) => {
//                                 if (typeof subValue === "string" && subValue?.toLowerCase()?.includes(query)) {
//                                     return true;
//                                 }
//                                 return false;
//                             });
//                         });
//                     }
//                     return false;
//                 });
//                 if (!matchesQuery) return false;
//             }

//             return true;
//         })
//         ?.sort((a, b) => new Date(b?.CreatedOn) - new Date(a?.CreatedOn));
// }





// const data = filteredByMenu
//   ?.filter((ticket) => {
//     if (filters?.projectCode && ticket?.projectCode !== filters?.projectCode) return false;
//     if (filters?.status?.length > 0 && !filters.status.includes(ticket?.Status)) return false;
//     if (filters?.priority && ticket?.Priority !== filters.priority) return false;
//     if (filters?.followup && ticket?.FollowUp !== filters.followup) return false;
//     if (filters?.isStarred && ticket?.IsStarred !== true) return false;
//     if (filters?.searchQuery?.trim()) {
//       const query = filters?.searchQuery?.trim().toLowerCase();

//       return Object?.entries(ticket)?.some(([key, value]) => {
//         if (dateKeysToExclude?.includes(key)) return false;
//         if (typeof value === "string") {
//           return value.toLowerCase()?.includes(query);
//         }
//         return false;
//       });
//     }

//     return true;
//   })
//   ?.sort((a, b) => new Date(b?.CreatedOn) - new Date(a?.CreatedOn));