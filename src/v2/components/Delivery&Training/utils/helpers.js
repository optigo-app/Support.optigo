import { CheckCircleOutline } from "@mui/icons-material";
import { format, isValid } from "date-fns";

export const randomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 365));
  return date;
};

export const getApprovalStatus = (status) => {
  const statusMap = {
    Pending: { label: "Pending", bgColor: "#fff3cd", textColor: "#856404" }, // light yellow
    Approved: { label: "Approved", bgColor: "#d4edda", textColor: "#155724" }, // light green
    Rejected: { label: "Rejected", bgColor: "#f8d7da", textColor: "#721c24" }, // light red/pink
  };
  return (
    statusMap[status] || {
      label: "Other",
      bgColor: "#f0f0f0",
      textColor: "#333",
    }
  );
};

// Soft background colors for payment statuses
export const getPaymentStatus = (status) => {
  const statusMap = {
    Unpaid: { label: "Unpaid", bgColor: "#d1ecf1", textColor: "#0c5460" }, // light blue
    Paid: { label: "Paid", bgColor: "#d4edda", textColor: "#155724" }, // light green
    Free: { label: "Free", bgColor: "#e2f0cb", textColor: "#33691e" }, // soft lime
    Invoiced: { label: "Invoiced", bgColor: "#d6e0f5", textColor: "#1a237e" }, // soft indigo
  };
  return (
    statusMap[status] || {
      label: "Other",
      bgColor: "#f0f0f0",
      textColor: "#333",
    }
  );
};

export const getDeliveryStatus = (status) => {
  const statusMap = {
    Pending: {
      label: "Pending",
      bgColor: "#fde2b3", // soft peach
      textColor: "#b26a00", // deep amber
    },
    Running: {
      label: "Running",
      bgColor: "#cfe8fc", // soft sky blue
      textColor: "#004085", // strong navy blue
    },
    Delivered: {
      label: "Delivered",
      bgColor: "#c8e6c9", // pastel green
      textColor: "#2e7d32", // medium green
    },
  };

  return (
    statusMap[status] || {
      label: "Other",
      bgColor: "#eeeeee", // neutral grey
      textColor: "#555555",
    }
  );
};

export const getPackageMode = (mode) => {
  const modeMap = {
    Live: {
      label: "Live",
      bgColor: "#e8f5e9", // soft green
      textColor: "#1b5e20", // deep green
    },
    Hold: {
      label: "Hold",
      bgColor: "#fff3e0", // soft orange
      textColor: "#e65100", // dark orange
    },
    Training: {
      label: "Training",
      bgColor: "#e3f2fd", // soft blue
      textColor: "#0d47a1", // deep blue
    },
    Leads: {
      label: "Leads",
      bgColor: "#f1f8e9", // soft lime
      textColor: "#33691e", // dark lime green
    },
    Jocx: {
      label: "Jocx",
      bgColor: "#fce4ec", // soft pink
      textColor: "#880e4f", // deep pink
    },
    Inactive: {
      label: "Inactive",
      bgColor: "#eeeeee", // light grey
      textColor: "#424242", // dark grey
    },
    "Live-less entry": {
      label: "Live-less entry",
      bgColor: "#fffde7", // pale yellow
      textColor: "#f57f17", // dark mustard
    },
    "Live-no entry": {
      label: "Live-no entry",
      bgColor: "#ffebee", // soft red
      textColor: "#b71c1c", // deep red
    },
  };

  return (
    modeMap[mode] || {
      label: "Other",
      bgColor: "#f5f5f5", // neutral grey
      textColor: "#616161", // dark grey
    }
  );
};


