import { isValidDate } from './dateUtils.js';

/**
 * Rigorously checks if a call record has a real, authentic Helpdesk Ticket.
 * Rejects SQL Server empty date placeholders (1900-01-01), '0', and default action strings ('Upgrade to Ticket').
 */
export const hasRealTicket = (record) => {
  if (!record || typeof record !== 'object') return false;
  const raw = record.rawRecord || record;

  // 1. Check ticket number / ticket string
  const ticketStr = String(raw.ticket || record.ticket || '').trim();
  const hasValidTicketStr =
    ticketStr !== '' &&
    ticketStr !== '0' &&
    ticketStr !== 'Upgrade to Ticket' &&
    ticketStr !== 'In Ticket';

  // 2. Check Ticket_CreatedDate: must be a valid non-1900 date
  const createdDate = raw.Ticket_CreatedDate || record.Ticket_CreatedDate;
  const hasValidCreatedDate = Boolean(createdDate && isValidDate(createdDate));

  // 3. Check explicit ticket IDs
  const ticketId = String(
    raw.ticketId ||
      raw.Ticket_Id ||
      raw.TicketNo ||
      record.ticketId ||
      record.Ticket_Id ||
      record.TicketNo ||
      ''
  ).trim();
  const hasValidTicketId = ticketId !== '' && ticketId !== '0' && ticketId !== 'Upgrade to Ticket';

  // In the Call Logger system, a call is considered to have a ticket if:
  // - It has a valid ticket string AND a valid creation date, OR
  // - It has a valid linked ticket ID AND a valid creation date, OR
  // - It has both a valid ticket string and ticket ID
  return (
    (hasValidTicketStr && hasValidCreatedDate) ||
    (hasValidTicketId && hasValidCreatedDate) ||
    (hasValidTicketStr && hasValidTicketId)
  );
};

/**
 * Extracts the real ticket ID / number if present, or returns an empty string.
 */
export const getResolvedTicketId = (record) => {
  if (!hasRealTicket(record)) return '';
  const raw = record.rawRecord || record;

  const ticketStr = String(raw.ticket || record.ticket || '').trim();
  if (
    ticketStr &&
    ticketStr !== '0' &&
    ticketStr !== 'In Ticket' &&
    ticketStr !== 'Upgrade to Ticket'
  ) {
    return ticketStr;
  }

  const ticketId = String(
    raw.ticketId ||
      raw.Ticket_Id ||
      raw.TicketNo ||
      record.ticketId ||
      record.Ticket_Id ||
      record.TicketNo ||
      ''
  ).trim();
  if (ticketId && ticketId !== '0' && ticketId !== 'Upgrade to Ticket') {
    return ticketId;
  }

  return '';
};

/**
 * Sanitizes External and Internal statuses so that ticket-less calls NEVER display 'Ticket generated'.
 */
export const getSanitizedStatuses = (record, isCallEnded = true) => {
  const raw = record?.rawRecord || record || {};
  const hasTicket = hasRealTicket(record);

  let extStatus = record?.estatus || raw.Estatus || (isCallEnded ? 'Completed' : 'Running');
  let intStatus = record?.status || raw.status || (isCallEnded ? 'Solved' : 'Pending');

  if (!hasTicket) {
    if (String(extStatus).trim().toLowerCase() === 'ticket generated') {
      extStatus = isCallEnded ? 'Completed' : 'Running';
    }
    if (String(intStatus).trim().toLowerCase() === 'ticket generated') {
      intStatus = isCallEnded ? 'Solved' : 'Pending';
    }
  }

  return { extStatus, intStatus, hasTicket };
};
