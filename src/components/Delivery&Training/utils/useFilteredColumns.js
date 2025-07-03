import { roleFieldsMap } from "../constants/constants";
import { getDeliveryColumns } from './../components/Delivery/OrderGrid/deliveryColumns';

export const useFilteredColumns = ({ role, isClient, callbacks }) => {
  const allColumns = getDeliveryColumns(...callbacks);
  const allowedFields = roleFieldsMap[role] || [];

  return allColumns
    .filter((col) => allowedFields.includes(col.field))
    .map((col) => ({ ...col, ...(role === "client" ? { flex: 1 } : {}) }));
};
