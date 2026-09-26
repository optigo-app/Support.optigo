import { Avatar, Stack, Chip, Box, Typography, Card, CardContent, IconButton, Autocomplete, TextField, Button, Collapse, Fade, Zoom, FormHelperText } from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { styled } from "@mui/material/styles";
import { useMemo, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { usePointToDiscuss } from "../../../../PointToBeDiscuss/context/usePointToDiscuss";

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
  position: "relative",
  "&:hover": {
    transform: "translateX(4px)",
    "& .MuiChip-root": {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.primary.contrastText,
    },
    "& .MuiTypography-root": {
      color: theme.palette.primary.main,
    },
    "& .delete-btn": {
      opacity: 1,
    },
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  opacity: 0,
  transition: "all 0.2s ease",
  padding: 4,
  marginLeft: 4,
  "&:hover": {
    backgroundColor: theme.palette.error.main,
    color: "white",
  },
}));

export default function TeamMemberCard({ member = [], isPoint = true, availableUsers = [], PointId }) {
  const [members, setMembers] = useState(member);
  const [selectedUser, setSelectedUser] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { AddEmployee } = usePointToDiscuss();
  const [error, seterrors] = useState(null)

  const userOptions = useMemo(() => {
    return availableUsers;
  }, []);

  const handleAddMember = () => {
    if (!selectedUser || !estimatedTime) return;

    const alreadyExists = members.some(
      (m) => m.userid === selectedUser.value
    );

    if (alreadyExists) {
      console.warn("User already added.");
      seterrors("User already added.")
      return;
    }
    seterrors(null)
    const newMember = {
      user: selectedUser.User,
      Designation: selectedUser.Designation,
      Department: selectedUser.Designation,
      EstimatedHours: estimatedTime,
      DeliveryID: PointId,
      userid: selectedUser?.value
    };

    setMembers([...members, newMember]);
    setHasChanges(true);

    setSelectedUser(null);
    setEstimatedTime("");
    setIsAddFormOpen(false);
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    if (AddEmployee) {
      const normalized = members.map((m) => ({
        DeliveryID: PointId,
        Department: m.Department,
        AssignedTo: m.user,
        AssignedToUserId: m?.userid,
        EstimatedHours: Number(m.EstimatedHours),
      }));
      AddEmployee(normalized);
    }
    setHasChanges(false);
  };

  const toggleAddForm = () => {
    setIsAddFormOpen(!isAddFormOpen);
    if (isAddFormOpen) {
      setSelectedUser(null);
      setEstimatedTime("");
    }
  };

  return (
    <Card
      sx={{
        width: 330,
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" fontWeight="bold">
            Team Members
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {isPoint && (
              <Zoom in={true}>
                <IconButton
                  size="small"
                  onClick={toggleAddForm}
                  sx={{
                    bgcolor: isAddFormOpen ? "primary.main" : "action.selected",
                    color: isAddFormOpen ? "white" : "inherit",
                    transition: "all 0.3s ease",
                    transform: isAddFormOpen ? "rotate(45deg)" : "rotate(0deg)",
                    "&:hover": {
                      bgcolor: isAddFormOpen ? "primary.dark" : "action.hover",
                    },
                  }}
                >
                  <PersonAddRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Zoom>
            )}
            <Typography variant="caption" color="text.secondary">
              Total: {members.length}
            </Typography>
          </Box>
        </Box>

        <Collapse in={isAddFormOpen} timeout={300}>
          <Box
            sx={{
              mb: 2,
              p: 1.2,
              borderRadius: 2,
              position: "relative",
              zIndex: 9999,
            }}
          >
            <Stack display="flex" gap={0.5} alignItems="center">
              <Autocomplete
                size="small"
                PopperProps={{
                  style: { zIndex: 99999 },
                  sx: { zIndex: 99999 },
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, 4],
                      },
                    },
                    {
                      name: "flip",
                      enabled: true,
                      options: {
                        fallbackPlacements: ["top", "bottom"],
                      },
                    },
                    {
                      name: "preventOverflow",
                      enabled: true,
                      options: {
                        altAxis: true,
                        tether: false,
                        rootBoundary: "viewport",
                      },
                    },
                  ],
                }}
                componentsProps={{
                  paper: {
                    sx: {
                      zIndex: 99999,
                      position: "relative",
                    },
                  },
                  popper: {
                    sx: {
                      zIndex: 99999,
                    },
                  },
                }}
                fullWidth
                options={userOptions}
                disablePortal={false}
                getOptionLabel={(option) => `${option.User} (${option.Designation || option.Designation})`}
                value={selectedUser}
                onChange={(e, value) => {
                  setSelectedUser(value)
                  seterrors(null)

                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search team member..."
                    variant="outlined"
                    sx={{
                      zIndex: 1,
                      flex: 1,
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box display="flex" alignItems="center" gap={1} width="100%">
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: "secondary.main",
                          fontSize: "0.65rem",
                        }}
                      >
                        {option.User
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontSize="0.8rem">
                          {option.User}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                          {option.Designation}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                )}
              />

              <Box display="flex" gap={0.5} flex={1} alignItems={"center"}>
                <TextField
                  size="small"
                  type="number"
                  fullWidth
                  placeholder="Hours"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  inputProps={{ min: 0, step: 0.5 }}
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                />
                <IconButton
                  onClick={handleAddMember}
                  disabled={!selectedUser || !estimatedTime}
                  sx={{
                    bgcolor: isAddFormOpen ? "primary.main" : "grey.100", // light bg
                    color: isAddFormOpen ? "white" : "text.primary",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: isAddFormOpen ? "primary.dark" : "grey.200",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "grey.200", // lighter grey for disabled
                      color: "grey.500", // proper contrast for disabled
                    },
                    borderRadius: 5,
                  }}
                >
                  <AddRoundedIcon fontSize="medium" />
                </IconButton>
              </Box>
            {!!error &&  <FormHelperText
            sx={{
              textAlign:'left',
              color:'error.dark'
            }}
            >
                     {error} !
              </FormHelperText>}
            </Stack>
          </Box>
        </Collapse>

        <Stack
          spacing={1}
          sx={{
            position: "relative",
            zIndex: 1,
            maxHeight: 240, // adjust as needed (e.g., 200–280)
            overflowY: "auto",
            pr: 0.5, // small right padding so scroll bar doesn't clip
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: (theme) => theme.palette.action.hover,
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: (theme) => theme.palette.action.selected,
            },
          }}
        >
          {members?.map((member, index) => (
            <Fade in={true} key={index} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
              <TeamMemberItem>
                <Box display="flex" alignItems="center" gap={1} flex={1}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "secondary.dark",
                      fontSize: "0.7rem",
                      transition: "all 0.3s ease",
                      "&:hover": {
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
                  <Box flex={1}>
                    <Typography variant="caption" fontWeight="medium" display="block">
                      {member?.user || `Person ${index + 1}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                      {member?.Designation || member?.Department || `Department ${index + 1}`}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={0.5}>
                  <TeamTimeChip color="info" icon={<AccessTimeOutlinedIcon sx={{ fontSize: 12 }} />} label={`${member?.EstimatedHours}h`} size="small" />
                  {isPoint && (
                    <DeleteButton className="delete-btn" size="small" onClick={() => handleRemoveMember(index)}>
                      <CloseRoundedIcon sx={{ fontSize: 14 }} />
                    </DeleteButton>
                  )}
                </Box>
              </TeamMemberItem>
            </Fade>
          ))}

          {members.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 3,
                color: "text.secondary",
              }}
            >
              <Typography variant="caption">No team members added yet</Typography>
            </Box>
          )}
        </Stack>

        {isPoint && hasChanges && (
          <Zoom in={true}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={handleSaveAll}
              startIcon={<SaveRoundedIcon />}
              sx={{
                mt: 2,
                fontWeight: "bold",
                textTransform: "none",
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              Save All Changes
            </Button>
          </Zoom>
        )}
      </CardContent>
    </Card>
  );
}
