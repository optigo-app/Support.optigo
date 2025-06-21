import { Avatar, Stack, Chip, Box, Typography, Card, CardContent } from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { styled } from "@mui/material/styles";
const TeamTimeChip = styled(Chip)(({ theme }) => ({
  fontSize: "0.6rem",
  height: 20,
  fontWeight: "medium",
  borderRadius: 10,
  padding: "0 4px",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: theme.palette.secondary.main,
    color: "white",
    transform: "scale(1.05)",
  },
}));

const TeamMemberItem = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: theme.shape.borderRadius,
  padding: "8px 4px",
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    // backgroundColor: theme.palette.action.hover,
    transform: "translateX(4px)",
    "& .MuiChip-root": {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.primary.contrastText,
    },
    "& .MuiTypography-root": {
      color: theme.palette.primary.main,
    },
  },
}));

export default function TeamMemberCard({ member }) {
  return (
    <Card
      className="team-member-card"
      sx={{
        width: 310,
        mx: "auto",
        boxShadow: 2,
        borderRadius: 2,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" fontWeight="bold">
            Team Members
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography variant="caption" color="text.secondary">
              Total: {member.length}
            </Typography>
          </Box>
        </Box>

        {/* Members List */}
        <Stack spacing={1} mt={1}>
          {member?.map((member, index) => (
            <TeamMemberItem key={index}>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "secondary.dark",
                    fontSize: "0.7rem",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      // bgcolor: "primary.main",
                      color: "white",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  {member?.user
                    ?.split(" ")
                    ?.map((n) => n[0])
                    ?.join("")
                    ?.toUpperCase() || "P"}
                </Avatar>
                <Box>
                  <Typography variant="caption" fontWeight="medium" display="block">
                    {member?.user || "Person" + " " + (index + 1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {member?.Department || "Department" + " " + (index + 1)}
                  </Typography>
                </Box>
              </Box>
              <TeamTimeChip color="info" icon={<AccessTimeOutlinedIcon fontSize="small" />} label={member?.EstimatedHours} size="small" />
            </TeamMemberItem>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
