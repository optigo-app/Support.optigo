import React from "react";
import { Box, Typography, Rating, styled } from "@mui/material";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import { FaStar } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";
import { format } from "date-fns";

const FeedbackCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 4,
  // background: `linear-gradient(145deg, ${theme.palette.mode === "light" ? "#FAFAF9 0%, #F3F4F6 100%" : "#2C2A2E 0%, #3A373F 100%"})`,
  background:'#cbade459',
  boxShadow: theme.palette.mode === "light" ? "0 1px 3px rgba(0, 0, 0, 0.05)" : "0 1px 2px rgba(0, 0, 0, 0.4)",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: theme.palette.text.secondary,
  opacity: 0.75,
}));

const UserName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1rem",
  color: theme.palette.text.primary,
  lineHeight: 1.3,
}));

const Description = styled(Typography)(({ theme }) => ({
  fontSize: "0.925rem",
  color: theme.palette.text.secondary,
  lineHeight: 1.55,
}));

const FeedbackRating = styled(Rating)(({ theme }) => ({
  fontSize: "1.15rem",
  "& .MuiRating-iconFilled": {
    color: "#FDBA74",
  },
  "& .MuiRating-iconEmpty": {
    color: "#FDBA74",
  },
}));
const HeaderRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
}));

export const FeedbackCardComponent = ({ name, rating, description, RatingDate }) => {
  const formatRatingDate = RatingDate && format(new Date(RatingDate), "dd/MM/yyyy");
  return (
    <FeedbackCard role="article" aria-labelledby={`feedback-${name}`} tabIndex={0}>
      <SectionTitle variant="overline">
       
        <ThumbUpAltRoundedIcon sx={{ fontSize: "1rem" }} /> Feedback
      </SectionTitle>

      <HeaderRow>
        <UserName id={`feedback-${name}`} variant="h6">
          {name}
        </UserName>

        <FeedbackRating icon={<FaStar />} value={rating} emptyIcon={<FaRegStar />} readOnly precision={0.5} aria-label={`Rating: ${rating} out of 5`} />
      </HeaderRow>

      <Description>{description}</Description>
      <Typography variant="caption" sx={{ fontWeight: "bold" ,fontStyle:"italic" }} align="right" >{formatRatingDate}</Typography>
    </FeedbackCard>
  );
};
