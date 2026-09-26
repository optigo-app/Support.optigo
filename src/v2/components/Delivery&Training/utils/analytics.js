class DynamicAnalytics {
	constructor(ticketData) {
		this.data = Array.isArray(ticketData) ? ticketData : [ticketData];
		this.analytics = this.generateAnalytics();
	}

	generateAnalytics() {
		return {
			kpis: this.calculateKPIs(),
			statusAnalytics: this.analyzeStatus(),
			financialAnalytics: this.analyzeFinancials(),
			operationalAnalytics: this.analyzeOperations(),
			teamAnalytics: this.analyzeTeam(),
			clientAnalytics: this.analyzeClients(),
			timeAnalytics: this.analyzeTime(),
			serviceAnalytics: this.analyzeServices(),
			topicAnalytics: this.analyzeTopics(),
			approvalAnalytics: this.analyzeApprovals(),
		};
	}

	// dashboardData?.kpis?.totalEstimatedHours

	// 1. KEY PERFORMANCE INDICATORS
	calculateKPIs() {
		const total = this.data.length;
		const completed = this.data.filter((t) => t.Status === "Delivered").length;
		const running = this.data.filter((t) => t.Status === "Running").length;
		const pending = this.data.filter((t) => t.Status === "Pending").length;

		// Assume $1 per paid ticket
		const totalRevenue = this.data.filter((t) => t?.PaymentStatus === "Paid").length * 1;

		const avgCodeUploadTime = this.data.reduce((sum, t) => sum + (t?.CodeUploadTime || 0), 0) / total;

		const totalEstimatedHours = this.getTotalEstimatedHours();

		return {
			totalTickets: {
				value: total,
				label: "Total Tickets",
			},
			activeTickets: {
				value: running,
				percentage: total > 0 ? ((running / total) * 100).toFixed(1) : 0,
				label: "Active Tickets",
			},
			completionRate: {
				value: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
				label: "Completion Rate (%)",
			},
			pendingTickets: {
				value: pending,
				percentage: total > 0 ? ((pending / total) * 100).toFixed(1) : 0,
				label: "Pending Tickets",
			},
			totalRevenue: {
				value: totalRevenue.toFixed(2),
				label: "Total Revenue",
			},
			avgCodeUploadTime: {
				value: avgCodeUploadTime.toFixed(2),
				label: "Avg Code Upload Time (hrs)",
			},
			totalEstimatedHours: {
				value: totalEstimatedHours,
				label: "Total Estimated Hours",
			},
		};
	}

	// 2. STATUS ANALYTICS
	analyzeStatus() {
		const statusCounts = {};
		this.data.forEach((ticket) => {
			statusCounts[ticket.Status] = (statusCounts[ticket.Status] || 0) + 1;
		});

		const total = this.data.length;
		const statusAnalytics = Object.entries(statusCounts)?.map(([status, count]) => ({
			status,
			count,
			percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
		}));

		return {
			distribution: statusAnalytics,
			total: total,
			mostCommon: this.getMostCommon(statusCounts),
		};
	}

	// 3. FINANCIAL ANALYTICS
	analyzeFinancials() {
		const paymentStatusCounts = {};
		const paymentMethodCounts = {};
		const serviceTypeRevenue = {};

		this.data.forEach((ticket) => {
			// Payment Status
			paymentStatusCounts[ticket.PaymentStatus] = (paymentStatusCounts[ticket.PaymentStatus] || 0) + 1;

			// Payment Methods
			if (ticket.PaymentMethod) {
				paymentMethodCounts[ticket.PaymentMethod] = (paymentMethodCounts[ticket.PaymentMethod] || 0) + 1;
			}
			if (ticket.PaymentStatus === "Paid") {
				if (ticket.ServiceType) {
					serviceTypeRevenue[ticket.ServiceType] = (serviceTypeRevenue[ticket.ServiceType] || 0) + 1;
				}
			}
		});

		return {
			paymentStatus: this.convertToPercentage(paymentStatusCounts),
			paymentMethods: this.convertToPercentage(paymentMethodCounts),
			serviceTypeRevenue: Object.entries(serviceTypeRevenue).map(([type, count]) => ({
				serviceType: type,
				revenue: (count * 1).toFixed(2),
				count,
			})),
			totalPaidTickets: this.data.filter((t) => t.PaymentStatus === "Paid").length,
			totalUnpaidTickets: this.data.filter((t) => t.PaymentStatus !== "Paid").length,
		};
	}

	// 4. OPERATIONAL ANALYTICS
	analyzeOperations() {
		const serviceTypes = {};
		const onDemandCounts = {};
		const noPrintsStats = {
			total: 0,
			average: 0,
			max: 0,
			min: Infinity,
		};

		this.data.forEach((ticket) => {
			// Service Types
			serviceTypes[ticket.ServiceType] = (serviceTypes[ticket.ServiceType] || 0) + 1;

			// On Demand
			onDemandCounts[ticket.OnDemand] = (onDemandCounts[ticket.OnDemand] || 0) + 1;

			// No Prints Statistics
			const prints = ticket.NoPrints || 0;
			noPrintsStats.total += prints;
			noPrintsStats.max = Math.max(noPrintsStats.max, prints);
			noPrintsStats.min = Math.min(noPrintsStats.min, prints);
		});

		noPrintsStats.average = (noPrintsStats.total / this.data.length).toFixed(2);
		noPrintsStats.min = noPrintsStats.min === Infinity ? 0 : noPrintsStats.min;

		return {
			serviceTypes: this.convertToPercentage(serviceTypes),
			onDemandRequests: this.convertToPercentage(onDemandCounts),
			printStatistics: noPrintsStats,
			totalOrders: this.data.filter((t) => t.OrderNo).length,
		};
	}

	// 5. TEAM ANALYTICS
	// analyzeTeam() {
	//   const departmentStats = {};
	//   const userStats = {};
	//   const createdByStats = {};
	//   const updatedByStats = {};

	//   this.data.forEach(ticket => {
	//     // Process assignments
	//     if (ticket.Assignments) {
	//       let assignments = [];
	//       try {
	//         assignments = typeof ticket.Assignments === 'string'
	//           ? JSON.parse(ticket.Assignments)
	//           : ticket.Assignments;
	//       } catch (e) {
	//         assignments = [];
	//       }

	//       assignments.forEach(assignment => {
	//         const dept = assignment.Department;
	//         const user = assignment.user;
	//         const hours = assignment.EstimatedHours || 0;

	//         // Department stats
	//         if (!departmentStats[dept]) {
	//           departmentStats[dept] = {
	//             ticketCount: 0,
	//             totalHours: 0,
	//             users: new Set()
	//           };
	//         }
	//         departmentStats[dept].ticketCount++;
	//         departmentStats[dept].totalHours += hours;
	//         departmentStats[dept].users.add(user);

	//         // User stats
	//         if (!userStats[user]) {
	//           userStats[user] = {
	//             ticketCount: 0,
	//             totalHours: 0,
	//             department: dept
	//           };
	//         }
	//         userStats[user].ticketCount++;
	//         userStats[user].totalHours += hours;
	//       });
	//     }

	//     // Created by stats
	//     if (ticket.CreatedBy) {
	//       createdByStats[ticket.CreatedBy] = (createdByStats[ticket.CreatedBy] || 0) + 1;
	//     }

	//     // Updated by stats
	//     if (ticket.LastUpdatedBy) {
	//       updatedByStats[ticket.LastUpdatedBy] = (updatedByStats[ticket.LastUpdatedBy] || 0) + 1;
	//     }
	//   });

	//   // Convert department stats
	//   const departmentAnalytics = Object.entries(departmentStats).map(([dept, stats]) => ({
	//     department: dept,
	//     ticketCount: stats.ticketCount,
	//     totalHours: stats.totalHours,
	//     avgHoursPerTicket: stats.ticketCount > 0 ? (stats.totalHours / stats.ticketCount).toFixed(2) : 0,
	//     userCount: stats.users.size,
	//     users: Array.from(stats.users)
	//   }));

	//   // Convert user stats
	//   const userAnalytics = Object.entries(userStats).map(([user, stats]) => ({
	//     user: user,
	//     ticketCount: stats.ticketCount,
	//     totalHours: stats.totalHours,
	//     avgHoursPerTicket: stats.ticketCount > 0 ? (stats.totalHours / stats.ticketCount).toFixed(2) : 0,
	//     department: stats.department
	//   })).sort((a, b) => b.ticketCount - a.ticketCount);

	//   return {
	//     departmentWorkload: departmentAnalytics,
	//     topPerformers: userAnalytics.slice(0, 10),
	//     createdByStats: this.convertToPercentage(createdByStats),
	//     updatedByStats: this.convertToPercentage(updatedByStats)
	//   };
	// }

	analyzeTeam() {
		const departmentStats = {};
		const userStats = {};
		const createdByStats = {};
		const updatedByStats = {};

		// Step 1: Process each ticket
		this.data.forEach((ticket) => {
			if (ticket.Assignments) {
				let assignments = [];
				try {
					assignments = typeof ticket.Assignments === "string" ? JSON.parse(ticket.Assignments) : ticket.Assignments;
				} catch (e) {
					assignments = [];
				}

				assignments.forEach((assignment) => {
					const dept = assignment.Department;
					const user = assignment.user;
					const hours = assignment.EstimatedHours || 0;

					// Department stats
					if (!departmentStats[dept]) {
						departmentStats[dept] = {
							ticketCount: 0,
							totalHours: 0,
							users: new Set(),
							deliveredTickets: 0, // New field to track delivered tickets
							paidTickets: 0, // New field to track paid tickets
						};
					}
					departmentStats[dept].ticketCount++;
					departmentStats[dept].totalHours += hours;
					departmentStats[dept].users.add(user);

					// Check delivery and payment status
					if (ticket.Status === "Delivered") {
						departmentStats[dept].deliveredTickets++;
					}
					if (ticket.PaymentStatus === "Paid") {
						departmentStats[dept].paidTickets++;
					}
				});
			}

			// Created by stats
			if (ticket.CreatedBy) {
				createdByStats[ticket.CreatedBy] = (createdByStats[ticket.CreatedBy] || 0) + 1;
			}

			// Updated by stats
			if (ticket.LastUpdatedBy) {
				updatedByStats[ticket.LastUpdatedBy] = (updatedByStats[ticket.LastUpdatedBy] || 0) + 1;
			}
		});

		// Step 2: Filter departments based on delivery and payment status
		const filteredDepartmentStats = {};
		Object.entries(departmentStats).forEach(([dept, stats]) => {
			// Check if all tickets for this department are delivered and paid
			if (stats.ticketCount > 0 && stats.deliveredTickets === stats.ticketCount && stats.paidTickets === stats.ticketCount) {
				// Exclude this department
				return;
			}
			filteredDepartmentStats[dept] = stats;
		});

		// Step 3: Convert department stats
		const departmentAnalytics = Object.entries(filteredDepartmentStats).map(([dept, stats]) => ({
			department: dept,
			ticketCount: stats.ticketCount,
			totalHours: stats.totalHours,
			avgHoursPerTicket: stats.ticketCount > 0 ? (stats.totalHours / stats.ticketCount).toFixed(2) : 0,
			userCount: stats.users.size,
			users: Array.from(stats.users),
		}));

		// Step 4: Convert user stats
		const userAnalytics = Object.entries(userStats)
			.map(([user, stats]) => ({
				user: user,
				ticketCount: stats.ticketCount,
				totalHours: stats.totalHours,
				avgHoursPerTicket: stats.ticketCount > 0 ? (stats.totalHours / stats.ticketCount).toFixed(2) : 0,
				department: stats.department,
			}))
			.sort((a, b) => b.ticketCount - a.ticketCount);

		return {
			departmentWorkload: departmentAnalytics,
			topPerformers: userAnalytics.slice(0, 10),
			createdByStats: this.convertToPercentage(createdByStats),
			updatedByStats: this.convertToPercentage(updatedByStats),
		};
	}

	// 6. CLIENT ANALYTICS
	analyzeClients() {
		const clientStats = {};

		this.data.forEach((ticket) => {
			const client = ticket.ClientCode;
			if (!clientStats[client]) {
				clientStats[client] = {
					ticketCount: 0,
					revenue: 0,
					paidTickets: 0,
					pendingTickets: 0,
					completedTickets: 0,
				};
			}

			clientStats[client].ticketCount++;
			clientStats[client].revenue += parseFloat(ticket.Amount) || 0;

			if (ticket.PaymentStatus === "Paid") clientStats[client].paidTickets++;
			if (ticket.Status === "Pending") clientStats[client].pendingTickets++;
			if (ticket.Status === "Delivered") clientStats[client].completedTickets++;
		});

		const clientAnalytics = Object.entries(clientStats)
			.map(([client, stats]) => ({
				clientCode: client,
				ticketCount: stats.ticketCount,
				revenue: stats.revenue.toFixed(2),
				paidTickets: stats.paidTickets,
				pendingTickets: stats.pendingTickets,
				completedTickets: stats.completedTickets,
				completionRate: stats.ticketCount > 0 ? ((stats.completedTickets / stats.ticketCount) * 100).toFixed(1) : 0,
			}))
			.sort((a, b) => b.ticketCount - a.ticketCount);

		return {
			topClients: clientAnalytics,
			totalClients: Object.keys(clientStats).length,
			avgTicketsPerClient: (this.data.length / Object.keys(clientStats).length).toFixed(2),
		};
	}

	// 7. TIME ANALYTICS
	analyzeTime() {
		const dateCreated = {};
		const monthlyStats = {};
		const dayOfWeekStats = {};

		this.data.forEach((ticket) => {
			// Date created analysis
			const createdDate = new Date(ticket.Date).toDateString();
			dateCreated[createdDate] = (dateCreated[createdDate] || 0) + 1;

			// Monthly analysis
			const month = new Date(ticket.Date).toLocaleString("default", {
				month: "long",
				year: "numeric",
			});
			monthlyStats[month] = (monthlyStats[month] || 0) + 1;

			// Day of week analysis
			const dayOfWeek = new Date(ticket.Date).toLocaleDateString("en-US", {
				weekday: "long",
			});
			dayOfWeekStats[dayOfWeek] = (dayOfWeekStats[dayOfWeek] || 0) + 1;
		});

		return {
			dailyCreation: Object.entries(dateCreated).map(([date, count]) => ({
				date,
				count,
			})),
			monthlyTrends: Object.entries(monthlyStats).map(([month, count]) => ({
				month,
				count,
			})),
			weeklyPatterns: Object.entries(dayOfWeekStats).map(([day, count]) => ({
				day,
				count,
			})),
			avgTicketsPerDay: (this.data.length / Object.keys(dateCreated).length).toFixed(2),
		};
	}

	// 8. SERVICE ANALYTICS
	analyzeServices() {
		const serviceStats = {};
		this.data.forEach((ticket) => {
			const service = ticket.ServiceType;
			if (!serviceStats[service]) {
				serviceStats[service] = {
					count: 0,
					avgCodeUploadTime: 0,
					totalCodeUploadTime: 0,
					avgPrints: 0,
					totalPrints: 0,
				};
			}

			serviceStats[service].count++;
			serviceStats[service].totalCodeUploadTime += ticket.CodeUploadTime || 0;
			serviceStats[service].totalPrints += ticket.NoPrints || 0;
		});

		return Object.entries(serviceStats).map(([service, stats]) => ({
			serviceType: service,
			count: stats.count,
			percentage: ((stats.count / this.data.length) * 100).toFixed(1),
			avgCodeUploadTime: (stats.totalCodeUploadTime / stats.count).toFixed(2),
			avgPrints: (stats.totalPrints / stats.count).toFixed(1),
		}));
	}

	// 9. TOPIC ANALYTICS
	analyzeTopics() {
		const topicStats = {};
		const topicTypeStats = {};

		this.data.forEach((ticket) => {
			// Topic analysis (first 50 characters)
			const topic = ticket.Topic ? ticket.Topic.substring(0, 50) : "No Topic";
			topicStats[topic] = (topicStats[topic] || 0) + 1;

			// Topic Type analysis
			const topicType = ticket.TopicType || "Unknown";
			topicTypeStats[topicType] = (topicTypeStats[topicType] || 0) + 1;
		});

		return {
			topicTypes: this.convertToPercentage(topicTypeStats),
			commonTopics: Object.entries(topicStats)
				.map(([topic, count]) => ({ topic, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 10),
		};
	}

	// 10. APPROVAL ANALYTICS
	analyzeApprovals() {
		const approvalStats = {};
		this.data.forEach((ticket) => {
			const status = ticket.ApprovedStatus || "Unknown";
			approvalStats[status] = (approvalStats[status] || 0) + 1;
		});

		return {
			approvalDistribution: this.convertToPercentage(approvalStats),
			pendingApprovals: this.data.filter((t) => t.ApprovedStatus === "Pending").length,
			approvedCount: this.data.filter((t) => t.ApprovedStatus === "Approved").length,
		};
	}

	// HELPER METHODS
	convertToPercentage(counts) {
		const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
		return Object.entries(counts).map(([key, count]) => ({
			label: key,
			count: count,
			percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
		}));
	}

	getMostCommon(counts) {
		if (!counts || !Object.keys(counts).length) return;
		return Object?.entries(counts)?.reduce((a, b) => (counts[a[0]] > counts[b[0]] ? a : b))[0] || "None";
	}

	getTotalEstimatedHours() {
		let totalHours = 0;
		this.data.forEach((ticket) => {
			if (ticket.testingEstimate) {
				try {
					const estimates = typeof ticket.testingEstimate === "string" ? JSON.parse(ticket.testingEstimate) : ticket.testingEstimate;
					estimates.forEach((est) => {
						totalHours += est.EstimatedHours || 0;
					});
				} catch (e) {
					// Handle parsing errors
				}
			}
		});
		return totalHours;
	}

	getFormattedAnalytics() {
		return {
			summary: {
				totalTickets: this.analytics.kpis.totalTickets.value,
				activeTickets: this.analytics.kpis.activeTickets.value,
				completionRate: this.analytics.kpis.completionRate.value + "%",
				totalRevenue: "$" + this.analytics.kpis.totalRevenue.value,
			},
			charts: {
				statusPie: this.analytics.statusAnalytics.distribution,
				departmentBar: this.analytics.teamAnalytics.departmentWorkload,
				clientRevenue: this.analytics.clientAnalytics.topClients,
				monthlyTrends: this.analytics.timeAnalytics.monthlyTrends,
			},
			tables: {
				topPerformers: this.analytics.teamAnalytics.topPerformers,
				topClients: this.analytics.clientAnalytics.topClients,
				serviceBreakdown: this.analytics.serviceAnalytics,
			},
		};
	}
}

export default DynamicAnalytics;