export const getCurrentStatus = (status) => {
  const statusMap = {
    "Customer Pending": {
      label: "Customer Pending",
      bgColor: "#fff3cd", // soft yellow
      textColor: "#856404", // golden brown
    },
    "Quote Sent": {
      label: "Quote Sent",
      bgColor: "#d1ecf1", // light teal
      textColor: "#0c5460", // dark teal
    },
    "Quote Approved": {
      label: "Quote Approved",
      bgColor: "#d4edda", // soft green
      textColor: "#155724", // green dark
    },
    "Quote Not Approved": {
      label: "Quote Not Approved",
      bgColor: "#f8d7da", // soft red
      textColor: "#721c24", // burgundy red
    },
    "Quote Pending": {
      label: "Quote Pending",
      bgColor: "#ddd", // near white
      textColor: "#6c757d", // muted grey
    },
    "Estimate Pending": {
      label: "Estimate Pending",
      bgColor: "#fce4ec", // soft pink
      textColor: "#880e4f", // deep rose
    },
    "Estimate Sent": {
      label: "Estimate Sent",
      bgColor: "#e3f2fd", // pale blue
      textColor: "#0d47a1", // bright blue
    },
    "Communication Running": {
      label: "Communication Running",
      bgColor: "#ede7f6", // lavender
      textColor: "#4527a0", // purple
    },
    "Sample Sent": {
      label: "Sample Sent",
      bgColor: "#fffde7", // pale lemon
      textColor: "#f57f17", // goldenrod
    },
  };

  if (statusMap[status]) return statusMap[status];
  const fallbackColors = [
    { bgColor: "#f1f8e9", textColor: "#33691e" }, // A–C (green)
    { bgColor: "#e3f2fd", textColor: "#0d47a1" }, // D–F (blue)
    { bgColor: "#fce4ec", textColor: "#880e4f" }, // G–I (pink)
    { bgColor: "#fff3e0", textColor: "#e65100" }, // J–L (orange)
    { bgColor: "#f3e5f5", textColor: "#4a148c" }, // M–O (purple)
    { bgColor: "#e0f7fa", textColor: "#006064" }, // P–R (teal)
    { bgColor: "#f9fbe7", textColor: "#827717" }, // S–U (lime)
    { bgColor: "#ede7f6", textColor: "#311b92" }, // V–X (deep violet)
    { bgColor: "#efebe9", textColor: "#3e2723" }, // Y–Z / others (brown)
  ];
  const trimmedStatus = typeof status === "string" ? status.trim() : "";
  const firstChar = trimmedStatus.charAt(0).toUpperCase();

  const groupIndex = (() => {
    if (!/[A-Z]/.test(firstChar)) return 8; // fallback index
    const code = firstChar.charCodeAt(0);
    return Math.min(Math.floor((code - 65) / 3), fallbackColors.length - 1);
  })();

  return {
    label: trimmedStatus || "N/A",
    ...fallbackColors[groupIndex],
  };
};

// Soft background colors for service types
export const getServiceType = (type) => {
  const typeMap = {
    Complementary: {
      label: "Complementary",
      bgColor: "#e3f2fd",
      textColor: "#0d47a1",
    }, // light blue
    Free: { label: "Free", bgColor: "#fce4ec", textColor: "#880e4f" }, // soft pink
    Chargeable: {
      label: "Chargeable",
      bgColor: "#e0f7fa",
      textColor: "#006064",
    }, // aqua blue
    Consultation: {
      label: "Consultation",
      bgColor: "#fff3cd",
      textColor: "#856404",
    }, // light yellow
  };
  return typeMap[type] || { label: "Other", bgColor: "#eeeeee", textColor: "#333" };
};

export const getOnDemandType = (type) => {
  const typeMap = {
    Client: {
      label: "Client",
      bgColor: "#e3f2fd",
      textColor: "#0d47a1",
    }, // light blue
    Optigo: { label: "Optigo", bgColor: "#fce4ec", textColor: "#880e4f" }, // soft pink
  };
  return typeMap[type] || { label: "Other", bgColor: "#eeeeee", textColor: "#333" };
};

export const getPaymentMethodStyle = (method) => {
  const methodMap = {
    UPI: {
      label: "UPI",
      bgColor: "#e0f7fa", // light aqua
      textColor: "#006064",
    },
    "Credit Card": {
      label: "Credit Card",
      bgColor: "#ede7f6", // soft violet
      textColor: "#4527a0",
    },
    "Debit Card": {
      label: "Debit Card",
      bgColor: "#fff8e1", // warm light amber
      textColor: "#ff6f00",
    },
    Netbanking: {
      label: "Netbanking",
      bgColor: "#e3f2fd", // soft blue
      textColor: "#1565c0",
    },
    Wallet: {
      label: "Wallet",
      bgColor: "#fce4ec", // light pink
      textColor: "#ad1457",
    },
    Cash: {
      label: "Cash",
      bgColor: "#f1f8e9", // light green
      textColor: "#33691e",
    },
    EMI: {
      label: "EMI",
      bgColor: "#fff3e0", // soft peach
      textColor: "#e65100",
    },
    "QR Code": {
      label: "QR Code",
      bgColor: "#e0f2f1", // minty teal
      textColor: "#004d40",
    },
  };

  return (
    methodMap[method] || {
      label: "Other",
      bgColor: "#f5f5f5", // neutral grey
      textColor: "#616161", // dark grey
    }
  );
};

export const getTrainingStatusStyle = (hasTraining) => {
  return hasTraining
    ? {
        label: "Added",
        bgColor: "#fff3cd",
        textColor: "#856404",
        icon: <CheckCircleOutline fontSize="small" />,
      }
    : {
        label: "Required",
        bgColor: "#fef1f2",
        textColor: "#721c24",
        borderColor: "#f8d7da",
      };
};

