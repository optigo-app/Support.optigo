import { showBrowserNotification } from "../utils/notifications";
import notificationIcons from "../assets/notfi";

const capitalizeWords = (str) =>
  str
    ? str
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ")
    : "";

const formatName = (name) => {
  if (!name) return "";
  const cleanName = name.replace(/\s+/g, " ").trim();
  const parts = cleanName.split(" ");
  if (parts.length > 1) {
    const firstName = capitalizeWords(parts[0]);
    const surnameInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${surnameInitial}.`;
  }
  return capitalizeWords(cleanName);
};

export const NOTIFICATION_TEMPLATES = {
  // CallLogs Events Notifications
  ADD_CALL: (data) => {
    const caller = formatName(data?.callBy) || "Unknown Caller";
    const company = capitalizeWords(data?.company) || "Unknown Company";
    const addedBy = formatName(data?.receivedBy) || "Unknown Support";
    const description = data?.description || "No description provided.";

    return {
      title: `New Call — ${company}`,
      body: `Caller: ${caller}\nAdded By: ${addedBy}\nDescription: ${description}`,
      icon: notificationIcons.add_call,
      badge: "/ic_stat_o.png",
      requireInteraction: true, // Forces it to stay on screen so you don't miss it
      vibrate: [200, 100, 200], // Double buzz for mobile
      tag: "new-call", // Groups notifications so they don't spam
    };
  },

  ACCEPT_CALL: (data) => {
    const caller = formatName(data?.callBy) || "Unknown Caller";
    const receiver = formatName(data?.receivedBy) || "Unknown User";

    return {
      title: `Call Accepted — ${caller}`,
      body: `Support: ${receiver}\nDescription: ${data?.description || "No description provided."}`,
      icon: notificationIcons.call,
      badge: "/ic_stat_o.png",
      vibrate: [200, 100, 200],
      tag: "accept-call",
    };
  },

  FORWARDED_CALL: (data, currentUser) => {
    const forwarder = formatName(data?.receivedBy) || "Someone";
    const caller = formatName(data?.callBy) || "Unknown Caller";
    const company = capitalizeWords(data?.company) || "Unknown Company";
    const description = data?.description?.trim() || "";
    const forwardTo =
      formatName(data?.AssignedEmpName || data?.forwardTo) || "someone";

    const normalize = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase();

    const isUserReceiver =
      normalize(data?.forwardTo) === normalize(currentUser?.fullName) ||
      normalize(data?.forwardTo) === normalize(currentUser?.id);

    let title = "";
    let body = "";

    if (isUserReceiver) {
      title = `Call Forwarded to You`;
      body = `Caller: ${caller} (${company})\nFrom: ${forwarder}${description ? `\nDescription: ${description}` : ""}`;
    } else {
      title = `Call Forwarded`;
      body = `Caller: ${caller} (${company})\nTo: ${forwardTo}${description ? `\nDescription: ${description}` : ""}`;
    }

    return {
      title,
      body,
      icon: notificationIcons.forward,
      badge: "/ic_stat_o.png",
      requireInteraction: isUserReceiver, // Stays on screen if forwarded to YOU specifically
      vibrate: [200, 100, 200],
      tag: "forward-call",
    };
  },

  // Ticket Events Notifications
  CREATE_TICKET: (data) => {
    const company = capitalizeWords(data?.companyname) || "Unknown Company";
    const creator = formatName(data?.username) || "Unknown User";
    const subject = data?.MainSubject || data?.subject || "New ticket created.";
    const instruction = data?.instruction || "";

    return {
      title: `New Ticket Created — ${company}`,
      body: `Created By: ${creator}\nSubject: ${subject}${instruction ? `\nInstructions: ${instruction}` : ""}`,
      icon: notificationIcons.ticket,
      badge: "/ic_stat_o.png",
      requireInteraction: true,
      vibrate: [200, 100, 200],
      tag: `ticket-${data?.TicketNo || "new"}`, // Groups by Ticket number!
    };
  },

  UPDATE_TICKET: (data) => {
    const company = capitalizeWords(data?.companyname) || "Unknown Company";
    const updater = formatName(data?.LastUpdatedBy) || "Unknown User";
    const subject = data?.MainSubject || data?.subject || "Ticket updated.";

    return {
      title: `Ticket Updated — ${company}`,
      body: `Updated By: ${updater}\nSubject: ${subject}\nStatus: Changes were made to this ticket.`,
      icon: notificationIcons.update_ticket,
      badge: "/ic_stat_o.png",
      vibrate: [100, 50, 100],
      tag: `ticket-${data?.TicketNo || "update"}`,
      renotify: true, // Alerts the user again when the ticket is updated, even if it groups
    };
  },

  TICKET_COMMENT: (data) => {
    const commenter = formatName(data?.CreatedByName || data?.CreatedBy || data?.username) || "Unknown User";
    const comment = data?.Comments || "-";

    return {
      title: `New Comment on Ticket #${data?.TicketNo}`,
      body: `By: ${commenter}\nComment: ${comment}`,
      icon: notificationIcons.comment,
      badge: "/ic_stat_o.png",
      vibrate: [100, 50, 100],
      tag: `ticket-${data?.TicketNo || "comment"}`,
      renotify: true,
    };
  },

  CLOSE_TICKET: (data) => {
    const company = capitalizeWords(data?.companyname) || "Unknown Company";
    const closer = formatName(data?.LastUpdatedBy) || "Unknown User";
    const subject = data?.MainSubject || data?.subject || "Ticket closed.";

    return {
      title: `Ticket Closed — ${company}`,
      body: `Closed By: ${closer}\nSubject: ${subject}\nStatus: Ticket has been closed successfully.`,
      icon: notificationIcons.close,
      badge: "/ic_stat_o.png",
      vibrate: [100, 50, 100],
      tag: `ticket-${data?.TicketNo || "close"}`,
      renotify: true,
    };
  },
};

export const notify = (data, templateId, user) => {
  const templateFn = NOTIFICATION_TEMPLATES[templateId];
  if (!templateFn)
    return console.warn(`Notification template "${templateId}" not found`);
  const notificationOptions = templateFn(data, user);
  const typeGroup = templateId.includes("TICKET")
    ? "TICKET"
    : templateId.includes("CALL")
      ? "CALL"
      : "OTHER";
  showBrowserNotification({
    ...notificationOptions,
    data: {
      ...data, // original payload
      type: templateId, // now part of data
      group: typeGroup, // now part of data
    },
  });
};
