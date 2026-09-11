import React from "react";
import { FilePreviewModal } from "@eternalheart/react-file-preview";
import "@eternalheart/react-file-preview/style.css";

const DocumentPreviewer = ({ files, currentIndex, isOpen, onClose }) => {
  return (
    <>
      <FilePreviewModal
        files={files}
        currentIndex={currentIndex}
        isOpen={isOpen}
        onClose={onClose}
        locale="en-US"
      />
    </>
  );
};

export default DocumentPreviewer;
