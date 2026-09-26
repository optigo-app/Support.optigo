import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import PointToBeDiscuss from "../../../apis/PointToBeDiscussController";
import { mapToApiKey } from "../../Delivery&Training/utils/deliveryUtils";
import { useTicket } from "../../../context/useTicket";

/**
 * @typedef {Object} Assignment
 * @property {string} user
 * @property {string} task
 */

/**
 * @typedef {Object} PointToDiscussItem
 * @property {string | number} id
 * @property {string} [date]
 * @property {string} [ticketDate]
 * @property {string} [requestDate]
 * @property {string} clientCode
 * @property {string} createdBy
 * @property {string} ticketNo
 * @property {string} topic
 * @property {string} topicType
 * @property {string} description
 * @property {Assignment[]} [assignments]
 * @property {string} [serviceType]
 * @property {string} [paymentStatus]
 * @property {string} [UpdatedAt]
 * @property {string} [LastUpdatedBy]
 */

/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} PointToDiscussContextType
 * @property {PointToDiscussItem[]} PointToDiscussData
 * @property {(data: PointToDiscussItem) => void} addData
 * @property {(id: string | number, updatedFields: Partial<PointToDiscussItem>, user?: User) => void} editData
 * @property {() => void} resetData
 * @property {(id: string | number) => void} deleteTopic
 * @property {(PointId: string , Remark: string) => void}  AddRemarkToTopic
 * @property {(Title: string ) => void} CreatePointMaster
 * @property {()=>void} FetchPointList
 * @property {(PointId: string ) => void} DeletePointMaster
 * @property {PointToDiscussItem[]} statusList
 */

const PointToDiscussContext = createContext({
  PointTBData: [],
  addData: () => { },
  editData: () => { },
  deleteTopic: () => { },
  AddRemarkToTopic: () => { },
  CreatePointMaster: () => { },
  FetchPointList: () => { },
  DeletePointMaster: () => { },
  statusList: [],
});

