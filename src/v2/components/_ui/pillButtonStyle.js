/** Shared segmented pill action styling. */
export const getPillButtonStyle = (isActive = false) => ({
  width: 34,
  height: 32,
  borderRadius: "25px",
  backgroundColor: isActive ? "#FFFFFF" : "transparent",
  boxShadow: isActive ? "0px 1px 3px rgba(139, 7, 167, 0.16)" : "none",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: isActive ? "#FFFFFF" : "rgba(139, 7, 167, 0.08)",
  },
});

export default getPillButtonStyle;
