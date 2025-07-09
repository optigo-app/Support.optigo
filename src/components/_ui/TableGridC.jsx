import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TableVirtuoso } from "react-virtuoso";
import Chance from "chance";

const chance = new Chance(42);

function createData(id) {
	return {
		id,
		firstName: chance.first(),
		lastName: chance.last(),
		age: chance.age(),
		phone: chance.phone(),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
		state: chance.state({ full: true }),
	};
}

const columns = [
	{
		width: 20,
		minWidth: 300,
		label: "ID",
		dataKey: "id",
		numeric: true,
	},
	{
		width: 100,
		minWidth: 300,
		label: "First Name",
		dataKey: "firstName",
	},
	{
		width: 100,
		minWidth: 300,
		label: "Last Name",
		dataKey: "lastName",
	},
	{
		width: 50,
		minWidth: 300,
		label: "Age",
		dataKey: "age",
		numeric: true,
	},
	{
		width: 110,
		minWidth: 300,
		label: "State",
		dataKey: "state",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
	{
		width: 130,
		minWidth: 300,
		label: "Phone Number",
		dataKey: "phone",
	},
];

const rows = Array.from({ length: 50000 }, (_, index) => createData(index));

const VirtuosoTableComponents = {
	Scroller: React.forwardRef((props, ref) => <TableContainer component={Paper} {...props} ref={ref} />),
	Table: (props) => <Table stickyHeader aria-label="sticky table" {...props} sx={{ borderCollapse: "separate", tableLayout: "fixed" }} />,
	TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
	TableRow,
	TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

function fixedHeaderContent() {
	return (
		<TableRow>
			{columns.map((column) => (
				<TableCell key={column.dataKey} variant="head" align={column.numeric || false ? "right" : "left"} style={{ width: column.width, minWidth: 500 }} sx={{ backgroundColor: "background.paper" }}>
					{column.label}
				</TableCell>
			))}
		</TableRow>
	);
}

function rowContent(_index, row) {
	return (
		<React.Fragment>
			{columns.map((column) => (
				<TableCell key={column.dataKey} align={column.numeric || false ? "right" : "left"}>
					{row[column.dataKey]}
				</TableCell>
			))}
		</React.Fragment>
	);
}

export default function ReactVirtualizedTable() {
	return (
		<Paper style={{ height: 400, width: "100%" }}>
			<TableVirtuoso data={rows} components={VirtuosoTableComponents} fixedHeaderContent={fixedHeaderContent} itemContent={rowContent} />
		</Paper>
	);
}
