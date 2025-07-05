import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import DataObjectIcon from "@mui/icons-material/DataObject";
import TableChartIcon from "@mui/icons-material/TableChart";

export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${size} ${units[i]}`;
}


export const getFileIcon = (input) => {
  if (!input || typeof input !== "string") {
    return <InsertDriveFileIcon color="action" fontSize="medium" />;
  }
  try {
    const url = new URL(input);
    input = url.pathname;
  } catch (e) {
  }

  const segments = input.split(".");
  if (segments.length < 2) {
    return <InsertDriveFileIcon color="action" fontSize="medium" />;
  }

  const ext = segments.pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return <PictureAsPdfIcon color="error" fontSize="medium" />;
    case "xlsx":
    case "xls":
    case "csv":
      return <TableChartIcon color="success" fontSize="medium" />;
    case "docx":
    case "doc":
      return <DescriptionIcon color="primary" fontSize="medium" />;
    case "json":
      return <DataObjectIcon color="secondary" fontSize="medium" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <ImageIcon color="info" fontSize="medium" />;
    default:
      return <InsertDriveFileIcon color="action" fontSize="medium" />;
  }
};

export const getFileMetaData = (input) => {
  if (!input || typeof input !== "string") {
    return {
      extension: "",
      type: "unknown",
      icon: <InsertDriveFileIcon color="action" fontSize="medium" />,
    };
  }

  // Strip query params and extract path if input is a URL
  try {
    const url = new URL(input);
    input = url.pathname; // e.g., /folder/file.pdf
  } catch (e) {
    // Not a URL, no change
  }

  const segments = input.split(".");
  if (segments.length < 2) {
    return {
      extension: "",
      type: "unknown",
      icon: <InsertDriveFileIcon color="action" fontSize="medium" />,
    };
  }

  const extension = segments.pop().toLowerCase();

  // Match extension to metadata
  switch (extension) {
    case "pdf":
      return {
        extension,
        type: "PDF Document",
        icon: <PictureAsPdfIcon color="error" fontSize="medium" />,
      };
    case "xlsx":
    case "xls":
    case "csv":
      return {
        extension,
        type: "Spreadsheet",
        icon: <TableChartIcon color="success" fontSize="medium" />,
      };
    case "docx":
    case "doc":
      return {
        extension,
        type: "Word Document",
        icon: <DescriptionIcon color="primary" fontSize="medium" />,
      };
    case "json":
      return {
        extension,
        type: "JSON Data",
        icon: <DataObjectIcon color="secondary" fontSize="medium" />,
      };
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
    case "bmp":
    case "tiff":
    case "ico":
    case "avif":
      return {
        extension,
        type: "Image",
        icon: <ImageIcon  fontSize="medium" />,
      };
    case "txt":
      return {
        extension,
        type: "Text File",
        icon: <InsertDriveFileIcon color="info" fontSize="medium" />,
      };
    default:
      return {
        extension,
        type: "Unknown File",
        icon: <InsertDriveFileIcon color="action" fontSize="medium" />,
      };
  }
};

export function similarity(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  let totalChars = 0;
  let matched = 0;

  const map = {};

  for (let c of s2) map[c] = (map[c] || 0) + 1;

  for (let c of s1) {
    if (map[c]) {
      matched++;
      map[c]--;
    }
    totalChars++;
  }

  return matched / Math.max(s1.length, s2.length);
}

export function findCompanyAndClosestOwner(CurrentCall, COMPANY_INFO_MASTER) {
  const companyName = CurrentCall?.company?.trim().toLowerCase() || "";
  const callByName = CurrentCall?.callBy?.trim().toLowerCase() || "";
  let possibleMatches = COMPANY_INFO_MASTER?.filter(
    (item) => item?.CompanyName?.trim().toLowerCase() === companyName
  );
  if (!possibleMatches || possibleMatches.length === 0) {
    return null;
  }
  if (possibleMatches.length === 1) {
    return possibleMatches[0];
  }
  let bestMatch = null;
  let highestScore = 0;

  for (const company of possibleMatches) {
    const owner = company?.owner?.trim().toLowerCase();
    if (!owner || !callByName) continue;

    const score = similarity(owner, callByName);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = company;
    }
  }
  return bestMatch || null;
}

export function getFormattedDate(dateString) {
  if (!dateString) return;
  const date = new Date(dateString); // Convert the string to a JavaScript Date object
  const formattedClosedTime = date?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return formattedClosedTime;
}

  export const ValidFile = (link)=>{
      return typeof link === "string"
                ? link.split("/")?.pop()?.substring(0, 20)
                : "File Attachment"
  }


  export const ValidateAttachment = (comment) => {
    let attachments = [];
    try {
        if (typeof comment.attachment === "string") {
            attachments = comment.attachment.split(",").map((url) => url.trim());
        } else if (Array.isArray(comment.attachment)) {
            attachments = comment.attachment;
        } else if (comment.attachment?.imageUrl) {
            attachments = [comment.attachment.imageUrl];
        }

        return {
            attachments,
            isMultiple: attachments?.length > 1
        }

    } catch (error) {
        return {
            attachments: [],
            isMultiple: false,
            error
        }
    }
}