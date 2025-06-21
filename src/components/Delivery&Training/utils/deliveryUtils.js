import chance from 'chance';
const Chance = chance.Chance();

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0]; // "YYYY-MM-DD"
}

export function generateTestDataset(count = 10) {
  const dataset = [];

  for (let i = 0; i < count; i++) {
    const ticketNo = `TKT-${Chance.integer({ min: 100000, max: 999999 })}`;
    const orderNo = `ORDER-${Chance.integer({ min: 6000, max: 7000 })}`;
    const clientCode = Chance.name().toUpperCase();
    const now = new Date();

    const item = {
      date: formatDate(now),
      clientCode,
      createdBy: Chance.string({ length: 10, pool: '1234567890' }),
      ticketNo,
      ticketDate: formatDate(Chance.date({ year: 2025 })),
      requestDate: formatDate(Chance.date({ year: 2025 })),
      topic: Chance.pickone(['Feature Request', 'Bug Fix', 'Performance Tuning']),
      topicType: Chance.pickone(['Print', 'Tag', 'Excel', 'Report']),
      description: `${ticketNo}${ticketNo}${Chance.word({ length: 6 })}`,
      assignments: [
        {
          department: Chance.pickone(['UI', 'Development', 'Testing']),
          user: Chance.first(),
          estimate: {
            hours: Chance.integer({ min: 1, max: 5 })
          }
        }
      ],
      serviceType: Chance.pickone(['Complementary', 'Free', 'Chargeable']),
      paymentStatus: Chance.pickone(['Unpaid', 'Paid']),
      OrderNo: orderNo,
      time: now.toISOString(),
      copyDescription: "",
      onDemand: Chance.bool() ? "Client" : "Service",
      approvedStatus: Chance.pickone(['Pending', 'Approved', 'Rejected']),
      paymentMethod: Chance.pickone(['UPI', 'Card', 'Netbanking', 'QR Code', 'Cash', 'Wallet']),
      training: [
        {
          date: formatDate(Chance.date({ year: 2025 })),
          projectCode: Chance.word({ length: 6 }),
          ticketNo: `TKT-TRAIN-${i + 1}`,
          trainingType: Chance.pickone(['Soft Skills', 'Tech Skills']),
          trainingMode: Chance.pickone(['Online', 'Offline']),
          trainingBy: Chance.pickone(['External Trainer', 'In-House']),
          attendees: Chance.name(),
          startTime: formatDate(Chance.date({ year: 2025 })),
          endTime: formatDate(Chance.date({ year: 2025 })),
          details: `${ticketNo}${ticketNo}${ticketNo}${ticketNo}${ticketNo}`,
          schedule: {
            dateTime: formatDate(Chance.date({ year: 2025 })),
            zoomLink: `https://zoom.us/${Chance.hash({ length: 8 })}`
          }
        }
      ],
      trainingTo: "",
      trainingBy: "",
      scheduleTraining: "",
      sentMail: Chance.bool(),
      documentEstimate: [],
      developerEstimate: [],
      uiEstimate: [
        {
          user: Chance.first(),
          hours: Chance.integer({ min: 1, max: 3 })
        }
      ],
      testingEstimate: [],
      codeUploadTime: "",
      status: Chance.pickone(['Pending', 'Delivered', 'Running']),
      srno: i + 1,
      UpdatedAt: now.toISOString(),
      LastUpdatedBy: Chance.first(),
      communicationWith: Chance.first(),
      confirmationDate: formatDate(Chance.date({ year: 2025 })),
      NoPrints: Chance.integer({ min: 1, max: 20 }).toString()
    };

    dataset.push(item);
  }

  return dataset;
}

export const calculateTotalTrainingTime = (data) => {
  if (!Array.isArray(data)) return 0;

  const validData = data.filter(
    training => training?.Status !== "Cancelled" && training?.DurationTime > 0
  );

  const totalDuration = validData.reduce((total, training) => {
    return total + (parseFloat(training.DurationTime) || 0);
  }, 0);

  return parseFloat(totalDuration.toFixed(2));
};


export const calculateAverageAttendees = (data) => {
  const validData = data?.filter(training => training?.Status !== "Cancelled");

  const totalAttendees = validData.reduce((total, training) => {
    const att = training?.Attendees?.split(',').length || 0;
    return total + att;
  }, 0);

  return validData.length ? totalAttendees / validData.length : 0;
};

