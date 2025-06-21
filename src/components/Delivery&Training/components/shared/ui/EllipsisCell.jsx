
export const EllipsisCell = ({ value }) => (
    <span
      style={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "block",
        maxWidth: "100%",
      }}
      title={value}
    >
      {value}
    </span>
  );