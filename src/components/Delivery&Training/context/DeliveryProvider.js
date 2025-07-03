import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { mapToApiKey } from "../utils/deliveryUtils";
import DeliveryAPI from './../../../apis/DeliveryController';

/**
 * @typedef {Object} Assignment
 * @property {string} user
 * @property {string} task
 */

/**
 * @typedef {Object} DeliveryItem
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
 * @typedef {Object} DeliveryContextType
 * @property {DeliveryItem[]} deliveryData
 * @property {(data: DeliveryItem) => void} addData
 * @property {(id: string | number, updatedFields: Partial<DeliveryItem>, user?: User) => void} editData
 * @property {() => void} resetData
 */

const DeliveryContext = createContext(/** @type {DeliveryContextType} */(null));


export const DeliveryProvider = ({ children }) => {
    const [deliveryData, setDeliveryData] = useState([]);
    const [refresh, setrefresh] = useState(false);
    const [masterData, setMasterData] = useState(() => {
        const stored = sessionStorage.getItem("DELIVERY_MASTER_DATA");
        return stored ? JSON.parse(stored) : { customer: null, employees: null };
    });

    const COMPANY_MASTER_LIST =
        masterData?.customer?.map((item) => ({
            label: item?.CustomerCode,
            value: item.Id,
            ...item,
        })) || [];
        
    const EMPLOYEE_LIST = masterData?.employees?.map((item) => ({
        label: item?.user,
        value: item?.userid,
        DesignationId: item?.DesignaitonId,
        UserId: item?.userid,
        User: item?.user,
        Designation: item?.designation

    }));

    const EMPLOYEE_GROUP_BY_DESIGNATION = EMPLOYEE_LIST && Object?.groupBy(EMPLOYEE_LIST, ({ Designation }) => Designation);


    useEffect(() => {
        const GetMasterData = async () => {
            try {
                const [master, employees] = await Promise.all([DeliveryAPI.getCustomerMaster(), DeliveryAPI.getEmployeeList()]);
                const data = { customer: master?.Data?.rd || [], employees: employees?.Data?.rd || [] };
                setMasterData(data);
                sessionStorage.setItem("DELIVERY_MASTER_DATA", JSON.stringify(data));
            } catch (err) {
                console.error("Error DELIVERY_MASTER_DATA -->>> ", err.message);
            }
        };
        if (!sessionStorage.getItem("DELIVERY_MASTER_DATA")) {
            GetMasterData();
        }
    }, []);

    useEffect(() => {
        const fetchDeliveryData = async () => {
            try {
                const response = await DeliveryAPI.getDeliveryList();
                setDeliveryData(response?.Data?.rd, "response");
            } catch (error) {
                console.log(error);
            }
        };
        fetchDeliveryData();
    }, [refresh]);



    // Add Order to database
    const addData = async (data) => {
        try {
            const {
                clientCode,
                createdBy,
                ticketNo,
                ticketDate,
                requestDate,
                topic,
                topicType,
                NoPrints,
                description,
                serviceType,
                paymentStatus,
                paymentMethod,
                approvedStatus,
                communicationWith,
                confirmationDate,
                codeUploadTime,
                assignments,
                onDemand
            } = data;

            const AssignmentsJson = JSON.stringify(
                assignments.map(({ department, user, userId, estimate }) => ({
                    Department: department || "",
                    AssignedTo: user || "",
                    AssignedToUserId: userId || "",
                    EstimatedHours: estimate?.hours || 0,
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
            };

            const response = await DeliveryAPI.createDelivery(payload);
            console.log("Delivery created:", response);

            setrefresh((prev) => !prev);
            return true; // ✅ Success
        } catch (error) {
            console.error("Error Delivery API createDelivery:", error);
            return false; // ❌ Failure
        }
    };


    const editData = async (id, data) => {
        console.log("🚀 ~ editData ~ data:", data)
        try {
            const payload = {};
            Object.entries(data).forEach(([key, value]) => {
                if (
                    value !== undefined &&
                    value !== null &&
                    (typeof value !== "string" || value.trim() !== "") &&
                    !Array.isArray(value)
                ) {
                    payload[mapToApiKey(key)] = value;
                }
            });

            if (Array.isArray(data.assignments) && data.assignments.length > 0) {
                payload.AssignmentsJson = JSON.stringify(
                    data.assignments.map(({ department, user, userId, estimate }) => ({
                        Department: department || "",
                        AssignedTo: user || "",
                        AssignedToUserId: userId || "",
                        EstimatedHours: estimate?.hours || 0,
                    }))
                );
            }
           

            const response = await DeliveryAPI.updateDelivery({ ...payload, SrNo: id });
            console.log("Delivery Updated:", response);
            setrefresh((prev) => !prev);
            return true;
        } catch (error) {
            console.error("Error Delivery API Update Delivery:", error);
            return false;
        }
    };
    const deleteTraining = async (id) => {
        try {
            const res = await DeliveryAPI.deleteDelivery(id);
            setrefresh((prev) => !prev);
            return true;
        } catch (error) {
            console.error('Error deleting training:', error);
            return false;
        }
    };

    const props = {
        deliveryData,
        addData,
        editData,
        COMPANY_MASTER_LIST,
        EMPLOYEE_LIST,
        EMPLOYEE_GROUP_BY_DESIGNATION ,
        deleteTraining
    };

    return <DeliveryContext.Provider value={props}>{children}</DeliveryContext.Provider>;
};

/** @returns {DeliveryContextType} */
export const useDelivery = () => useContext(DeliveryContext);
