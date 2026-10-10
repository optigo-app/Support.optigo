import { useState } from "react";
import {
    Box,
    Button,
    Collapse,
    FormControl,
    FormLabel,
    IconButton,
    InputAdornment,
    Link,
    OutlinedInput,
    Paper,
    Typography,
    createTheme,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";


const TEXT = "#2f3a54";
const LINK = "#4a72c9";
const BORDER = "#dde1e9";

const fieldLabelSx = {
    display: "block",
    mb: 1.75,
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1.3,
    color: TEXT,
    "&.Mui-focused": { color: TEXT },
};

const inputSx = {
    height: 40,
    fontSize: 14.5,
    color: TEXT,
    bgcolor: "#fff",
    borderRadius: "6px",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c3c9d6" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#5b80d6",
        borderWidth: 1,
    },
    "& input": { py: 0, px: 1.75 },
};

export default function StellateSetup() {
    const [endpoint, setEndpoint] = useState("https://acme.corp.dev/graphql");
    const [subdomain, setSubdomain] = useState("acme");
    const [open, setOpen] = useState(true);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#f4f5f8",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                pt: { xs: 3, md: 6 },
                px: 2,
                pb: 6,
            }}
        >
            <Box sx={{ width: "100%", maxWidth: 540 }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid #e6e9ef",
                        boxShadow:
                            "0 1px 2px rgba(31,41,75,0.06), 0 8px 24px rgba(31,41,75,0.10)",
                        background: "linear-gradient(180deg, #ffffff 0%, #fafbfd 100%)",
                    }}
                >
                    {/* Section 1 */}
                    <Box sx={{ px: 3.75, pt: 4, pb: 4.25 }}>
                        <FormControl fullWidth variant="outlined">
                            <FormLabel htmlFor="graphql-endpoint" sx={fieldLabelSx}>
                                Where is your GraphQL endpoint?
                            </FormLabel>
                            <OutlinedInput
                                id="graphql-endpoint"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value)}
                                sx={inputSx}
                                inputProps={{ "aria-label": "GraphQL endpoint" }}
                            />
                        </FormControl>
                    </Box>

                    {/* Section 2 */}
                    <Box
                        sx={{
                            px: 3.75,
                            pt: 3.75,
                            pb: 4,
                            bgcolor: "#f9fafc",
                            borderTop: `1px solid ${BORDER}`,
                        }}
                    >
                        <FormControl fullWidth variant="outlined">
                            <FormLabel htmlFor="edge-subdomain" sx={fieldLabelSx}>
                                Enter your Stellate Edge Cache subdomain
                            </FormLabel>
                            <OutlinedInput
                                id="edge-subdomain"
                                value={subdomain}
                                onChange={(e) => setSubdomain(e.target.value)}
                                sx={{
                                    ...inputSx,
                                    bgcolor: "#f3f4f7",
                                    pr: 0,
                                    overflow: "hidden",
                                }}
                                inputProps={{ "aria-label": "Edge Cache subdomain" }}
                                endAdornment={
                                    <InputAdornment
                                        position="end"
                                        disablePointerEvents
                                        sx={{
                                            m: 0,
                                            height: "100%",
                                            maxHeight: "none",
                                            px: 2,
                                            bgcolor: "#e9ebf0",
                                            borderLeft: `1px solid ${BORDER}`,
                                            alignSelf: "stretch",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 14.5, color: "#5c667d" }}>
                                            .stellate.dev
                                        </Typography>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Box>

                    {/* Section 3 - collapsible help */}
                    <Box
                        sx={{
                            px: 3.75,
                            pt: 3,
                            pb: 3.5,
                            bgcolor: "#eceef2",
                            borderTop: `1px solid ${BORDER}`,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography
                                sx={{ fontSize: 15.5, fontWeight: 600, color: TEXT }}
                            >
                                Not ready to implement Stellate as proxy?
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => setOpen((v) => !v)}
                                aria-expanded={open}
                                aria-label={open ? "Collapse details" : "Expand details"}
                                sx={{ color: "#4a556e", mr: -0.5 }}
                            >
                                <KeyboardArrowUpIcon
                                    sx={{
                                        transition: "transform 200ms ease",
                                        transform: open ? "rotate(0deg)" : "rotate(180deg)",
                                    }}
                                />
                            </IconButton>
                        </Box>

                        <Collapse in={open} timeout={200}>
                            <Typography
                                sx={{
                                    mt: 2,
                                    fontSize: 14.5,
                                    lineHeight: 1.65,
                                    color: "#3d4863",
                                }}
                            >
                                Get started and test-drive Stellate&apos;s Metrics API without
                                routing traffic through Stellate proxy.
                            </Typography>

                            <Box
                                component="ol"
                                sx={{
                                    mt: 1.75,
                                    mb: 0,
                                    pl: 2.75,
                                    fontSize: 14.5,
                                    lineHeight: 1.65,
                                    color: "#3d4863",
                                    "& li": { pl: 0.5, mb: 0.75 },
                                }}
                            >
                                <li>Create service here and grab Metrics API access token.</li>
                                <li>
                                    Use Stellate&apos;s{" "}
                                    <Link
                                        href="#"
                                        underline="none"
                                        sx={{ color: LINK, fontWeight: 600 }}
                                    >
                                        Apollo
                                    </Link>{" "}
                                    or{" "}
                                    <Link
                                        href="#"
                                        underline="none"
                                        sx={{ color: LINK, fontWeight: 600 }}
                                    >
                                        Yoga
                                    </Link>{" "}
                                    plugins, or directly integrate with the{" "}
                                    <Link
                                        href="#"
                                        underline="none"
                                        sx={{ color: LINK, fontWeight: 600 }}
                                    >
                                        Stellate API
                                    </Link>
                                    , to configure your GraphQL client.
                                </li>
                                <li>
                                    That&apos;s it, start monitoring and exploring your metrics
                                    via the Stellate dashboard.
                                </li>
                            </Box>

                            <Typography
                                sx={{
                                    mt: 1.5,
                                    fontSize: 14.5,
                                    lineHeight: 1.65,
                                    color: "#3d4863",
                                }}
                            >
                                For more details on each step check out the{" "}
                                <Box component="span" sx={{ fontWeight: 600, color: TEXT }}>
                                    Stellate Documentation
                                </Box>
                            </Typography>
                        </Collapse>
                    </Box>
                </Paper>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                    <Button
                        variant="contained"
                        disableElevation
                        sx={{
                            textTransform: "none",
                            fontSize: 14.5,
                            fontWeight: 500,
                            px: 2.75,
                            py: 1.1,
                            borderRadius: "6px",
                            bgcolor: "#5b80d6",
                            boxShadow: "0 1px 2px rgba(31,41,75,0.15)",
                            "&:hover": { bgcolor: "#4c70c6" },
                        }}
                    >
                        Create Service
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}