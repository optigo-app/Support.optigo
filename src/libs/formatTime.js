import { format, intervalToDuration, parseISO, differenceInSeconds, formatDistanceToNow, isValid } from "date-fns";
import TimeIcon from "@mui/icons-material/AccessTime"; // Clock icon
import {
    Event as EventIcon,
    Call as CallIcon,
    Description as DescriptionIcon,
    Info as InfoIcon,
    Forward as ForwardIcon,
    CheckCircle as CheckCircleIcon,
    Comment as CommentIcon,
    PriorityHigh as PriorityHighIcon,
    Star as StarIcon,
    Feedback as FeedbackIcon,
    SentimentSatisfiedAlt as SentimentSatisfiedAltIcon,
    ConfirmationNumber as ConfirmationNumberIcon,
    Timer as TimerIcon,
    CallEnd as CallEndIcon
} from '@mui/icons-material';

export const formatTime = (seconds) => {
    const roundedSeconds = Math.round(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const secs = roundedSeconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };
export const formatTimeX = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};



export const formatDuration = (callStart, callClosed) => {
    if (!callStart || !callClosed) return "0 sec";

    const start = parseISO(callStart);
    const end = parseISO(callClosed);
    const totalSeconds = differenceInSeconds(end, start);

    if (totalSeconds < 0) return "0 sec";
    const duration = intervalToDuration({ start, end });

    return [
        duration.hours ? `${duration.hours} hr` : "",
        duration.minutes ? `${duration.minutes} min` : "",
        duration.seconds ? `${duration.seconds} sec` : ""
    ]
        .filter(Boolean)
        .join(" ");
};

// Function to format time from ISO string
export const formatTimeAn = (timeStr) => {
    if (!timeStr) return "-";
    return format(parseISO(timeStr), "hh:mm a");
};

export const calculateMetrics = (callData) => {
    if (!callData) return { durationEfficiency: 0, ratingPercentage: 0, conversionPotential: 50 };

    // Calculate call duration in seconds
    const callStart = callData?.callStart ? parseISO(callData.callStart) : null;
    const callEnd = callData?.callClosed ? parseISO(callData.callClosed) : null;
    const callDuration = callStart && callEnd ? differenceInSeconds(callEnd, callStart) : 0;

    // Duration Efficiency (assuming 60s as expected call duration)
    const expectedDuration = 60;
    const durationEfficiency = Math.min((callDuration / expectedDuration) * 100, 100); // Capped at 100%

    // Customer Rating (% of 5-star rating)
    const ratingPercentage = callData?.rating ? (callData.rating / 5) * 100 : 0;

    // Conversion Potential (based on resolved issues - assume 50% default)
    const resolvedIssues = callData?.resolvedIssues || 0;
    const totalIssues = callData?.totalIssues || 1; // Avoid division by zero
    const conversionPotential = ((resolvedIssues + 1) / (totalIssues + 1)) * 100;

    return { durationEfficiency, ratingPercentage, conversionPotential };
};

export const generateSummary = (callData) => {
    if (!callData) return { details: "No call details available.", analysis: "No analysis available." };

    const { topic, callDetails, callAnalysis, priority, rating, callStart, callClosed } = callData;

    // Calculate call duration in seconds
    const start = callStart ? parseISO(callStart) : null;
    const end = callClosed ? parseISO(callClosed) : null;
    const callDuration = start && end ? differenceInSeconds(end, start) : 0;

    // Generate call details dynamically if not provided
    const details =
        callDetails ||
        `This call was about "${topic}". It lasted for ${callDuration} seconds and was categorized as "${priority}" priority.`;

    // Generate call analysis dynamically if not provided
    let analysis = callAnalysis || "";
    if (!callAnalysis) {
        if (rating >= 4) {
            analysis = "The customer seemed satisfied with the resolution.";
        } else if (rating > 2) {
            analysis = "The customer had a neutral response. Some areas might need improvement.";
        } else {
            analysis = "The customer was not satisfied. Further follow-up may be required.";
        }

        if (priority === "High") {
            analysis += " Since this was a high-priority issue, ensure a follow-up is scheduled.";
        }
    }

    return { details, analysis };
};



