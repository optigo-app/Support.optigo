import { ContentState, convertToRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { useRef, useState } from "react";
import { getCustomerAndPackageFromProject } from "../constants/constants";
import htmlToDraft from "html-to-draftjs";
import { useTraining } from "../context/TrainingProvider";

export const INITIAL_FORM_DATA = {
    date: "",
    projectCode: "",
    ticketNo: "",
    trainingType: "",
    trainingMode: "",
    trainingBy: "",
    attendees: "",
    startTime: "",
    endTime: "",
    details: "",
    customerType: "",
    packageInfo: "",
    status: "Pending",
    remarks: "",
};
export const useTrainingForm = () => {
    const today = new Date().toISOString().split('T')[0];
    const [pageSize, setPageSize] = useState(15);
    const [ShowTrainingForm, setShowTrainingForm] = useState(false);
    const [DetailModal, setDetailModal] = useState(null);
    const [errors, setErrors] = useState({});
    const [sortModel, setSortModel] = useState([
        { field: "ticketDate", sort: "desc" },
    ]);
    const [EditData, setEditData] = useState(null);
    const [formData, setFormData] = useState({
        ...INITIAL_FORM_DATA,
        date: today,
    });
    const editorRef = useRef();
    const [editorState, setEditorState] = useState(null);
    const [timer, setTimer] = useState(null);
    const { COMPANY_MASTER_LIST, addTraining } = useTraining();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        validateSingleField(name, value);
    };

    // Save editor content to formData
    const saveEditorContent = (newState) => {
        const currentContent = newState.getCurrentContent();
        const rawContent = convertToRaw(currentContent);
        const html = draftToHtml(rawContent);
        setFormData((prev) => ({ ...prev, details: html }));
    };

    const handleEditorChange = (newState) => {
        saveEditorContent(newState);
    };

    const handleChangeProject = (value) => {
        setFormData((prev) => ({
            ...prev,
            projectCode: value,
        }));
        validateSingleField("projectCode", value);

        if (timer) clearTimeout(timer);
        const newTimer = setTimeout(() => {
            const { customerType, packageType } = getCustomerAndPackageFromProject(COMPANY_MASTER_LIST, value);
            setFormData((prev) => ({
                ...prev,
                customerType: customerType,
                packageInfo: packageType,
            }));
        }, 500);
        setTimer(newTimer);
    };

    const handleChangeTraining = (value) => {
        setFormData((prev) => ({
            ...prev,
            trainingBy: value,
        }));
        validateSingleField("trainingBy", value);
    };

    const validateForm = () => {
        return new Promise((resolve) => {
            const newErrors = {};
            const {
                date,
                projectCode,
                ticketNo,
                trainingType,
                trainingMode,
                trainingBy,
                attendees,
                startTime,
                endTime,
                status,
            } = formData;

            if (!date) newErrors.date = "Date is required.";
            if (!projectCode) newErrors.projectCode = "Project Code is required.";
            if (!ticketNo) newErrors.ticketNo = "Ticket Number is required.";
            if (!trainingType) newErrors.trainingType = "Training Type is required.";
            if (!trainingMode) newErrors.trainingMode = "Training Mode is required.";
            if (!trainingBy) newErrors.trainingBy = "Trainer name is required.";
            if (!attendees) newErrors.attendees = "Number of attendees is required.";
            if (!startTime) newErrors.startTime = "Start Time is required.";
            if (!endTime) newErrors.endTime = "End Time is required.";
            if (!status) newErrors.status = "Status is required.";

            if (startTime && endTime && startTime > endTime) {
                newErrors.endTime = "End Time must be later than or equal to Start Time.";
            }

            setErrors(newErrors);
            resolve(Object.keys(newErrors).length === 0);
        });
    };

    const validateSingleField = (name, value) => {
        let message = "";

        switch (name) {
            case "date":
                if (!value) message = "Date is required.";
                break;
            case "projectCode":
                if (!value) message = "Project Code is required.";
                break;
            case "ticketNo":
                if (!value) message = "Ticket Number is required.";
                break;
            case "trainingType":
                if (!value) message = "Training Type is required.";
                break;
            case "trainingMode":
                if (!value) message = "Training Mode is required.";
                break;
            case "trainingBy":
                if (!value) message = "Trainer name is required.";
                break;
            case "attendees":
                if (!value) message = "Number of attendees is required.";
                break;
            // case "startTime":
            //     if (!value) message = "Start Time is required.";
            //     break;
            // case "endTime":
            //     if (!value) message = "End Time is required.";
            //     break;
            case "status":
                if (!value) message = "Status is required.";
                break;
            case "startTime":
            case "endTime":
                const st = name === "startTime" ? value : formData.startTime;
                const et = name === "endTime" ? value : formData.endTime;

                if (!value) {
                    message = name === "startTime" ? "Start Time is required." : "End Time is required.";
                } else if (st && et && st > et) {
                    message = "End Time must be later than or equal to Start Time.";
                }
                break;

            default:
                break;
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: message,
        }));
    };

    const handleSave = async (data) => {
        try {
            const isValid = await validateForm();
            if (!isValid) {
                const errorMessages = Object.entries(errors)
                    .filter(([_, value]) => value)
                    .map(([_, msg]) => msg);
    
                const errorMessage = errorMessages.length > 0
                    ? errorMessages.join(', ') 
                    : "Some required fields are missing.";
    
                    throw new Error("These fields are mandatory. Please fill in all required fields.");
            }
    
           const result =  await addTraining(data); 
            handleClose(); 
            return { success: true };
        } catch (error) {
            console.error("Save failed:", error.message || error);
            return { success: false, message: error.message || "Something went wrong while saving." };
        }
    };
    
    



    const handleClose = () => {
        setFormData(INITIAL_FORM_DATA);
        setEditorState(null);
        setShowTrainingForm(false);
        setEditData(null);
        setEditorState(EditorState.createEmpty());

    };

    return {
        pageSize,
        setPageSize,
        ShowTrainingForm,
        setShowTrainingForm,
        DetailModal,
        setDetailModal,
        sortModel,
        setSortModel,
        formData,
        setFormData,
        editorRef,
        editorState,
        setEditorState,
        handleChange,
        handleEditorChange,
        handleChangeProject,
        handleChangeTraining,
        saveEditorContent,
        EditData,
        setEditData,
        handleClose,
        handleSave,
        errors,
        validateForm
    };
};
