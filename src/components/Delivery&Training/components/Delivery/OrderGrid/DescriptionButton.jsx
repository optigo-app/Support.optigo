import { Box, IconButton, Tooltip } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { copyToClipboard } from "../../../utils/helpers";
import EditDescriptionModal from "./EditDescriptionModal";
import { useState } from "react";
import EmailTemplateModal from "./FallBackEmail";
import { useNotification } from './../../../../../hoc/withNotificationDT';

const DescriptionButton = ({ params, onEdit, isClient }) => {
  const { showNotification } = useNotification();
  const [ShowDescModal, setShowDescModal] = useState(false);
  const [fallBackModal, setfallBackModal] = useState(false);

  const handleClipboard = async () => {
    try {
      const success = await copyToClipboard(isClient ? params?.row?.Description : params?.row, isClient);
      if (success) {
        showNotification("Copied to clipboard", "success");
      } else {
        setfallBackModal(true);
      }
    } catch (error) {
      showNotification(error.message || error.toString(), "error");
      setfallBackModal(true);
    }
  };

  return (
    <>
      <EditDescriptionModal
        initialDescription={params?.row?.Description}
        onClose={() => setShowDescModal(false)}
        open={ShowDescModal}
        showNotification={showNotification}
        onSave={(newDescription) => {
          onEdit(params?.row?.SrNo, { "Description": newDescription })
          setShowDescModal(false);
        }}
      />
      <EmailTemplateModal
        open={fallBackModal}
        setOpen={setfallBackModal}
        ticket={params?.row}
      />
      <Box display="flex" justifyContent={"center"} alignItems={"center"} gap={1} sx={{ mx: "auto" }}>
        <Tooltip title="Copy">
          <IconButton
            onClick={handleClipboard}
            size="small"
            sx={{
              backgroundColor: "#e3f2fd",  // soft blue background
              color: "#1565c0",            // strong blue icon color
              "&:hover": {
                backgroundColor: "#bbdefb", // slightly stronger blue on hover
              },
            }}
          >
            <ContentCopyRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {!isClient && <Tooltip title="Edit Description">
          <IconButton onClick={() => setShowDescModal(true)} size="small" sx={{
            backgroundColor: "#d0f0c0",  // soft light green
            color: "#2e7d32",            // medium green icon color
            "&:hover": {
              backgroundColor: "#a5d6a7", // deeper green hover
            },
          }}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>}
      </Box>
    </>
  );
};

export default DescriptionButton;
