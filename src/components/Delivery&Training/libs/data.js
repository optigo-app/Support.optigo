import { createTheme } from "@mui/material";

const getApprovalStatus = (status) => {
    const statusMap = {
        1: { label: "Pending", color: "warning" },
        2: { label: "Approved", color: "success" },
        3: { label: "Rejected", color: "error" },
        4: { label: "Under Review", color: "info" },
    };
    return statusMap[status] || { label: "Unknown", color: "default" };
};

const getPaymentStatus = (status) => {
    const statusMap = {
        1: { label: "Unpaid", color: "error" },
        2: { label: "Partial", color: "warning" },
        3: { label: "Paid", color: "success" },
        4: { label: "Pending", color: "info" },
    };
    return statusMap[status] || { label: "Unknown", color: "default" };
};

const getServiceType = (type) => {
    const typeMap = {
        1: { label: "Development", color: "primary" },
        2: { label: "UI/UX", color: "secondary" },
        3: { label: "Testing", color: "info" },
        4: { label: "Documentation", color: "warning" },
        5: { label: "Training", color: "success" },
    };
    return typeMap[type] || { label: "Other", color: "default" };
};

export const DATE_FIELDS = [
    { label: "Created Date", value: "Created Date" },
    { label: "Ticket Date", value: "Ticket Date" },
    { label: "Request Date", value: "Request Date" },
    { label: "Confirmation Date", value: "Confirmation Date" },
];

export { getApprovalStatus, getPaymentStatus, getServiceType };

export const Datetheme = createTheme({
    palette: {
        primary: {
            main: "#f7f468d7",
        },
        secondary: {
            main: "#f50057",
        },
        background: {
            default: "#f5f5f5",
        },
    },
    typography: {
        fontFamily: '"Poppins", sans-serif',
        color: "#fff",
        h4: {
            fontWeight: 600,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "rgba(90, 90, 90, 0.1) 0px 4px 12px",
                    border: "1px solid rgba(90, 90, 90, 0.1)",
                    "&::-webkit-scrollbar": {
                        width: "6px", 
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent", // Almost invisible track
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0, 0, 0, 0.1)", // Very light thumb
                        borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.15)", // Slightly visible on hover
                    },
                    "&::-webkit-scrollbar-thumb:active": {
                        backgroundColor: "rgba(0, 0, 0, 0.2)", // Slightly darker when dragging
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                containedPrimary: {
                    backgroundColor: "#0081ff", // Button color
                    "&:hover": {
                        backgroundColor: "#0070e0",
                    },
                    color: "white",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    borderRadius: 8, // Applies border radius to the entire TextField
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                            borderColor: "gray", // Default border color (gray)
                        },
                        "&:hover fieldset": {
                            borderColor: "black", // Darker border on hover
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#1976d2", // Default MUI blue when focused
                        },
                        "&.Mui-disabled fieldset": {
                            borderColor: "#d1d1d1", // Light gray when disabled
                        },
                        "&.Mui-error fieldset": {
                            borderColor: "#d32f2f", // Red border when there's an error
                        },
                    },
                    "& .MuiInputBase-input": {
                        padding: "10px 14px", // Padding inside the input field
                    },
                    "& .MuiInputLabel-root": {
                        color: "gray", // Default label color
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#1976d2", // Label color when focused
                    },
                    "& .MuiInputLabel-root.Mui-error": {
                        color: "#d32f2f", // Label color when there's an error
                    },
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    maxHeight: "200px", // Fixed height for the dropdown list
                    overflowY: "auto", // Enable vertical scrolling if content exceeds height
                    zIndex: 1300, // Ensure proper z-index for overlay elements
                },
            },
        },
    },
});

export const getColorByStatus = (status) => {
    switch (status) {
        case "Cancelled":
            return "#ffcccc";
        case "Completed":
            return "#24de0a47";
        case "Pending":
            return "#fff3cd";
        default:
            return "";
    }
};

export const getInitial = (name) =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

// Generate consistent color based on name
export const getColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % 10;
    const colors = [
        "#FFE0B2", // Light Orange
        "#D1C4E9", // Light Purple
        "#B2EBF2", // Light Cyan
        "#C8E6C9", // Light Green
        "#FFF59D", // Light Amber
        "#FFCCBC", // Light Red
        "#D7CCC8", // Light Brown
        "#E1BEE7", // Light Purple
        "#FFE0B2", // Light Orange
        "#FAFAFA", // Light Grey
    ];
    return colors[index];
};
