import React, { useEffect } from "react";
import { Box, Typography, IconButton, Divider } from "@mui/material";
import BorderColorRoundedIcon from "@mui/icons-material/BorderColorRounded";
import CloseIcon from "@mui/icons-material/Close";
import { useTicket } from "../../../../context/useTicket";
import { generateTicketNumber } from "../../../../utils/UniqueId";
import { validateForm } from "../../../../utils/FormValidator";
import imag1 from "../../../../assets/1.png";
import { useAuth } from "../../../../context/UseAuth";
import { useNavigate } from "react-router-dom";
import { useCallLog } from "../../../../context/UseCallLog";
import Form from "./Form";
import AdvertisementBanner from "./AdvertisementBanner";
import ActionButton from "./ActionButton";
import { filesUploadApi } from "../../../../apis/UploadFille";
import { v4 as uuidv4 } from 'uuid';

const initialFormState = {
  TicketNo: "",
  projectCode: "",
  userName: "",
  category: "",
  subject: "",
  Mainsubject: "",
  instruction: "",
  attachment: null,
  keywords: "",
  Status: "New",
  Priority: "Low",
  star: false,
  FollowUp: "",
  Del: "",
  Age: "",
  PromiseDate: "",
  UpdatedAt: new Date().toISOString(),
  LastUpdatedBy: "",
  CreatedOn: new Date().toISOString(),
  Comments: [],
  sendMail: true,
  appname: "",
  createdby: "",
  isSuggested: false,
  CallId: [],
};

export default function CreateTicketForm({ handleCloseDetail, showNotification, prefilledData }) {
  const [form, setForm] = React.useState(initialFormState);
  const [attachment, setAttachment] = React.useState([]);
  const [previewURL, setPreviewURL] = React.useState(null);
  const [errors, setErrors] = React.useState({});
  const { user, CompanyInfo } = useAuth();
  const { addTicket } = useTicket();
  const Navigater = useNavigate();
  const { editCall } = useCallLog();
  const ImageId = uuidv4();
  const HandleResetform = () => {
    setForm(initialFormState);
    setAttachment([]);
    setPreviewURL(null);
  };
  useEffect(() => {
    if (prefilledData) {
      setForm({
        ...initialFormState,
        projectCode: prefilledData?.company || "",
        userName: prefilledData?.callBy || "",
        appname: prefilledData?.appname || "",
        instruction: prefilledData?.description || "",
      });
    }
  }, [prefilledData]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: false });
    // showNotification("Invalid input data!", "error");
  };

  const handleSubmit = async ({ saveAndAddNew }) => {
    let uploadFilePath = null;
    if (!attachment || attachment.length === 0) {

    } else {
      uploadFilePath = await filesUploadApi({
        ukey: CompanyInfo?.ukey,
        folderName: "Ticket",
        uniqueNo: ImageId,
        attachments: attachment?.map((file) => file.file),
      })
      console.log("uploadFilePath", uploadFilePath?.files);
    }
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const ticketWithId = {
        ...form,
        createdby: user?.name,
        TicketNo: generateTicketNumber(),
        Comments: [],
        CallId: prefilledData ? [prefilledData?.id] : [],
        attachment: uploadFilePath?.files
          ? uploadFilePath.files.map((file) => file.url).join(",")
          : "",
      };
      if (saveAndAddNew === true) {
        addTicket(ticketWithId);
        HandleResetform();
        showNotification("Ticket created successfully! You can add another ticket.", "success");
        return;
      }
      addTicket(ticketWithId);
      if (prefilledData) {
        editCall(prefilledData?.id, { ticket: ticketWithId?.TicketNo });
      }
      Navigater("/ticket", { replace: true });
      showNotification("Ticket created successfully!", "success");
      HandleResetform();
      handleCloseDetail();
    } else {
      showNotification("Please fill all required fields!", "error");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      const fileObjects = files.map((file) => ({
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
      }));

      setAttachment(fileObjects);
      setPreviewURL(fileObjects[0].preview);

      setForm({
        ...form,
        preview: fileObjects[0].preview,
      });
    }
  };



  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        overflow: "hidden",
        bgcolor: "#ffffff",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "50%",
          mx: "auto",
          p: 3,
          borderRadius: 0,
          boxShadow: 0,
          background: "white",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h6" color={"gray"}>
              <BorderColorRoundedIcon color="disabled" size={22} /> Create a New Ticket
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Typography variant="caption" color={"red"}>
                * Mandatory Fields
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={handleCloseDetail} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Form attachment={attachment} form={form} errors={errors} handleChange={handleChange} handleFileChange={handleFileChange} previewURL={previewURL} />
        <ActionButton handleSubmit={handleSubmit} />
      </Box>
      <AdvertisementBanner src={imag1} />
    </Box>
  );
}