export const PointToDiscussProvider = ({ children, showNotification }) => {
  const SESSION_KEY = "pointMasterStatus";
  const [PointTBData, setPointTBData] = useState([]);
  const [refresh, setrefresh] = useState(false);
  const [statusList, setStatusList] = useState(() => {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : [];
  });
  const { setRefresh: setRefreshTicket } = useTicket();

  useEffect(() => {
    const fetchPointDiscussData = async () => {
      try {
        const response = await PointToBeDiscuss.getPointDeliveryList();
        setPointTBData(response?.Data?.rd, "response");
      } catch (error) {
        console.log(error);
      }
    };
    fetchPointDiscussData();
  }, [refresh]);

  useEffect(() => {
    if (statusList.length === 0) {
      FetchPointList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add Order to database
  const addData = async (data) => {
    console.log("🚀 ~ addData ~ data: PointToDiscuss", data)
    try {
      const { clientCode, createdBy, ticketNo, ticketDate, requestDate, topic, topicType, NoPrints, description, serviceType, paymentStatus, paymentMethod, approvedStatus, communicationWith, confirmationDate, codeUploadTime, assignments, onDemand, sampleApprovalDate, TicketId } = data;

      const AssignmentsJson = JSON.stringify(
        assignments.map(({ department, user, userId, estimate, EstimatedHours }) => ({
          Department: department || "",
          AssignedTo: user || "",
          AssignedToUserId: userId || "",
          EstimatedHours: Number(estimate?.hours ?? EstimatedHours ?? 0) || 0,
        }))
      );
      const payload = {
        ClientCode: clientCode || "",
        CreatedBy: createdBy || "",
        TicketNo: ticketNo || "",
        TicketDate: ticketDate || "",
        RequestDate: requestDate || "",
        Topic: topic || "",
        TopicType: topicType || "",
        NoPrints: NoPrints || "",
        Description: description || "",
        ServiceType: serviceType || "",
        PaymentStatus: paymentStatus || "",
        PaymentMethod: paymentMethod || "",
        ApprovedStatus: approvedStatus || "Pending",
        Status: "Pending",
        CommunicationWith: communicationWith || "",
        ConfirmationDate: confirmationDate || "",
        CodeUploadTime: codeUploadTime || "",
        AssignmentsJson,
        OnDemand: onDemand || "",
        SampleApprovalDate: sampleApprovalDate || "",
        TicketId: TicketId || "",
      };

      const response = await PointToBeDiscuss.createPointDelivery(payload);
      showNotification("Topic created successfully!", "success");
      setrefresh((prev) => !prev);
      setRefreshTicket((prev) => !prev)
      return true; // ✅ Success
    } catch (error) {
      showNotification("Topic created failed!", "error");
      return false; // ❌ Failure
    }
  };

  const editData = async (id, data) => {
    try {
      const payload = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && (typeof value !== "string" || value.trim() !== "") && !Array.isArray(value)) {
          payload[mapToApiKey(key)] = value;
        }
      });

      if (Array.isArray(data.assignments) && data.assignments.length > 0) {
        payload.AssignmentsJson = JSON.stringify(
          data.assignments.map(({ department, user, userId, estimate, EstimatedHours }) => ({
            Department: department || "",
            AssignedTo: user || "",
            AssignedToUserId: userId || "",
            EstimatedHours: Number(estimate?.hours ?? EstimatedHours ?? 0) || 0,
          }))
        );
      }

      const response = await PointToBeDiscuss.updatePointDelivery({
        ...payload,
        SrNo: id,
      });
      showNotification("Topic updated successfully!", "success");
      setrefresh((prev) => !prev);
      return true;
    } catch (error) {
      console.error("Error Delivery API Update Delivery:", error);
      showNotification("Topic updated failed!", "error");
      return false;
    }
  };
  const deleteTopic = async (id) => {
    try {
      const res = await PointToBeDiscuss.deletePointDelivery(id);
      showNotification("Topic deleted successfully!", "success");
      setrefresh((prev) => !prev);
      return true;
    } catch (error) {
      console.error("Error deleting training:", error);
      showNotification("Topic deleted failed!", "error");
      return false;
    }
  };

  const AddRemarkToTopic = async (remark) => {
    try {
      const res = await PointToBeDiscuss.AddRemark(remark);
      console.log("🚀 ~ AddRemarkToTopic ~ res:", res);
      showNotification("Remark added successfully!", "success");
      setrefresh((prev) => !prev);
      return true;
    } catch (error) {
      console.error("Error deleting training:", error);
      showNotification("Remark added failed!", "error");
      return false;
    }
  };
  const CreatePointMaster = async (data) => {
    try {
      const res = await PointToBeDiscuss.CreateStatusMaster(data);
      if (res) {
        const status = data?.Status.trim();
        const updatedList = [...statusList, { label: status, value: status }];
        setStatusList(updatedList);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedList));
      }
      console.log("🚀 ~ CreatePointMaster ~ res:", res);
      showNotification("Point master created successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error creating point master:", error);
      showNotification("Point master created failed!", "error");
      return false;
    }
  };

  const FetchPointList = async () => {
    try {
      const res = await PointToBeDiscuss.CstatusListMaster();
      const updatedList = res?.Data?.rd
        ?.map((item) => {
          const status = item?.Status?.trim();
          if (!status) return null;
          return {
            label: status,
            value: status,
          };
        })
        .filter(Boolean); // Remove nulls

      setStatusList(updatedList);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedList));
      return res || [];
    } catch (error) {
      console.error("Error fetching point list:", error);
      return [];
    }
  };

  const DeletePointMaster = async (StatusCode) => {
    try {
      const res = await PointToBeDiscuss.CstatusDeleteMaster(StatusCode);
      const updatedList = statusList?.filter((item) => item?.value !== StatusCode?.CurrentStatus);
      setStatusList(updatedList);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedList));
      showNotification("Status deleted successfully!", "success");
      return true;
    } catch (error) {
      console.error("Error deleting point master:", error);
      showNotification("Status deleted failed!", "error");
      return false;
    }
  };

  const AddEmployee = async (data) => {
    console.log("🚀 ~ AddEmployee ~ data:", data)
    try {
      const res = await PointToBeDiscuss.AddAssignee(data);
      console.log("🚀 ~ AddEmployee ~ res:", res);
      showNotification("Employee added successfully!", "success");
      setrefresh((prev) => !prev);
      return true;
    } catch (error) {
      console.error("Error adding employee:", error);
      showNotification("Employee added failed!", "error");
      return false;
    }
  };
  const MoveToDeliveryBulk = async (data) => {
    try {
      const res = await PointToBeDiscuss.BulkMovePointDelivery(data);
      showNotification("Move to delivery successfully!", "success");
      setrefresh((prev) => !prev);
      return true;
    } catch (error) {
      console.error("Error moving to delivery:", error);
      showNotification("Move to delivery failed!", "error");
      return false;
    }
  };

  const props = {
    PointTBData,
    addData,
    editData,
    deleteTopic,
    AddRemarkToTopic,
    MoveToDeliveryBulk,
    CreatePointMaster,
    FetchPointList,
    DeletePointMaster,
    statusList,
    AddEmployee
  };

  return <PointToDiscussContext.Provider value={props}>{children}</PointToDiscussContext.Provider>;
};

/** @returns {PointToDiscussContextType} */
export const usePointToDiscuss = () => useContext(PointToDiscussContext);

export default PointToDiscussProvider;
