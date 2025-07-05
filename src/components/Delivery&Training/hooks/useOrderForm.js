import { useEffect, useState } from "react";
import { useDelivery } from "../context/DeliveryProvider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useSnackbar } from "./useSnackBar";
import { useNotification } from "../../../hoc/withNotificationDT";

export const initialState = {
  date: new Date().toISOString().split('T')[0],
  clientCode: "",
  createdBy: "",
  ticketNo: "",
  ticketDate: "",
  requestDate: "",
  topic: "",
  topicType: "",
  description: "",
  assignments: [], // untouched
  serviceType: "", // untouched
  paymentStatus: "Unpaid",
  OrderNo: "", // untouched
  onDemand: "yes",
  approvedStatus: "Pending",
  paymentMethod: "",
  sentMail: false,
  codeUploadTime: "1",
  communicationWith: "",
  confirmationDate: "",
  NoPrints: "",
};
export const useOrderForm = () => {


  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const { addData } = useDelivery();
  const navigate = useNavigate();
  const { user, LoggedUser } = useAuth()
  const { showNotification } = useNotification();


  useEffect(() => {
    if (LoggedUser) {
      setFormData(prev => ({ ...prev  , createdBy: LoggedUser }))
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
    console.log("🚀 ~ addAssignment ~ assignment:", assignment)
    setFormData((prev) => {
      const isDuplicate = prev.assignments.some(a => a.user === assignment.user);
      if (isDuplicate) {
        showNotification("User already exists in assignment.", "error")
        return prev;
      }
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
      const isDuplicate = prev.assignments.some(
        (a, i) => i !== index && a.user === updatedAssignment.user
      );
      if (isDuplicate) {
        showNotification("User already exists in assignment.", "error")
        return prev;
      }
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
      communicationWith,
      confirmationDate
    } = formData;

    if (!clientCode) newErrors.clientCode = "Client Code is required.";
    if (!ticketNo) newErrors.ticketNo = "Ticket Number is required.";
    if (!topic) newErrors.topic = "Topic is required.";
    if (!topicType) newErrors.topicType = "Topic Type is required.";
    if (!description) newErrors.description = "Description is required.";
    if (!requestDate) newErrors.requestDate = "Request Date is required.";
    if (!date) newErrors.date = "Date is required.";
    if (!ticketDate) newErrors.ticketDate = "Ticket Date is required.";
    // if (!serviceType) newErrors.serviceType = "Service Type is required.";
    if (!paymentStatus) newErrors.paymentStatus = "Payment Status is required.";
    if (!createdBy) newErrors.createdBy = "Created By is required.";
    if (!communicationWith) newErrors.communicationWith = "Communication With is required.";
    // if (!confirmationDate) newErrors.confirmationDate = "Confirmation Date is required.";
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
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      console.log("🚀 ~ handleSave ~ formData:", formData)
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
    setFormData,
    validateForm
  };
};