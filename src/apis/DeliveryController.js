import { BaseAPI } from "./BaseAPI";

class DeliveryAPI {
	static BASE_URL = "http://newnextjs.web/api/report";
	// static BASE_URL = process.env.NODE_ENV === "production" ? "https://livenx.optigoapps.com/api/report" : "http://newnextjs.web/api/report";

	static VERSION_NO = null;
	static SV = null;
	static SP = null;
	static APP_USER_ID = null;
	static YEAR_CODE = null;
	static isInitialized = false;

	static initialize(cookieData = null) {
		if (!cookieData) {
			console.error("DeliveryAPI initialization failed: No cookie data provided");
			return null;
		}

		DeliveryAPI.YEAR_CODE = cookieData.yc || "";
		DeliveryAPI.SV = cookieData.sv || "";
		DeliveryAPI.APP_USER_ID = cookieData.userId || "";
		DeliveryAPI.SP = "19";
		DeliveryAPI.VERSION_NO = "v1";

		DeliveryAPI.isInitialized = true;

		return {
			yearCode: DeliveryAPI.YEAR_CODE,
			sv: DeliveryAPI.SV,
			sp: DeliveryAPI.SP,
			appUserId: DeliveryAPI.APP_USER_ID,
			version: DeliveryAPI.VERSION_NO,
		};
	}

	static getHeaders() {
		if (!DeliveryAPI.isInitialized) {
			console.error("DeliveryAPI not initialized. Please call initialize() with cookie data first.");
			throw new Error("API not initialized");
		}

		return {
			"Content-Type": "application/json",
			YearCode: DeliveryAPI.YEAR_CODE,
			version: DeliveryAPI.VERSION_NO,
			sv: DeliveryAPI.SV,
			sp: DeliveryAPI.SP,
		};
	}

	static async requestToApi({ mode, params, functionName }) {
		if (!DeliveryAPI.isInitialized) {
			console.error("DeliveryAPI not initialized. Please call initialize() with cookie data first.");
			throw new Error("API not initialized");
		}

		const body = {
			con: JSON.stringify({
				id: "",
				mode,
				appuserid: DeliveryAPI.APP_USER_ID,
			}),
			p: JSON.stringify(params),
			f: `Delivery Dashboard (${functionName})`,
		};

		try {
			const response = await fetch(DeliveryAPI.BASE_URL, {
				method: "POST",
				headers: DeliveryAPI.getHeaders(),
				body: JSON.stringify(body),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || `Failed to ${functionName.toLowerCase()}`);
			}

			return data;
		} catch (error) {
			console.error(`Error during "${functionName}" operation:`, error);
			throw error;
		}
	}

	// Get Token
	static async getToken(userId) {
		try {
			const response = await DeliveryAPI.requestToApi({
				mode: "gettoken",
				params: { appuserid: userId },
				functionName: "gettoken",
			});

			return response;
		} catch (error) {
			console.error("Error getting token:", error);
			throw error;
		}
	}

	// List all delivery records
	static async getDeliveryList() {
		try {
			const response = await DeliveryAPI.requestToApi({
				mode: "list",
				params: "",
				functionName: "List",
			});

			return response;
		} catch (error) {
			console.error("Error getting delivery list:", error);
			throw error;
		}
	}

	// Create new delivery record
	static async createDelivery(deliveryData) {
		try {
			const requiredFields = ["ClientCode", "CreatedBy", "TicketNo", "TicketDate", "RequestDate", "Topic"];
			for (const field of requiredFields) {
				if (!deliveryData[field]) {
					throw new Error(`${field} is required`);
				}
			}

			const response = await DeliveryAPI.requestToApi({
				mode: "create",
				params: deliveryData,
				functionName: "Create",
			});

			return response;
		} catch (error) {
			console.error("Error creating delivery:", error);
			throw error;
		}
	}

	// Update delivery record
	static async updateDelivery(deliveryData) {
		try {
			// Validate SrNo is provided for update
			if (!deliveryData.SrNo) {
				throw new Error("SrNo is required for update operation");
			}

			const response = await DeliveryAPI.requestToApi({
				mode: "update",
				params: deliveryData,
				functionName: "Update",
			});

			return response;
		} catch (error) {
			console.error("Error updating delivery:", error);
			throw error;
		}
	}

	// Update single field in delivery record
	static async updateDeliveryField(srNo, fieldName, fieldValue) {
		try {
			if (!srNo) {
				throw new Error("SrNo is required for update operation");
			}

			const updateData = {
				SrNo: srNo,
				[fieldName]: fieldValue,
			};

			const response = await DeliveryAPI.requestToApi({
				mode: "update",
				params: updateData,
				functionName: "Update Field",
			});

			return response;
		} catch (error) {
			console.error("Error updating delivery field:", error);
			throw error;
		}
	}

	// Delete delivery record
	static async deleteDelivery(srNo) {
		try {
			if (!srNo) {
				throw new Error("SrNo is required for delete operation");
			}

			const response = await DeliveryAPI.requestToApi({
				mode: "delete",
				params: { SrNo: srNo },
				functionName: "Delete",
			});

			return response;
		} catch (error) {
			console.error("Error deleting delivery:", error);
			throw error;
		}
	}

	// Get employee list
	static async getEmployeeList() {
		try {
			const response = await DeliveryAPI.requestToApi({
				mode: "employee_list",
				params: {},
				functionName: "Employee List",
			});

			return response;
		} catch (error) {
			console.error("Error getting employee list:", error);
			throw error;
		}
	}

	// Get customer master data
	static async getCustomerMaster() {
		try {
			const response = await DeliveryAPI.requestToApi({
				mode: "customer_master",
				params: "",
				functionName: "Customer Master",
			});

			return response;
		} catch (error) {
			console.error("Error getting customer master:", error);
			throw error;
		}
	}

	// Helper method to create assignment JSON
	static createAssignmentJSON(assignments) {
		try {
			// Validate assignment structure
			if (!Array.isArray(assignments)) {
				throw new Error("Assignments must be an array");
			}

			assignments.forEach((assignment, index) => {
				if (!assignment.AssignedTo || !assignment.AssignedToUserId || !assignment.Department) {
					throw new Error(`Assignment ${index + 1} is missing required fields`);
				}
			});

			return JSON.stringify(assignments);
		} catch (error) {
			console.error("Error creating assignment JSON:", error);
			throw error;
		}
	}

	// Helper method to format date
	static formatDate(date) {
		if (!date) return "";

		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");

		return `${year}-${month}-${day}`;
	}

	// Utility method to validate delivery data
	static validateDeliveryData(data) {
		const errors = [];

		// Check required fields
		const requiredFields = ["ClientCode", "CreatedBy", "TicketNo", "TicketDate", "RequestDate", "Topic"];
		requiredFields.forEach((field) => {
			if (!data[field]) {
				errors.push(`${field} is required`);
			}
		});

		// Validate date formats
		const dateFields = ["TicketDate", "RequestDate", "ConfirmationDate"];
		dateFields.forEach((field) => {
			if (data[field] && !/^\d{4}-\d{2}-\d{2}$/.test(data[field])) {
				errors.push(`${field} must be in YYYY-MM-DD format`);
			}
		});

		// Validate assignments JSON if provided
		if (data.AssignmentsJson) {
			try {
				const assignments = JSON.parse(data.AssignmentsJson);
				if (!Array.isArray(assignments)) {
					errors.push("AssignmentsJson must be a valid JSON array");
				}
			} catch (e) {
				errors.push("AssignmentsJson must be valid JSON");
			}
		}

		return errors;
	}
}

export default DeliveryAPI;
