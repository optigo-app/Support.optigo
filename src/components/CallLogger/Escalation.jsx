import React, { useState } from "react";
import { Menu, MenuItem, TextField, Box, InputAdornment, Divider, Typography } from "@mui/material";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { useCallLog } from "../../context/UseCallLog";
import { useAuth } from "../../context/UseAuth";

const EscalationMenu = ({ anchorEl, id, setAnchorEl, data }) => {
  const [subAnchorEl, setSubAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [directSearchTerm, setDirectSearchTerm] = useState("");
  const {user} = useAuth()
  const [forwardSelection, setForwardSelection] = useState({
    designation: null,
    designationId: null,
    person: null,
    userId: null,
  });

  const { ForwardCall, departmentsNames } = useCallLog();

  const departments = departmentsNames || {};

  const handleMenuClose = () => {
    setAnchorEl({ anchor: null, id: null });
    setSubAnchorEl(null);
    setSearchTerm("");
    setDirectSearchTerm("");
  };

  const handleDeptClick = (event, dept) => {
    const designationId = departments[dept]?.[0]?.DesignaitonId || null;

    setForwardSelection({
      designation: dept,
      designationId: designationId,
      person: null,
      userId: null,
    });
    setSubAnchorEl(event.currentTarget);
    setSearchTerm("");
  };

  const handlePersonSelect = (designation, person, userId, designationId) => {
    const newSelection = {
      designation,
      designationId,
      person,
      userId,
    };
    setForwardSelection(newSelection);
    ForwardCall(id, {
      deptId: newSelection?.designationId,
      empId: newSelection?.userId,
      createdBy: user?.id,
    });
    handleMenuClose();
  };

  const handleSearchKeyDown = (e) => {
    if (["ArrowDown", "ArrowUp"]?.includes(e?.key)) {
      e.preventDefault();
    }
  };

  const filteredPeople = forwardSelection?.designation && departments[forwardSelection?.designation]?.filter((user) => user?.user?.toLowerCase()?.includes(searchTerm?.toLowerCase()));

  const directSearchResults = directSearchTerm
    ? Object.entries(departments)
        ?.flatMap(([dept, people]) =>
          people
            ?.filter((person) => person.user.toLowerCase().includes(directSearchTerm.toLowerCase()))
            ?.map((person) => ({
              dept,
              person: person?.user,
              userId: person?.userid,
              designationId: person?.DesignaitonId,
            }))
        )
        ?.slice(0, 10)
    : [];

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ marginTop: 1 }}
        slotProps={{
          paper: {
            sx: {
              "& .MuiList-root": {
                paddingBlock: "4px !important",
              },
              width: 260,
            },
          },
        }}
      >
        <Box sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={directSearchTerm}
            onChange={(e) => setDirectSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onClick={(e) => e.stopPropagation()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" onClick={() => setDirectSearchTerm("")}>
                  <ClearRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { fontSize: "13px" },
            }}
            sx={{
              "& input": {
                fontSize: "13px",
                padding: "6px 8px",
              },
            }}
          />
        </Box>

        {directSearchTerm && (
          <Box sx={{ px: 1, py: 0.5, maxHeight: 300, overflowY: "auto" }}>
            {directSearchResults.length > 0 ? (
              directSearchResults.map(({ dept, person, userId, designationId }, i) => (
                <MenuItem
                  key={`${dept}-${person}-${i}`}
                  onClick={() => handlePersonSelect(dept, person, userId, designationId)}
                  sx={{
                    fontSize: "13px",
                    borderRadius: "8px",
                    px: 1.5,
                    py: 0.8,
                  }}
                >
                  <Box>
                    <Typography fontSize="13px" fontWeight={500}>
                      {person}
                    </Typography>
                    <Typography fontSize="11px" color="text.secondary">
                      {dept}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled sx={{ opacity: 0.7, fontSize: "13px" }}>
                No matches found
              </MenuItem>
            )}
            <Divider sx={{ my: 1 }} />
          </Box>
        )}

        {!directSearchTerm && (
          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            {Object.keys(departments).map((dept) => (
              <MenuItem
                key={dept}
                onClick={(e) => handleDeptClick(e, dept)}
                selected={forwardSelection.designation === dept}
                sx={{
                  margin: "0px 4px !important",
                  borderRadius: "8px !important",
                  fontSize: "13px",
                  "&:hover": {
                    backgroundColor: "#f0f0f0 !important",
                  },
                }}
              >
                {dept}
              </MenuItem>
            ))}
          </Box>
        )}
      </Menu>

      <Menu
        anchorEl={subAnchorEl}
        open={Boolean(subAnchorEl)}
        onClose={() => setSubAnchorEl(null)}
        sx={{ marginTop: 1 }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: -6 }}
        PaperProps={{
          sx: {
            width: 240,
            position: "relative",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: "white",
            padding: "8px 12px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search person..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onClick={(e) => e.stopPropagation()}
            sx={{
              "& input": {
                fontSize: "13px",
                padding: "6px 8px",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment onClick={() => setSearchTerm("")} position="start">
                  <ClearRoundedIcon />
                </InputAdornment>
              ),
              sx: {
                paddingRight: "0px !important",
              },
            }}
          />
        </Box>

        <Box
          sx={{
            maxHeight: 300,
            overflowY: "auto",
            marginTop: 5.5,
          }}
        >
          {filteredPeople && filteredPeople.length > 0 ? (
            filteredPeople.map((person, idx) => (
              <MenuItem
                key={idx}
                onClick={() => handlePersonSelect(forwardSelection.designation, person.user, person.userid, person.DesignaitonId)}
                sx={{
                  fontSize: "13px",
                  borderRadius: "8px !important",
                  margin: "2px 4px",
                }}
              >
                {person.user}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled sx={{ opacity: 0.7, fontSize: "15px" }}>
              No matches found
            </MenuItem>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default EscalationMenu;
