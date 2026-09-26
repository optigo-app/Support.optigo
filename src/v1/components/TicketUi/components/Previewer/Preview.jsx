import React, { useMemo } from "react";
import DocumentPreviewer from "../../../../services/DocumentPreviewer";

/**
 * Normalizes varied attachment inputs (string, comma-separated string, object, array)
 * into the format required by DocumentPreviewer: [{ name: string, url: string }]
 */
const normalizeAttachments = (attachments) => {
  if (!attachments) return [];

  let rawList = [];
  if (Array.isArray(attachments)) {
    rawList = attachments;
  } else if (typeof attachments === "string") {
    rawList = attachments.split(",").map((s) => s.trim()).filter(Boolean);
  } else if (typeof attachments === "object") {
    rawList = [attachments];
  }

  return rawList
    .map((item, index) => {
      if (!item) return null;
      if (typeof item === "string") {
        const cleanUrl = item.trim();
        if (!cleanUrl) return null;
        const nameFromUrl = cleanUrl.split("/").pop()?.split("?")[0] || `File_${index + 1}`;
        return {
          name: decodeURIComponent(nameFromUrl),
          url: cleanUrl,
        };
      }
      if (typeof item === "object") {
        const url = item.url || item.preview || item.filePath || item.fileUrl || "";
        if (!url) return null;
        const name =
          item.name ||
          item.fileName ||
          decodeURIComponent(url.split("/").pop()?.split("?")[0] || `File_${index + 1}`);
        return {
          name,
          url,
          ...item,
        };
      }
      return null;
    })
    .filter(Boolean);
};

const Preview = ({
  attachments = [],
  files,
  open,
  isOpen,
  setOpen,
  onClose,
  currentIndex = 0,
  initialIndex = 0,
  onNavigate,
}) => {
  const isModalOpen = Boolean(open ?? isOpen);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (setOpen) {
      setOpen(false);
    }
  };

  const normalizedFiles = useMemo(() => {
    if (files && Array.isArray(files) && files.length > 0) {
      return files;
    }
    return normalizeAttachments(attachments);
  }, [attachments, files]);

  const activeIndex = currentIndex || initialIndex || 0;

  if (!isModalOpen || normalizedFiles.length === 0) {
    return null;
  }

  return (
    <DocumentPreviewer
      files={normalizedFiles}
      currentIndex={activeIndex}
      isOpen={isModalOpen}
      onClose={handleClose}
      onNavigate={onNavigate}
    />
  );
};

export default Preview;
