import axios from "axios";
import { BaseAPI } from "./BaseAPI";

const UPLOAD_URL = BaseAPI.BASE_URL.replace("/report", "/upload");

let APIURL = UPLOAD_URL;

export const filesUploadApi = async ({ attachments, folderName, uniqueNo, ukey }) => {
  const formData = new FormData();

  const filesArray = Array.isArray(attachments) ? attachments : [attachments];
  const uploadTimestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");

  filesArray.forEach((file, index) => {
    // Only Blob/File uploads support a filename override. Keep the previous
    // FormData behavior for any other value passed by an existing caller.
    if (typeof Blob === "undefined" || !(file instanceof Blob)) {
      formData.append("fileType", file);
      return;
    }

    const originalName = file.name || `attachment-${index + 1}`;
    const extensionIndex = originalName.lastIndexOf(".");
    const hasExtension = extensionIndex > 0;
    const title = hasExtension ? originalName.slice(0, extensionIndex) : originalName;
    const extension = hasExtension ? originalName.slice(extensionIndex) : "";
    const timestampedName = `${title}_${uploadTimestamp}_${index + 1}${extension}`;

    formData.append("fileType", file, timestampedName);
  });

  formData.append("folderName", folderName);
  formData.append("uKey", ukey);
  formData.append("uniqueNo", uniqueNo);

  try {
    const response = await axios.post(APIURL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("File upload failed:", error);
    throw error;
  }
};

export const fileRemoveApi = async ({ attachments }) => {
  const formattedAttachments = Array.isArray(attachments) ? attachments.map((item) => ({ imageUrl: item })) : [{ imageUrl: attachments }];

  try {
    const response = await axios.post(APIURL, formattedAttachments);
    return response.data;
  } catch (error) {
    console.error("File remove failed:", error);
    throw error;
  }
};
