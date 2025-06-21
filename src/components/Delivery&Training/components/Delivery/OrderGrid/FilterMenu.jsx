import { Drawer, Box, Typography, IconButton, Button, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RotatingIcon from "../../shared/ui/RotatingIcon";
// Options
const topicTypes = ["Print", "Tag", "Excel", "Report"];
const serviceTypes = ["Free", "Complementary", "Chargebale"];
const onDemandOptions = ["Client", "Service"];
const paymentMethods = ["UPI", "Credit Card", "Debit Card", "Netbanking", "Wallet", "Cash", "EMI", "QR Code"];
const paymentStatus = ["Unpaid", "Paid"];

export function FilterMenu({ open = false, setOpen, filters, setFilters, clearFilters }) {
  const updateFilters = (newFilter) => {
    setFilters((prev) => ({ ...prev, ...newFilter }));
  };
  const handleFilterReset = (key) => {
    const emptyValues = {
      topicType: "",
      serviceType: [],
      onDemandOption: "",
      paymentMethod: [],
      paymentStatus: [],
      isFavorite: false,
      tagColor: "",
    };

    updateFilters({ [key]: emptyValues[key] });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 500 }, borderRadius: "0px" },
        }}
      >
        <Box sx={{ height: "100%", position: "relative", pb: 12 }}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          <Box sx={{ p: 2, overflowY: "auto", height: "100%", maxHeight: "calc(100vh - 10rem)" }}>
            {/* Topic Type */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Topic Type
                </Typography>
                <RotatingIcon filterKey="topicType" onReset={handleFilterReset} />
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {topicTypes.map((type) => (
                  <FilterChip
                    key={type}
                    label={type}
                    selected={filters.topicType === type}
                    onClick={() =>
                      updateFilters({
                        topicType: filters.topicType === type ? "" : type,
                      })
                    }
                  />
                ))}
              </Box>
            </Box>

            {/* Service Type */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Service Type
                </Typography>
                <RotatingIcon filterKey="serviceType" onReset={handleFilterReset} />
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {serviceTypes.map((type) => (
                  <FilterChip
                    key={type}
                    label={type}
                    selected={filters.serviceType.includes(type)}
                    onClick={() => {
                      const newServiceTypes = filters.serviceType.includes(type) ? filters.serviceType.filter((t) => t !== type) : [...filters.serviceType, type];
                      updateFilters({ serviceType: newServiceTypes });
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* On-Demand Option */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  On-Demand
                </Typography>
                <RotatingIcon filterKey="onDemandOption" onReset={handleFilterReset} />
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {onDemandOptions.map((option) => (
                  <FilterChip
                    key={option}
                    label={option}
                    selected={filters.onDemandOption === option}
                    onClick={() =>
                      updateFilters({
                        onDemandOption: filters.onDemandOption === option ? "" : option,
                      })
                    }
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Payment Status
                </Typography>
                <RotatingIcon filterKey="paymentStatus" onReset={handleFilterReset} />
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {paymentStatus.map((status) => (
                  <FilterChip
                    key={status}
                    label={status}
                    selected={filters.paymentStatus.includes(status)}
                    onClick={() => {
                      const newPaymentStatus = filters.paymentStatus.includes(status) ? filters.paymentStatus.filter((m) => m !== status) : [...filters.paymentStatus, status];
                      updateFilters({ paymentStatus: newPaymentStatus });
                    }}
                  />
                ))}
              </Box>
            </Box>
            {/* Payment Method */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Payment Method
                </Typography>
                <RotatingIcon filterKey="paymentMethod" onReset={handleFilterReset} />
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {paymentMethods.map((method) => (
                  <FilterChip
                    key={method}
                    label={method}
                    selected={filters.paymentMethod.includes(method)}
                    onClick={() => {
                      const newPaymentMethods = filters.paymentMethod.includes(method) ? filters.paymentMethod.filter((m) => m !== method) : [...filters.paymentMethod, method];
                      updateFilters({ paymentMethod: newPaymentMethods });
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Favorite */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Favorites Only
              </Typography>
              <Button
                variant="outlined"
                onClick={() => updateFilters({ isFavorite: !filters.isFavorite })}
                sx={{
                  borderRadius: 28,
                  textTransform: "none",
                  borderColor: filters.isFavorite ? "primary.main" : "divider",
                  backgroundColor: filters.isFavorite ? "primary.light" : "transparent",
                }}
              >
                {filters.isFavorite ? "Enabled" : "Disabled"}
              </Button>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              bgcolor: "background.paper",
              boxShadow: "-2px 0px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleClose}
              sx={{
                textTransform: "none",
                mb: 1,
                bgcolor: "primary.main",
                "&:hover": {
                  backgroundColor: "#1565c0",
                },
                color: "white",
              }}
            >
              Show Results
            </Button>
            <Button fullWidth variant="text" onClick={clearFilters} sx={{ textTransform: "none" }}>
              Clear All
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

function FilterChip({ label, selected, onClick }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        borderRadius: 28,
        py: 0.5,
        px: 2,
        minWidth: "auto",
        textTransform: "none",
        backgroundColor: selected ? "#1976d2" : "rgba(0,0,0,0.02)",
        color: selected ? "white" : "inherit",
        borderColor: selected ? "#1976d2" : "divider",
        "&:hover": {
          backgroundColor: selected ? "#1565c0" : "rgba(0,0,0,0.04)",
        },
      }}
    >
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          border: `1px solid ${selected ? "white" : "currentColor"}`,
          mr: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {selected && (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "white",
            }}
          />
        )}
      </Box>
      {label}
    </Button>
  );
}

function ColorChip({ color, selected, onClick }) {
  const getColorValue = (color) => {
    const colorMap = {
      blue: "#1976d2",
      red: "#f44336",
      green: "#4caf50",
      yellow: "#ffeb3b",
    };
    return colorMap[color] || "#e0e0e0";
  };

  return (
    <IconButton
      onClick={onClick}
      sx={{
        width: 40,
        height: 40,
        bgcolor: getColorValue(color),
        border: `2px solid ${selected ? "#1976d2" : "transparent"}`,
        "&:hover": {
          opacity: 0.9,
        },
      }}
    >
      {selected && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "white",
          }}
        />
      )}
    </IconButton>
  );
}

{
  /* Tag Color */
}
{
  /* <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Tag Color
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {["Blue", "Red", "Green", "Yellow"].map((color) => (
                  <ColorChip
                    key={color}
                    color={color.toLowerCase()}
                    selected={filters.tagColor === color.toLowerCase()}
                    onClick={() =>
                      updateFilters({
                        tagColor: filters.tagColor === color.toLowerCase() ? "" : color.toLowerCase(),
                      })
                    }
                  />
                ))}
              </Box>
            </Box> */
}

{
  /* Price Range */
}
{
  /* <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Price Range
              </Typography>
              <Box sx={{ px: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">${priceRange[0]}</Typography>
                  <Typography variant="body2">${priceRange[1]}</Typography>
                </Box>
                <Slider value={priceRange} onChange={handlePriceChange} min={0} max={1000} step={10} valueLabelDisplay="off" />
              </Box>
            </Box> */
}