export async function copyToClipboard(ticket, isClient, getTemp) {
  const { TicketNo = "", Topic = "", Description = "", ClientCode = "", CommunicationWith = "", NoPrints = "", TopicType = "", price = "1200000" } = ticket;

  const emailTemplate = `Dear ${ClientCode},

I hope this message finds you well.

Please find the details of your request below:

Ticket No: ${TicketNo}
Type: ${TopicType}
Number of Prints: ${NoPrints}
Subject/Topic: ${Topic}
Description: ${Description}
Communication With: ${CommunicationWith}
Price: N / A

Let me know if you need any further assistance.

Best regards,
[Your Name]`;
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    console.warn("Clipboard API not supported.");
    return false; // signal failure to caller
  }

  if (getTemp === true) {
    return emailTemplate;
  }
  try {
    await navigator.clipboard.writeText(isClient ? ticket : emailTemplate);
    console.log("Email template copied to clipboard");
    return true;
  } catch (err) {
    console.error("Failed to copy text:", err);
    return false;
  }
}

export async function MailTemplate(ticket) {
  if (!ticket) return;
  const { TicketNo = "", Topic = "", Description = "", ClientCode = "", CommunicationWith = "", NoPrints = "", TopicType = "", price = "1200000" } = ticket;

  const emailTemplate = `Dear ${ClientCode},

I hope this message finds you well.

Please find the details of your request below:

Ticket No: ${TicketNo}
Type: ${TopicType}
Number of Prints: ${NoPrints}
Subject/Topic: ${Topic}
Description: ${Description}
Communication With: ${CommunicationWith}
Price: N / A

Let me know if you need any further assistance.

Best regards,
[Your Name]`;
  return emailTemplate;
}

export const formatDate = (data) => {
  if (!data) {
    return "N/A";
  }
  let date;
  if (data instanceof Date) {
    date = data;
  } else if (typeof data === "string") {
    date = new Date(data);
  } else {
    console.error("Unsupported date format:", data);
    return "Invalid Date";
  }
  if (!isValid(date)) {
    console.error("Invalid Date Object:", data);
    return "Invalid Date";
  }
  return format(date, "MMMM d, yyyy, h:mm a");
};

export const calculateTotalHours = (estimates) => {
  if (!Array.isArray(estimates)) return 0;
  return estimates.reduce((total, item) => total + (item?.EstimatedHours || 0), 0);
};

export const parseEstimate = (data) => {
  try {
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse estimate:", e);
    return [];
  }
};

export const getFullName = (user) => {
  if (!user) return "";
  const { firstname = "", lastname = "" } = user;
  return `${firstname} ${lastname}`.trim();
};

export const isUpcoming = (status, date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let ticketDate = date ? new Date(date) : null;
  if (!ticketDate || isNaN(ticketDate.getTime())) return false;
  ticketDate.setHours(0, 0, 0, 0);
  return status !== "Delivered" && ticketDate >= today;
};

export const FormatDateIST = (date, formatOptions) => {
  if (!date) return "N/A";

  try {
    const entryDate = new Date(date);

    // Handle invalid dates
    if (isNaN(entryDate.getTime())) return "Invalid Date";

    if (!formatOptions) {
      // Default formatting using UTC time
      return entryDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      });
    }

    // Format using custom format options like "dd-mm-yyyy" or "dd/mm/yyyy"
    const dd = String(entryDate.getUTCDate()).padStart(2, "0");
    const mm = String(entryDate.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
    const yyyy = entryDate.getUTCFullYear();

    // Example formats:
    if (formatOptions === "dd-mm-yyyy") {
      return `${dd}-${mm}-${yyyy}`;
    } else if (formatOptions === "dd/mm/yyyy") {
      return `${dd}/${mm}/${yyyy}`;
    } else if (formatOptions === "yyyy-mm-dd") {
      return `${yyyy}-${mm}-${dd}`;
    } else {
      return `${dd}-${mm}-${yyyy}`; // Fallback
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

export const formatDateFun = (dateString) => {
  if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A";

  const date = new Date(dateString);
  return FormatDateIST(date);
};

const isValidDate = (dateStr) => {
  return dateStr && dateStr !== "1900-01-01T00:00:00.000Z" && !isNaN(new Date(dateStr).getTime());
};

export const getMostRecentDate = (data, fields) => {
  const validDates = fields.map((field) => ({ field, value: data[field] })).filter((item) => isValidDate(item.value));

  if (validDates.length === 0) return null;

  // Sort by descending date (most recent first)
  validDates.sort((a, b) => new Date(b.value) - new Date(a.value));

  return {
    label: validDates[0].field,
    value: validDates[0].value,
  }; // Most recent
};
