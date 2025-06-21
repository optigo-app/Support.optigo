import { useEffect, useState } from "react";
import { useDelivery } from "../context/DeliveryProvider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export const useOrderForm = () => {
  const initialState = {
    date: new Date().toISOString().split('T')[0],
    clientCode: "CLT-2034",
    createdBy: "Rajan",
    ticketNo: "Tkt-0001",
    ticketDate: "2025-06-12",
    requestDate: "2025-06-11",
    topic: "Rate Change",
    topicType: "Tag",
    description: "Client has requested a change in the service rate for the upcoming billing cycle due to volume increase.",
    assignments: [], // untouched
    serviceType: "", // untouched
    paymentStatus: "Paid",
    OrderNo: "", // untouched
    onDemand: "yes",
    approvedStatus: "Pending",
    paymentMethod: "UPI",
    sentMail: false,
    codeUploadTime: "12",
    communicationWith: "Rajan",
    confirmationDate: "2025-06-19",
    NoPrints: "12",
  };


  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const { addData } = useDelivery();
  const navigate = useNavigate();
  const { user, LoggedUser } = useAuth()

  useEffect(() => {
    if (LoggedUser) {
      setFormData(prev => ({ ...prev, createdBy: LoggedUser }))
    }
  }, [LoggedUser])

  const updateEstimateFields = (assignments) => {

    if (!Array.isArray(assignments)) return estimateMap;

    const estimateMap = {};
    return estimateMap;
  };
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addAssignment = (assignment) => {
    setFormData((prev) => {
      const updatedAssignments = [...prev?.assignments, assignment];
      const updatedEstimates = updateEstimateFields(updatedAssignments);
      return {
        ...prev,
        assignments: updatedAssignments,
        ...updatedEstimates,
      };
    });
  };

  const updateAssignment = (index, updatedAssignment) => {
    setFormData((prev) => {
      const updatedAssignments = [...prev.assignments];
      updatedAssignments[index] = updatedAssignment;
      const updatedEstimates = updateEstimateFields(updatedAssignments);
      return {
        ...prev,
        assignments: updatedAssignments,
        ...updatedEstimates,
      };
    });
  };


  const removeAssignment = (index) => {
    setFormData((prev) => {
      const updatedAssignments = prev.assignments.filter((_, i) => i !== index);
      const updatedEstimates = updateEstimateFields(updatedAssignments);
      return {
        ...prev,
        assignments: updatedAssignments,
        ...updatedEstimates,
      };
    });
  };


  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    const {
      clientCode,
      ticketNo,
      topic,
      topicType,
      description,
      requestDate,
      date,
      ticketDate,
      serviceType,
      paymentStatus,
      createdBy,
      assignments,
    } = formData;

    if (!clientCode) newErrors.clientCode = "Client Code is required.";
    if (!ticketNo) newErrors.ticketNo = "Ticket Number is required.";
    if (!topic) newErrors.topic = "Topic is required.";
    if (!topicType) newErrors.topicType = "Topic Type is required.";
    if (!description) newErrors.description = "Description is required.";
    if (!requestDate) newErrors.requestDate = "Request Date is required.";
    if (!date) newErrors.date = "Date is required.";
    if (!ticketDate) newErrors.ticketDate = "Ticket Date is required.";
    if (!serviceType) newErrors.serviceType = "Service Type is required.";
    if (!paymentStatus) newErrors.paymentStatus = "Payment Status is required.";
    if (!createdBy) newErrors.createdBy = "Created By is required.";

    if (!assignments || assignments.length === 0) {
      newErrors.assignments = "At least one assignment is required.";
    } else {
      assignments.forEach((item, index) => {
        if (!item.department || !item.user || !item.estimate?.hours) {
          newErrors[`assignments_${index}`] =
            "Department, user, and estimate hours are required for all assignments.";
        }
      });
    }

    setErrors(newErrors);
    console.log("🚀 ~ validateForm ~ newErrors:", newErrors)
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      const success = await addData(formData);
      if (success) {
        resetForm();
        return true;
      } else {
        console.error("Saving failed. Please try again.");
        return false;
      }
    } else {
      console.log("Please fix the errors before saving.");
      return false;
    }
  };


  return {
    formData,
    errors,
    updateField,
    addAssignment,
    updateAssignment,
    removeAssignment,
    resetForm,
    handleSave,
    setFormData
  };
};