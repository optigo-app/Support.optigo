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


export const getFileIcon = (filename) => {
  if (!filename || typeof filename !== "string") {
    return <InsertDriveFileIcon color="action" fontSize="large" />;
  }

  const ext = filename.split(".").pop().toLowerCase();

  switch (ext) {
    case "pdf":
      return <PictureAsPdfIcon color="error" fontSize="large" />;
    case "xlsx":
    case "xls":
    case "csv":
      return <TableChartIcon color="success" fontSize="large" />;
    case "docx":
    case "doc":
      return <DescriptionIcon color="primary" fontSize="large" />;
    case "json":
      return <DataObjectIcon color="secondary" fontSize="large" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <ImageIcon color="info" fontSize="large" />;
    default:
      return <InsertDriveFileIcon color="action" fontSize="large" />;
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
  if (!dateString) return ;
  const date = new Date(dateString); // Convert the string to a JavaScript Date object
  const formattedClosedTime = date?.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return formattedClosedTime;
}