// export const generateActivities = (callLog) => {
//     if (!callLog) return [];

//     const activities = [];

//     // Call Logged
//     if (callLog.receivedBy) {
//       activities.push({
//         icon: <TimeIcon color="primary" fontSize="small" />,
//         bgColor: "#e3f2fd",
//         text: `Call Booked by ${callLog?.receivedBy}`,
//         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog?.time}`,
//       });
//     }

//     // Call Forwarded
//     if (callLog.forward || (callLog.DeptName && callLog.AssignedEmpName)) {
//       let forwardText = "Call forwarded";
//       if (callLog.DeptName && callLog.AssignedEmpName) {
//         forwardText += ` to ${callLog.AssignedEmpName} (${callLog.DeptName})`;
//       } else if (callLog.forward) {
//         forwardText += ` to ${callLog.forward}`;
//       }

//       activities.push({
//         icon: <ForwardIcon color="warning" fontSize="small" />,
//         bgColor: "#fff3e0",
//         text: forwardText,
//         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
//       });
//     }

//     // Status Updates
//     if (callLog.status) {
//       activities.push({
//         icon: <CheckCircleIcon color="secondary" fontSize="small" />,
//         bgColor: "#f3e5f5",
//         text: `Status updated to: ${callLog.status}`,
//         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
//       });
//     }

//     if (callLog.Estatus) {
//       activities.push({
//         icon: <ForwardIcon color="info" fontSize="small" />,
//         bgColor: "#e1f5fe",
//         text: `Call status: ${callLog.Estatus}`,
//         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
//       });
//     }

//     // User Rating
//     if (callLog.rating > 0) {
//       activities.push({
//         icon: <CheckCircleIcon color="success" fontSize="small" />,
//         bgColor: "#fff8e1",
//         text: `User rating: ${callLog.rating}/5`,
//         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
//       });
//     }

//     // Ticket Created
//     if (callLog.ticket) {
//       activities.push({
//         icon: <CheckCircleIcon color="success" fontSize="small" />,
//         bgColor: "#e8f5e9",
//         text: `Ticket ${callLog.ticket} created`,
//         timestamp: `${FormatTime(callLog.Ticket_CreatedDate || callLog.date, "shortDate")} at ${callLog.time}`,
//       });
//     }

//     // Call Completed
//     if (callLog.callClosed) {
//       const closedDate = new Date(callLog.callClosed);
//       const formattedClosedDate = closedDate.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//       const formattedClosedTime = closedDate.toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit'
//       });

//       activities.push({
//         icon: <CallEndIcon color="error" fontSize="small" />,
//         bgColor: "#ffebee",
//         text: "Call completed",
//         timestamp: `${formattedClosedDate} at ${formattedClosedTime}`,
//       });
//     }

//     // Additional Call Forwarded entry (keeping as per original structure)
//     if (callLog.forward) {
//       activities.push({
//         icon: <ForwardIcon color="warning" fontSize="small" />,
//         bgColor: "#fff3e0",
//         text: `Call forwarded to ${callLog.forward}`,
//         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
//       });
//     }

//     return activities;
//   };


