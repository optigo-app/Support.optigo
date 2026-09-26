import React, { useState, useEffect, useCallback } from "react";
import { FilePreviewModal } from "@eternalheart/react-file-preview";
import "@eternalheart/react-file-preview/style.css";
import * as XLSX from "xlsx";

/**
 * Checks if a byte buffer starts with standard ZIP magic bytes:
 * PK\x03\x04, PK\x05\x06, or PK\x07\x08
 */
const isZipBuffer = (bytes) => {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
  );
};

/**
 * Custom request handler for DocumentPreviewer.
 *
 * @eternalheart/react-file-preview's built-in Excel renderer only supports ZIP-based XLSX via exceljs.
 * Non-ZIP spreadsheets (legacy binary BIFF8 .xls, HTML tables named .xls, XML 2003 spreadsheets, or CSV)
 * cause JSZip to throw:
 * "Can't find end of central directory : is this a zip file ?"
 *
 * This handler detects non-ZIP spreadsheets, parses them via SheetJS (XLSX),
 * and converts them into standard OpenXML XLSX on the fly so the library's built-in
 * Excel viewer renders them natively without errors.
 */
const defaultRequestHandler = async (url, options = {}) => {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      credentials: "include",
    });
  } catch {
    // If credentials: "include" fails (e.g. wildcard CORS), retry with default options
    res = await fetch(url, options);
  }

  if (!res || !res.ok) {
    return res;
  }

  const urlClean = (url || "").toLowerCase().split("?")[0].split("#")[0];
  const isSpreadsheetExt =
    urlClean.endsWith(".xls") ||
    urlClean.endsWith(".xlsx") ||
    urlClean.endsWith(".csv") ||
    urlClean.endsWith(".tsv") ||
    urlClean.endsWith(".xlsm") ||
    urlClean.endsWith(".xlsb");

  const contentType = (res.headers?.get("content-type") || "").toLowerCase();
  const isSpreadsheetMime =
    contentType.includes("excel") ||
    contentType.includes("spreadsheet") ||
    contentType.includes("ms-excel");

  if (isSpreadsheetExt || isSpreadsheetMime) {
    let rawBuffer;
    try {
      rawBuffer = await res.arrayBuffer();
      const bytes = new Uint8Array(rawBuffer);

      // If it's already a valid ZIP file (modern .xlsx), let exceljs parse it directly
      if (isZipBuffer(bytes)) {
        return new Response(rawBuffer, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });
      }

      // Parse legacy/HTML/XML spreadsheet with SheetJS
      const workbook = XLSX.read(rawBuffer, {
        type: "array",
        cellStyles: true,
        cellDates: true,
        cellNF: true,
        raw: false,
      });

      if (workbook && workbook.SheetNames && workbook.SheetNames.length > 0) {
        const xlsxArray = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        return new Response(new Uint8Array(xlsxArray), {
          status: 200,
          statusText: "OK",
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        });
      }

      return new Response(rawBuffer, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    } catch (convErr) {
      console.warn("Spreadsheet conversion fallback:", convErr);
      if (rawBuffer) {
        return new Response(rawBuffer, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        });
      }
    }
  }

  return res;
};

const DocumentPreviewer = ({
  files,
  currentIndex = 0,
  isOpen,
  onClose,
  onNavigate,
  requestHandler,
  onDownload,
  ...rest
}) => {
  const [activeIdx, setActiveIdx] = useState(currentIndex || 0);

  useEffect(() => {
    setActiveIdx(currentIndex || 0);
  }, [currentIndex, isOpen]);

  const handleNavigate = (index) => {
    setActiveIdx(index);
    if (typeof onNavigate === "function") {
      onNavigate(index);
    }
  };

  const handleDownload = useCallback((file) => {
    if (!file?.url) return;
    try {
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name || "download";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(file.url, "_blank");
    }
  }, []);

  return (
    <FilePreviewModal
      files={files}
      currentIndex={activeIdx}
      isOpen={isOpen}
      onClose={onClose}
      onNavigate={handleNavigate}
      requestHandler={requestHandler || defaultRequestHandler}
      onDownload={onDownload || handleDownload}
      locale="en-US"
      {...rest}
    />
  );
};

export default DocumentPreviewer;
