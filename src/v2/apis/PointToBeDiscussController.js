import { BaseAPI } from "./BaseAPI";

class PointToBeDiscuss extends BaseAPI {
  static getBaseUrl() {
    return super.BASE_URL;
  }
  static BASE_URL = this.getBaseUrl();
  static VERSION_NO = null;
  static SV = null;
  static SP = null;
  static APP_USER_ID = null;
  static YEAR_CODE = null;
  static isInitialized = false;

  static initialize(cookieData = null) {
    if (!cookieData) {
      console.error("PointToBeDiscuss initialization failed: No cookie data provided");
      return null;
    }

    PointToBeDiscuss.YEAR_CODE = cookieData.yc || "";
    PointToBeDiscuss.SV = cookieData.sv || "";
    PointToBeDiscuss.APP_USER_ID = cookieData.userId || "";
    PointToBeDiscuss.SP = "19";
    PointToBeDiscuss.VERSION_NO = "v1";

    PointToBeDiscuss.isInitialized = true;

    return {
      yearCode: PointToBeDiscuss.YEAR_CODE,
      sv: PointToBeDiscuss.SV,
      sp: PointToBeDiscuss.SP,
      appUserId: PointToBeDiscuss.APP_USER_ID,
      version: PointToBeDiscuss.VERSION_NO,
    };
  }

  static getHeaders() {
    if (!PointToBeDiscuss.isInitialized) {
      console.error("PointToBeDiscuss not initialized. Please call initialize() with cookie data first.");
      throw new Error("API not initialized");
    }

    return {
      "Content-Type": "application/json",
      YearCode: PointToBeDiscuss.YEAR_CODE,
      version: PointToBeDiscuss.VERSION_NO,
      sv: PointToBeDiscuss.SV,
      sp: PointToBeDiscuss.SP,
    };
  }

  static async requestToApi({ mode, params, functionName }) {
    if (!PointToBeDiscuss.isInitialized) {
      console.error("PointToBeDiscuss not initialized. Please call initialize() with cookie data first.");
      throw new Error("API not initialized");
    }

    const body = {
      con: JSON.stringify({
        id: "",
        mode,
        appuserid: PointToBeDiscuss.APP_USER_ID,
      }),
      p: JSON.stringify(params),
      f: `Point To be Discuss (${functionName})`,
    };

    try {
      const response = await fetch(PointToBeDiscuss.BASE_URL, {
        method: "POST",
        headers: PointToBeDiscuss.getHeaders(),
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
  // List all delivery records
  static async getPointDeliveryList() {
    try {
      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_discuss_list",
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
  static async createPointDelivery(deliveryData) {
    try {
      const requiredFields = [
        "TicketNo",
        // , "TicketDate", "RequestDate", "Topic"
      ];
      for (const field of requiredFields) {
        if (!deliveryData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_create",
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
  static async updatePointDelivery(deliveryData) {
    try {
      // Validate SrNo is provided for update
      if (!deliveryData.SrNo) {
        throw new Error("SrNo is required for update operation");
      }

      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_update",
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
  static async updatePointDeliveryField(srNo, fieldName, fieldValue) {
    try {
      if (!srNo) {
        throw new Error("SrNo is required for update operation");
      }

      const updateData = {
        SrNo: srNo,
        [fieldName]: fieldValue,
      };

      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_update",
        params: updateData,
        functionName: "UpdateField)",
      });

      return response;
    } catch (error) {
      console.error("Error updating delivery field:", error);
      throw error;
    }
  }

  // Delete delivery record
  static async deletePointDelivery(srNo) {
    try {
      if (!srNo) {
        throw new Error("SrNo is required for delete operation");
      }

      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_delete",
        params: { SrNo: srNo },
        functionName: "Delete",
      });

      return response;
    } catch (error) {
      console.error("Error deleting delivery:", error);
      throw error;
    }
  }


  // Delete delivery record
  static async BulkMovePointDelivery(data) {
    try {
      if (!data) {
        throw new Error("Data is required for bulk move operation");
      }

      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_bulk_order_add",
        params: { OrderIds: data },
        functionName: "Bulk Add To Order",
      });

      return response;
    } catch (error) {
      console.error("Error Moving Point to Next Status:", error);
      throw error;
    }
  }

  static async AddRemark(remarkData) {
    try {
      if (!remarkData?.PointId || !remarkData?.Remark) {
        throw new Error("Both PointId and Remark are required to add a remark.");
      }

      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_add_remark",
        params: remarkData,
        functionName: "Add Remark",
      });

      return response;
    } catch (error) {
      console.error("Error adding remark to point:", error);
      throw error;
    }
  }


  static async AddAssignee(assigneeList) {
    try {
      if (!Array.isArray(assigneeList)) {
        throw new Error("Invalid input: assigneeList must be an array.");
      }

      if (assigneeList.length === 0) {
        throw new Error("Assignee list cannot be empty.");
      }
      const response = await PointToBeDiscuss.requestToApi({
        mode: "assign_employee",
        params: { AssignmentsJson: JSON.stringify(assigneeList), PointId: assigneeList[0]?.DeliveryID },
        functionName: "Add Employee",
      });

      return response;
    } catch (error) {
      console.error("Error adding Employee(s):", error);
      throw error;
    }
  }




  static async CreateStatusMaster(data) {
    try {
      if (!data?.Status) {
        throw new Error("Status is required to create a point.");
      }

      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_create_master",
        params: data,
        functionName: "Master Create",
      });

      return response?.Data?.rd[0];
    } catch (error) {
      console.error("Error creating point:", error);
      throw error;
    }
  }
  static async CstatusListMaster() {
    try {
      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_list_master",
        params: {},
        functionName: "List Master",
      });

      return response;
    } catch (error) {
      console.error("Error fetching point list:", error);
      throw error;
    }
  }

  static async CstatusDeleteMaster(CurrentStatus) {
    try {
      if (!CurrentStatus) {
        throw new Error("CurrentStatus is required to delete a point.");
      }

      const response = await PointToBeDiscuss.requestToApi({
        mode: "point_delete_master",
        params: CurrentStatus,
        functionName: "Delete Master",
      });

      return response;
    } catch (error) {
      console.error("Error deleting point:", error);
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

export default PointToBeDiscuss;
