import React, { useState } from "react";
import {
    Popover,
    Box,
    Typography,
    Rating,
    styled,
    IconButton,
    Collapse,
} from "@mui/material";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import { FaStar, FaRegStar } from "react-icons/fa6";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { format } from "date-fns";

// --- Styled Components ---

const FeedbackCard = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    maxWidth: 320,
    borderRadius: theme.shape.borderRadius * 1.5,
    background: `linear-gradient(135deg, ${theme.palette.mode === "light"
            ? "#F9FAFB 0%, #E5E7EB 100%"
            : "#0F172A 0%, #1E293B 100%"
        })`,
    boxShadow:
        theme.palette.mode === "light"
            ? "0px 4px 12px rgba(0, 0, 0, 0.05)"
            : "0px 6px 16px rgba(0, 0, 0, 0.6)",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "0.625rem",
    fontWeight: 600,
    textTransform: "uppercase",
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
}));

const HeaderRow = styled(Box)({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
});

const UserName = styled(Typography)(({ theme }) => ({
    fontWeight: 500,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    maxWidth: 200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
}));

const FeedbackRating = styled(Rating)(() => ({
    fontSize: "1rem",
    "& .MuiRating-iconFilled": { color: "#F59E0B" },
    "& .MuiRating-iconEmpty": { color: "#F59E0B55" },
}));

const DescriptionText = styled(Typography)(({ theme }) => ({
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    lineHeight: 1.45,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
}));

const ClampedText = styled(DescriptionText)({
    display: "-webkit-box",
    WebkitLineClamp: 6,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
});

const ToggleButton = styled(IconButton)(({ theme }) => ({
    alignSelf: "flex-start",
    padding: theme.spacing(0.25),
    color: theme.palette.text.disabled,
}));

// --- Component ---

export const PopoverFeedbackCard = ({
    anchorEl,
    onClose,
    open,
    name = "",
    rating,
    description = "",
    ratingDate,
  
}) => {
    const [showMore, setShowMore] = useState(false);

    const cleanName = name?.replace(/^'+|'+$/g, "").trim();
    const hasValidName = !!cleanName;
    const hasDescription = description && !!description?.replace(/^'+|'+$/g, "")?.trim();

    const formattedDate = ratingDate
        ? format(new Date(ratingDate), "dd MMM yyyy")
        : null;


    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{
                sx: {
                    background: "transparent",
                    boxShadow: "none",
                    overflow: "visible",
                    mt: 0.5,
                },
            }}
        >
            <FeedbackCard>
                <SectionTitle variant="overline">
                    <ThumbUpAltRoundedIcon sx={{ fontSize: 14 }} />
                    Feedback
                </SectionTitle>

                <HeaderRow>
                    <UserName variant="body2">
                        {hasValidName ? cleanName : "Anonymous"}
                    </UserName>
                    {rating ? (
                        <FeedbackRating
                            value={rating}
                            readOnly
                            precision={0.5}
                            icon={<FaStar />}
                            emptyIcon={<FaRegStar />}
                            aria-label={`Rating: ${rating} out of 5`}
                        />
                    ) : (
                        <Typography variant="caption" color="text.disabled">
                            No rating
                        </Typography>
                    )}
                </HeaderRow>

                {hasDescription ? (
                    <>
                        <Collapse in={showMore} collapsedSize={35}>
                            <DescriptionText sx={{
                                ...(showMore ? {} : {
                                    display: "-webkit-box",
                                    WebkitLineClamp: 6,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                })
                            }}>
                                {description}
                            </DescriptionText>
                        </Collapse>
                        {description.length > 140 && (
                            <ToggleButton
                                size="small"
                                onClick={() => setShowMore((prev) => !prev)}
                            >
                                {showMore ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            </ToggleButton>
                        )}
                    </>
                ) : (
                    <Typography variant="body2" color="text.disabled">
                        No comments provided.
                    </Typography>
                )}

                {formattedDate && (
                    <Typography
                        variant="caption"
                        align="right"
                        sx={{ fontStyle: "italic", mt: 0.5 }}
                    >
                        {formattedDate}
                    </Typography>
                )}
            </FeedbackCard>
        </Popover>
    );
};
