import React from "react";
import { DataGrid } from "@mui/x-data-grid";


const TrainGrid = ({ deliveryData, setPageSize, pageSize, columns, sortModel, setSortModel }) => {
    return (
        <DataGrid
            getRowId={(row) => row.SessionID}
            rows={deliveryData}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[15, 25, 50, 100]}
            sortModel={sortModel}
            onSortModelChange={(model) => setSortModel(model)}
            disableSelectionOnClick
            rowHeight={50}
            loading={false}
            density="standard"
            sx={{
                "& .MuiDataGrid-row": {
                    alignItems: "center",
                },
                "& .MuiDataGrid-cell": {
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                },
                "& .MuiTablePagination-root": {
                    overflow: "visible",
                },
                "& .MuiDataGrid-toolbarContainer": {
                    padding: "8px 16px",
                    backgroundColor: "#fff",
                    borderBottom: "1px solid #f0f0f0",
                },
                "& .MuiTablePagination-root": {
                    overflow: "visible",
                  },
                  "& .MuiDataGrid-toolbarContainer": {
                    padding: "8px 16px",
                    backgroundColor: "#fff",
                    borderBottom: "1px solid #f0f0f0",
                  },
                  "& .MuiTablePagination-root": {
                    fontSize: "0.85rem",
                    textAlign: "center",
                  },
                  "& .MuiTablePagination-toolbar": {
                    minHeight: "auto",
                    padding: 0,
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  },
                  "& .MuiTablePagination-spacer": {
                    display: "none",
                  },
                  "& .MuiTablePagination-selectLabel": {
                    margin: "0 8px 0 0",
                    fontSize: "0.8rem",
                  },
                  "& .MuiTablePagination-select": {
                    fontSize: "0.8rem",
                    padding: "2px 8px",
                  },
                  "& .MuiTablePagination-displayedRows": {
                    fontSize: "0.8rem",
                    margin: "0 8px",
                  },
                  "& .MuiTablePagination-actions": {
                    "& .MuiIconButton-root": {
                      padding: "6px",
                      color: "#555",
                    },
                    "& .Mui-disabled": {
                      opacity: 0.3,
                    },
                  }
            }}
        />
    );
};

export default TrainGrid;
