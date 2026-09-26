import React, { memo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Checkbox } from "@mui/material";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const CustomCheckbox = React.forwardRef((props, ref) => {
	return (
		<Checkbox
			ref={ref}
			{...props}
			icon={<RadioButtonUncheckedIcon />}
			checkedIcon={<CheckCircleRoundedIcon />}
		/>
	);
});


const DataGridTable = memo(({ data, setPageSize, pageSize, columns, sortModel, setSortModel, getRowId, rowSelectionModel, setRowSelectionModel }) => {
	return (
		<DataGrid
			checkboxSelection
			onRowSelectionModelChange={(newRowSelectionModel) => {
				setRowSelectionModel(newRowSelectionModel);
			}}
			rowSelectionModel={rowSelectionModel}
			slots={{
				baseCheckbox: CustomCheckbox
			}}
			rows={data}
			columns={columns}
			pageSize={pageSize}
			onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
			rowsPerPageOptions={[25, 50, 100]}
			pagination={true}
			sortModel={sortModel}
			onSortModelChange={(model) => setSortModel(model)}
			disableSelectionOnClick
			disableDensitySelector
			disableRowSelectionOnClick
			rowHeight={55}
			loading={false}
			getRowId={getRowId}
			disableColumnMenu
			initialState={{
				pagination: {
					paginationModel: { pageSize: 25 },
				},
			}}
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
				},
				"& .MuiDataGrid-virtualScroller": {
					overflowX: "auto",
				},
			}}
		/>
	);
});

export default DataGridTable;
