import { createTheme } from "@mui/material";

export const Datetheme = createTheme({
    palette: {
        primary: {
            main: "#f7f468d7",
        },
        secondary: {
            main: "#f50057",
        },
        background: {
            default: "#f5f5f5",
        },

    },
    typography: {
        fontFamily: '"Poppins", sans-serif',
        color: "#fff",
        h4: {
            fontWeight: 600,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: "rgba(90, 90, 90, 0.1) 0px 4px 12px",
                    border: "1px solid rgba(90, 90, 90, 0.1)",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                containedPrimary: {
                    backgroundColor: "#0081ff", // Button color
                    "&:hover": {
                        backgroundColor: "#0070e0",
                    },
                    color: "white",
                },

            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    borderRadius: 8,  // Applies border radius to the entire TextField
                    "& .MuiOutlinedInput-root": {  
                        "& fieldset": {  
                            borderColor: "gray",  // Default border color (gray)
                        },
                        "&:hover fieldset": {  
                            borderColor: "black",  // Darker border on hover
                        },
                        "&.Mui-focused fieldset": {  
                            borderColor: "#1976d2",  // Default MUI blue when focused
                        },
                        "&.Mui-disabled fieldset": {
                            borderColor: "#d1d1d1",  // Light gray when disabled
                        },
                        "&.Mui-error fieldset": {
                            borderColor: "#d32f2f",  // Red border when there's an error
                        },
                    },
                    "& .MuiInputBase-input": {
                        padding: "10px 14px",  // Padding inside the input field
                    },
                    "& .MuiInputLabel-root": {
                        color: "gray",  // Default label color
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#1976d2",  // Label color when focused
                    },
                    "& .MuiInputLabel-root.Mui-error": {
                        color: "#d32f2f",  // Label color when there's an error
                    },
                }
            }
        }
        
    },
});


export const SideBarTheme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#ff5722",
        },

    },
    typography: {
        fontFamily: '"Poppins", sans-serif',
        h4: {
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRadius: 0,
                },
            },
        },
    },
});


export const Maintheme = createTheme({
    palette: {
      primary: {
        main: "#3f51b5",
        title: "#f8e800ee",
      },
      secondary: {
        main: "#f50057",
      },
      background: {
        default: "#f5f5f5",
      },
    },
    typography: {
      fontFamily: "poppins, sans-serif",
      h4: {
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 4,
          },
          containedPrimary: {
            backgroundColor: "#fdee13",
            "&:hover": {
              backgroundColor: "#fdee13",
            },
            color: "black",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: " rgba(90, 90, 90, 0.048) 0px 0px 0px 0.5px",
            border: "1px solid rgba(90, 90, 90, 0.055)",
            scrollbarColor: "rgba(90, 90, 90, 0.055) transparent",
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 25,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(90, 90, 90, 0.055)",
            },
            "&::-webkit-scrollbar-button": {
              display: "none",
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: `
        *::-webkit-scrollbar {
          width: 0.2em;
          height: 0.2em;
        }
        *::-webkit-scrollbar-track {
          background: transparent !important;
        }
        *::-webkit-scrollbar-thumb {
          background-color: gray !important;
          border-radius: 14px;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: 'transparent !important';,
        }
      `,
      },
    },
  });