export const calculateTrainingTypesDistribution = (data) => {
  const validData = data?.filter(training =>
    training?.Status !== "Cancelled" &&
    training?.TrainingType?.trim() !== ""
  );

  const distribution = validData.reduce((acc, training) => {
    const type = training.TrainingType.trim();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return distribution;
};

export const calculateTrainingModeDistribution = (data) => {
  const validData = data?.filter(training =>
    training?.Status !== "Cancelled" &&
    training?.TrainingMode?.trim() !== ""
  );

  const distribution = validData.reduce((acc, training) => {
    const mode = training.TrainingMode.trim();
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});

  return distribution;
};

export function extractRecordingLink(htmlString) {
  const cleanHtml = htmlString.trim().replace(/^"|"$/g, '');

  const paragraphs = cleanHtml.split('<p>');
  for (const p of paragraphs) {
    const urlMatch = p.match(/https?:\/\/[^\s"'>]+/i);
    if (urlMatch) {
      return urlMatch[0];
    }
  }
  return null;
}

export function getTrainingDuration(startTime, endTime) {
  if (!startTime || !endTime) return "Invalid time";

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startDate = new Date(0, 0, 0, startHour, startMinute);
  const endDate = new Date(0, 0, 0, endHour, endMinute);

  let diffMs = endDate - startDate;

  // If end is before start (crossed midnight), add 24h
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }

  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;

  return `${hours}h ${minutes}m`;
}

export const filterDeliveryData = (tickets, filters = null) => {
  if (!Array.isArray(tickets)) return [];
  if (!tickets || tickets.length === 0) return [];
  if (!filters) return tickets;

  const {
    search = "",
    approval = "",
    projectCode = null,
    topicType = "",
    serviceType = [],
    onDemandOption = "",
    paymentMethod = [],
    paymentStatus = [],
    isFavorite = false,
    date = {},
    Tabs = -1
  } = filters;

  const hasActiveFilters = Boolean(
    search ||
    approval ||
    projectCode ||
    topicType ||
    (serviceType && serviceType.length > 0) ||
    onDemandOption ||
    (paymentMethod && paymentMethod.length > 0) ||
    (paymentStatus && paymentStatus.length > 0) ||
    isFavorite ||
    (date?.startDate || date?.endDate) ||
    Tabs !== -1
  );

  if (!hasActiveFilters) return tickets;

  const matchesMultiSelect = (filterArray, ticketValue) => {
    if (!filterArray || filterArray.length === 0) return true;
    const normalizedTicketValue = ticketValue?.toLowerCase();
    return filterArray.some(option => option?.toLowerCase() === normalizedTicketValue);
  };
  const getFilterDate = (ticket, dateStatus) => {
    if (!ticket) return null;
    let dateStr = null;

    if (!dateStatus) {
      const dateFields = ['Date', 'RequestDate', 'UpdatedAt', 'ConfirmationDate', 'TicketDate',];

      for (const field of dateFields) {
        if (ticket[field]) {
          dateStr = ticket[field];
          break;
        }
      }
    } else {

      const normalizedStatus = dateStatus?.toLowerCase?.()
        .replace(/\s+/g, '_')
        .replace(/[^a-z_]/g, '')
        || 'created';


      switch (normalizedStatus) {
        case 'ticket':
        case 'ticket_date':
          dateStr = ticket.TicketDate;
          break;
        case 'requested':
        case 'requested_date':
        case 'request':
        case 'request_date':
          dateStr = ticket.RequestDate;
          break;
        case 'updated':
        case 'updated_date':
        case 'updated_at':
          dateStr = ticket.UpdatedAt;
          break;
        case 'confirmed':
        case 'confirmed_date':
        case 'confirmation':
        case 'confirmation_date':
          dateStr = ticket.ConfirmationDate;
          break;
        case 'Created Date':
        case 'created_date':
          dateStr = ticket.Date;
          break;
        default:
          const statusKey = Object.keys(ticket).find(key =>
            key.toLowerCase().includes(normalizedStatus) ||
            normalizedStatus.includes(key.toLowerCase())
          );
          dateStr = statusKey ? ticket[statusKey] : ticket.TicketDate;
          break;
      }
    }

    if (!dateStr) return null;

    try {
      const parsedDate = new Date(dateStr);

      if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date:', dateStr, 'for status:', dateStatus);
        return null;
      }

      return parsedDate;
    } catch (error) {
      console.warn('Date parsing error:', error, 'for dateStr:', dateStr);
      return null;
    }
  };

  const normalizeToLocalDate = (date) => {
    if (!date) return null;

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;

    const d1 = normalizeToLocalDate(date1);
    const d2 = normalizeToLocalDate(date2);

    return d1.getTime() === d2.getTime();
  };

  const matchesSearch = (ticket, searchQuery) => {
    if (!searchQuery) return true;

    try {
      const searchLower = searchQuery.toLowerCase();

      const excludeFields = [
        'Date', 'TicketDate', 'RequestDate', 'UpdatedAt', 'ConfirmationDate',
        'time', 'startTime', 'endTime', 'CodeUploadTime', 'SentMail'
      ];

      const searchInObject = (obj, excludeKeys = []) => {
        if (!obj || typeof obj !== 'object') return false;

        for (const [key, value] of Object.entries(obj)) {
          if (excludeKeys.includes(key)) continue;

          if (typeof value === 'string') {
            if (value.toLowerCase().includes(searchLower)) {
              return true;
            }
          } else if (typeof value === 'number') {
            if (value.toString().includes(searchQuery)) {
              return true;
            }
          } else if (Array.isArray(value)) {
            for (const item of value) {
              if (typeof item === 'object' && item !== null) {
                if (searchInObject(item)) return true;
              } else if (typeof item === 'string') {
                if (item.toLowerCase().includes(searchLower)) return true;
              }
            }
          } else if (typeof value === 'object' && value !== null) {
            if (searchInObject(value)) return true;
          }
        }
        return false;
      };

      return searchInObject(ticket, excludeFields);
    } catch (error) {
      console.warn('Error in search function:', error);
      return false;
    }
  };
  const MatchedCompany = (ticket, projectCode) => {
    if (!projectCode) return true
    const companyCode = ticket?.ClientCode;
    return companyCode?.toLowerCase() === projectCode?.toLowerCase();
  }

  return tickets?.filter((ticket) => {
    try {
      const matchesSearchQuery = matchesSearch(ticket, search);
      const matchesApproval = !approval || ticket?.ApprovedStatus === approval;
      const matchesProjectCode = MatchedCompany(ticket, projectCode);
      const matchesTopicTypeFilter = !topicType || ticket?.TopicType === topicType;
      const matchesServiceTypeFilter = matchesMultiSelect(serviceType, ticket?.ServiceType);
      const Demand = onDemandOption === "Client" ? "yes" : "No";
      const matchesOnDemand = !onDemandOption || ticket?.OnDemand === Demand;
      const matchesPaymentMethodFilter = matchesMultiSelect(paymentMethod, ticket?.PaymentMethod);
      const matchesPaymentStatusFilter = matchesMultiSelect(paymentStatus, ticket?.PaymentStatus);
      const matchesFavorite = !isFavorite || ticket?.isFavorite === true;
      const matchesDateRange = (() => {
        const { startDate, endDate, status } = date || {};

        if (!startDate && !endDate) return true;

        const ticketDate = getFilterDate(ticket, status);

        if (!ticketDate) {
          console.warn('No valid date found for ticket:', ticket.TicketNo, 'with status:', status);
          return false;
        }
        let start = null;
        let end = null;

        try {
          if (startDate) {
            start = new Date(startDate);
            if (isNaN(start.getTime())) {
              console.warn('Invalid start date:', startDate);
              return false;
            }
          }

          if (endDate) {
            end = new Date(endDate);
            if (isNaN(end.getTime())) {
              console.warn('Invalid end date:', endDate);
              return false;
            }
          }
        } catch (error) {
          console.warn('Error parsing filter dates:', error);
          return false;
        }

        const normalizedTicketDate = normalizeToLocalDate(ticketDate);
        const normalizedStart = start ? normalizeToLocalDate(start) : null;
        const normalizedEnd = end ? normalizeToLocalDate(end) : null;
        if (normalizedStart && normalizedEnd && normalizedStart.getTime() === normalizedEnd.getTime()) {
          return isSameDay(ticketDate, normalizedStart);
        }
        const afterStart = normalizedStart ? normalizedTicketDate >= normalizedStart : true;
        const beforeEnd = normalizedEnd ? normalizedTicketDate <= normalizedEnd : true;

        return afterStart && beforeEnd;
      })();

      const matchesTab = (() => {
        if (Tabs === 0) {
          return ticket.Status === 'Delivered';
        }

        if (Tabs === 1) {
          const isNotDelivered = ticket.Status !== 'Delivered';

          const ticketDateStr = ticket.TicketDate || ticket.Date;
          if (!ticketDateStr) return false;

          const ticketDate = new Date(ticketDateStr);
          if (isNaN(ticketDate.getTime())) return false;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          return isNotDelivered && ticketDate >= today;
        }

        return true;
      })();

      return (
        matchesSearchQuery &&
        matchesApproval &&
        matchesProjectCode &&
        matchesTopicTypeFilter &&
        matchesServiceTypeFilter &&
        matchesOnDemand &&
        matchesPaymentMethodFilter &&
        matchesPaymentStatusFilter &&
        matchesFavorite &&
        matchesDateRange &&
        matchesTab
      );
    } catch (error) {
      console.warn('Error filtering ticket:', error);
      return false;
    }
  });
};
export const isAnyFilterActive = (filters) => {
  if (!filters) return false;

  const {
    search = "",
    approval = "",
    projectCode = null,
    topicType = "",
    serviceType = [],
    onDemandOption = "",
    paymentMethod = [],
    paymentStatus = [],
    isFavorite = false,
    date = {},
    Tabs = -1
  } = filters;

  // Check each filter type
  const hasSearch = Boolean(search && search.trim());
  const hasApproval = Boolean(approval);
  const hasProjectCode = Boolean(projectCode);
  const hasTopicType = Boolean(topicType);
  const hasServiceType = Array.isArray(serviceType) && serviceType.length > 0;
  const hasOnDemandOption = Boolean(onDemandOption);
  const hasPaymentMethod = Array.isArray(paymentMethod) && paymentMethod.length > 0;
  const hasPaymentStatus = Array.isArray(paymentStatus) && paymentStatus.length > 0;
  const hasFavorite = Boolean(isFavorite);
  const hasDateFilter = Boolean(date?.startDate || date?.endDate);
  const hasTabs = Tabs !== -1;

  return (
    hasSearch ||
    hasApproval ||
    hasProjectCode ||
    hasTopicType ||
    hasServiceType ||
    hasOnDemandOption ||
    hasPaymentMethod ||
    hasPaymentStatus ||
    hasFavorite ||
    hasDateFilter ||
    hasTabs
  );
};



export function parseAssignments(assignmentsJson) {
  try {
    const parsed = JSON.parse(assignmentsJson);
    if (!Array.isArray(parsed)) {
      console.warn("Expected an array of assignments");
      return [];
    }

    return parsed.map((assignment) => ({
      department: assignment?.Department,
      user: assignment?.user,
      userId: assignment?.userid,
      estimate: { hours: assignment?.EstimatedHours },
    }));
  } catch (error) {
    console.error("Failed to parse assignments JSON:", error);
    return [];
  }
}

export function formatToDateInput(value) {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch (error) {
    console.error("Invalid date value:", value);
    return "";
  }
}

export const mapToApiKey = (key) => {
  const map = {
    clientCode: "ClientCode",
    createdBy: "CreatedBy",
    ticketNo: "TicketNo",
    ticketDate: "TicketDate",
    requestDate: "RequestDate",
    topic: "Topic",
    topicType: "TopicType",
    noPrints: "NoPrints",
    description: "Description",
    serviceType: "ServiceType",
    paymentStatus: "PaymentStatus",
    paymentMethod: "PaymentMethod",
    approvedStatus: "ApproveStatus",
    communicationWith: "CommunicationWith",
    confirmationDate: "ConfirmationDate",
    codeUploadTime: "CodeUploadTime",
    Status: "Status",
    onDemand: "OnDemand",

  };
  return map[key] || key; // fallback to original key if unmapped
};




export const getStatusColor = (status, value, thresholds) => {
  if (status === "success") return "#4caf50";
  if (status === "warning") return "#ff9800";
  if (status === "error") return "#f44336";

  if (value >= thresholds?.high) return "#f44336";
  if (value >= thresholds?.medium) return "#ff9800";
  return "#4caf50";
};

export const getStatusText = (value, thresholds, labels) => {
  if (value >= thresholds?.high) return labels?.high;
  if (value >= thresholds?.medium) return labels?.medium;
  return labels.low;
};