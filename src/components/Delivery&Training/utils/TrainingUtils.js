export const filterTrainingData = (filters, trainingData) => {
  if (!Array.isArray(trainingData) || trainingData.length === 0) return [];

  const startDate = filters.dateRange?.startDate
    ? new Date(filters.dateRange.startDate)
    : null;
  const endDate = filters.dateRange?.endDate
    ? new Date(filters.dateRange.endDate)
    : null;

  if (startDate) startDate.setHours(0, 0, 0, 0);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  const isAllOrEmpty = (value) => value === "" || value === "All";

  return trainingData.filter((item) => {
    const { search, trainingType, trainingMode, status } = filters;

    let itemDate = null;
    try {
      if (item?.TrainingDate || new Date(item?.EntryDate)) {
        itemDate = new Date(item?.TrainingDate || new Date(item?.EntryDate));
        if (isNaN(itemDate)) throw new Error("Invalid date");
        itemDate.setHours(0, 0, 0, 0);
      }
    } catch (e) {
      console.warn("Invalid date in item:", item);
    }

    const matchesSearch =
      !search ||
      Object.entries(item).some(([key, value]) => {
        if (key === "date") return false;
        if (typeof value === "string") {
          return value.toLowerCase().includes(search.toLowerCase());
        }
        return String(value ?? "").toLowerCase().includes(search.toLowerCase());
      });

    const matchesDateRange = (() => {
      if (!startDate && !endDate) return true; // No date filter
      if (startDate && endDate) {
        return itemDate && itemDate >= startDate && itemDate <= endDate;
      }
      if (startDate) {
        return itemDate && itemDate >= startDate;
      }
      if (endDate) {
        return itemDate && itemDate <= endDate;
      }
      return false;
    })();

    const matchesType = isAllOrEmpty(trainingType) || item.TrainingType === trainingType;
    const matchesMode = isAllOrEmpty(trainingMode) || item.TrainingMode === trainingMode;
    const matchesStatus = isAllOrEmpty(status) || item.Status === status;

    return matchesSearch && matchesDateRange && matchesType && matchesMode && matchesStatus;
  })?.sort((a, b) => new Date(b?.EntryDate) - new Date(a?.EntryDate))
};