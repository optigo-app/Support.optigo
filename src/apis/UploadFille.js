import axios from "axios";

// let APIURL = process.env.NODE_ENV === "development" ? "http://nextjstest.web/api/upload" : "https://livenx.optigoapps.com/api/upload";
let APIURL = "http://nextjstest.web/api/upload";

export const filesUploadApi = async ({ attachments, folderName, uniqueNo, ukey }) => {
    const formData = new FormData();

    const filesArray = Array.isArray(attachments) ? attachments : [attachments];

    filesArray.forEach((file) => {
        formData.append("fileType", file);
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
    const formattedAttachments = Array.isArray(attachments)
        ? attachments.map(item => ({ imageUrl: item }))
        : [{ imageUrl: attachments }];

    try {
        const response = await axios.post(APIURL, formattedAttachments);
        return response.data;
    } catch (error) {
        console.error("File remove failed:", error);
        throw error;
    }
};