export const generateActivities = (callLog) => {
    console.log("🚀 ~ generateActivities ~ callLog:", callLog);
    if (!callLog) return [];

    const activities = [];

    // Call Booked/Scheduled
    if (callLog.date) {
        activities.push({
            icon: <EventIcon color="primary" fontSize="small" />,
            bgColor: "#e8eaf6",
            text: `Call Booked by ${callLog.callBy || 'user'}`,
            timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog?.time}`,
        });
    }

    // Call Logged
    // if (callLog.receivedBy) {
    //     activities.push({
    //         icon: <TimeIcon color="primary" fontSize="small" />,
    //         bgColor: "#e3f2fd",
    //         text: `Call logged by ${callLog?.receivedBy}`,
    //         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog?.time}`,
    //     });
    // }

    // Call Started
    if (callLog.callStart) {
        const startDate = new Date(callLog.callStart);
        const formattedStartDate = startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedStartTime = startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        activities.push({
            icon: <CallIcon color="success" fontSize="small" />,
            bgColor: "#e0f2f1",
            text: `Call started with ${callLog.company || callLog.callBy || 'client'}`,
            timestamp: `${formattedStartDate} at ${formattedStartTime}`,
        });
    }

    // Description Added
    // if (callLog.description) {
    //     activities.push({
    //         icon: <DescriptionIcon color="info" fontSize="small" />,
    //         bgColor: "#e0f7fa",
    //         text: `Description added: "${callLog.description}"`,
    //         timestamp: `${FormatTime(callLog.date, "shortDate")} at ${callLog?.time}`,
    //     });
    // }

    // Call Details
    // if (callLog.callDetails) {
    //     activities.push({
    //         icon: <InfoIcon color="primary" fontSize="small" />,
    //         bgColor: "#f3e5f5",
    //         text: `Call details updated`,
    //         timestamp: `${FormatTime(callLog.date, "shortDate")} at ${callLog?.time}`,
    //     });
    // }

    // Call Forwarded
    if (callLog.forward || (callLog.DeptName && callLog.AssignedEmpName)) {
        let forwardText = "Call forwarded";
        if (callLog.DeptName && callLog.AssignedEmpName) {
            forwardText += ` to ${callLog.AssignedEmpName} (${callLog.DeptName})`;
        } else if (callLog.forward) {
            forwardText += ` to ${callLog.forward}`;
        }

        activities.push({
            icon: <ForwardIcon color="warning" fontSize="small" />,
            bgColor: "#fff3e0",
            text: forwardText,
            timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
        });
    }

    // Status Updates
    // if (callLog.status) {
    //     activities.push({
    //         icon: <CheckCircleIcon color="secondary" fontSize="small" />,
    //         bgColor: "#f3e5f5",
    //         text: `Status updated to: ${callLog.status}`,
    //         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
    //     });
    // }

    // if (callLog.Estatus) {
    //     activities.push({
    //         icon: <ForwardIcon color="info" fontSize="small" />,
    //         bgColor: "#e1f5fe",
    //         text: `Call status: ${callLog.Estatus}`,
    //         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
    //     });
    // }

    // Comments Added
    // if (callLog.comment) {
    //     try {
    //         const comments = JSON.parse(callLog.comment);
    //         if (Array.isArray(comments) && comments.length > 0) {
    //             comments.forEach(comment => {
    //                 const commentDate = new Date(comment.time);
    //                 const formattedCommentDate = commentDate.toLocaleDateString('en-US', {
    //                     year: 'numeric',
    //                     month: 'long',
    //                     day: 'numeric'
    //                 });
    //                 const formattedCommentTime = commentDate.toLocaleTimeString('en-US', {
    //                     hour: '2-digit',
    //                     minute: '2-digit'
    //                 });

    //                 activities.push({
    //                     icon: <CommentIcon color="info" fontSize="small" />,
    //                     bgColor: "#e1f5fe",
    //                     text: `Comment by ${comment.Name}: "${comment.text}"`,
    //                     timestamp: `${formattedCommentDate} at ${formattedCommentTime}`,
    //                 });
    //             });
    //         }
    //     } catch (e) {
    //         // Handle case where comment is not valid JSON
    //         activities.push({
    //             icon: <CommentIcon color="info" fontSize="small" />,
    //             bgColor: "#e1f5fe",
    //             text: `Comment added`,
    //             timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
    //         });
    //     }
    // }

    // Priority Set
    if (callLog.priority) {
        activities.push({
            icon: <PriorityHighIcon color={callLog.priority === 'High' ? 'error' : callLog.priority === 'Medium' ? 'warning' : 'success'} fontSize="small" />,
            bgColor: "#fafafa",
            text: `Priority set to ${callLog.priority}`,
            timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
        });
    }

    // User Rating
    if (callLog.rating > 0) {
        activities.push({
            icon: <StarIcon color="warning" fontSize="small" />,
            bgColor: "#fff8e1",
            text: `User rating: ${callLog.rating}/5`,
            timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
        });
    }

    // User Feedback
    // if (callLog.feedback) {
    //     activities.push({
    //         icon: <FeedbackIcon color="info" fontSize="small" />,
    //         bgColor: "#e8f5e9",
    //         text: `Feedback received: "${callLog.feedback}"`,
    //         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
    //     });
    // }

    // Satisfaction Record
    // if (callLog.Satisfaction) {
    //     activities.push({
    //         icon: <SentimentSatisfiedAltIcon color="success" fontSize="small" />,
    //         bgColor: "#f1f8e9",
    //         text: `Satisfaction recorded: ${callLog.Satisfaction}`,
    //         timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
    //     });
    // }

    // Ticket Created
    if (callLog.ticket) {
        activities.push({
            icon: <ConfirmationNumberIcon color="success" fontSize="small" />,
            bgColor: "#e8f5e9",
            text: `Ticket ${callLog.ticket} created`,
            timestamp: `${FormatTime(callLog.Ticket_CreatedDate || callLog.date, "shortDate")} at ${callLog.time}`,
        });
    }

    // Call Duration
    if (callLog.CallDuration) {
        activities.push({
            icon: <TimerIcon color="primary" fontSize="small" />,
            bgColor: "#ede7f6",
            text: `Call duration: ${callLog.CallDuration}`,
            timestamp: `${FormatTime(callLog.date, "fullDate")} at ${callLog.time}`,
        });
    }

    // Call Completed
    if (callLog.callClosed) {
        const closedDate = new Date(callLog.callClosed);
        const formattedClosedDate = closedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedClosedTime = closedDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Calculate duration if both start and end times are available
        let durationText = "Call completed";
        if (callLog.callStart && callLog.callClosed) {
            const startTime = new Date(callLog.callStart);
            const endTime = new Date(callLog.callClosed);
            const durationMs = endTime - startTime;

            // Format duration
            const minutes = Math.floor(durationMs / 60000);
            const seconds = Math.floor((durationMs % 60000) / 1000);
            durationText += ` (Duration: ${minutes}m ${seconds}s)`;
        }

        activities.push({
            icon: <CallEndIcon color="error" fontSize="small" />,
            bgColor: "#ffebee",
            text: durationText,
            timestamp: `${formattedClosedDate} at ${formattedClosedTime}`,
        });
    }

    return activities.sort((a, b) => {
        const dateA = new Date(a.timestamp.split(' at ')[0]);
        const dateB = new Date(b.timestamp.split(' at ')[0]);
        return dateA - dateB;
    });
};


/**
 * FormatTime - returns formatted time
 * 
 * @param {string | number | Date} time - time value to format
 * @param {"relative" | "shortDate" | "fullDate" | "datetime"} type - format style
 */

export const FormatTime = (time, type = "shortDate") => {
    if (!time) return "";

    let date;

    if (typeof time === "string") {
        // Try parsing as ISO or numeric string
        const parsed = isNaN(Number(time)) ? new Date(time) : new Date(parseInt(time));
        date = parsed;
    } else {
        date = new Date(time);
    }

    if (!isValid(date)) return "";

    switch (type) {
        case "relative":
            return formatDistanceToNow(date, { addSuffix: true });
        case "shortDate":
            return format(date, "dd MMM yyyy");
        case "fullDate":
            return format(date, "eeee, MMMM d, yyyy");
        case "datetime":
            return format(date, "dd MMM yyyy, hh:mm a");
        default:
            return format(date, "dd MMM yyyy");
    }
};
