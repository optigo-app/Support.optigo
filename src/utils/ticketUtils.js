
const TICKET_PREFIX = "I";
const TICKET_INCREMENT = 2;
const STORAGE_KEY = "ticketHistory";
const COUNTER_KEY = "lastTicketNumber";

export const getLastTicketNumber = () => {
  return parseInt(localStorage.getItem(COUNTER_KEY) || "15013", 10);
};

export const saveLastTicketNumber = (num) => {
  localStorage.setItem(COUNTER_KEY, num.toString());
};

export const saveTicketHistory = (tickets) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};

export const getTicketHistory = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const generateTicket = (createdBy) => {
  const last = getLastTicketNumber();
  const next = last + TICKET_INCREMENT;
  const id = `${TICKET_PREFIX}${next}`;
  const newTicket = {
    id,
    createdBy,
    createdAt: new Date().toISOString()
  };
  const history = [...getTicketHistory(), newTicket];
  saveLastTicketNumber(next);
  saveTicketHistory(history);
  return newTicket;
};

export const resetTickets = () => {
  localStorage.removeItem(COUNTER_KEY);
  localStorage.removeItem(STORAGE_KEY);
};


// utils.js or wherever you store utilities

export const DataParser = (input, removeOfficeuseonly) => {
  try {
    if (!input) return { data: [], length: 0 };

    const parsed = JSON.parse(input);

    if (Array.isArray(parsed)) {
      const filtered = removeOfficeuseonly
        ? parsed.filter(off => !off?.isOfficeUseOnly)
        : parsed;

      return { data: filtered, length: filtered.length };
    }

    return { data: [], length: 0 };
  } catch (e) {
    return { data: [], length: 0 };
  }
};
