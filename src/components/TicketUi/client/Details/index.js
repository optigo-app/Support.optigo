import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import TicketComment from "../Comment";
import CommentList from "../Comment/CommentList";
import ClosedSeeOff from "./ClosedSeeOff";
import DetailBar from "./DetailBar";
import DetailSideBar from "./DetailSideBar";
import { DataParser } from "../../../../utils/ticketUtils";
import { useTicket } from "../../../../context/useTicket";
import imag1 from "../../../../assets/1.png";

const TicketDetail = ({ ticket, onClose, showNotification }) => {
	const IsClosed = ticket?.Status === "Closed";
	const [Comments, setComments] = useState([]);
	const [anchorEl, setAnchorEl] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const { updateTicket } = useTicket();

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const handleInputChange = (event) => {
		const value = event.target.value;
		setInputValue(value);
	};

	const HandleSave = async () => {
		try {
			const res = await updateTicket(ticket?.TicketNo, {
				MainSubject: inputValue,
			});
			setInputValue("");
			handleClose();
		} catch (error) {
			console.log(error, "error");
		}
	};

	useEffect(() => {
		if (ticket?.MainSubject) {
			setInputValue(ticket?.MainSubject ?? "");
		}
		if (ticket?.comments) {
			setComments([...DataParser(ticket.comments).data]);
		}
	}, [ticket]);

	return (
		<Box
			sx={{
				flexGrow: 1,
				display: "flex",
				overflow: "hidden",
				bgcolor: "#ffffff",
				width: "100%",
			}}
		>
			<Box
				sx={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					overflow: "auto",
					borderRight: "1px solid #DFE1E6",
					width: "50%",
					height: "100%",
				}}
			>
				<ClosedSeeOff IsClosed={IsClosed} TicketNo={ticket?.TicketNo} />
				<Box sx={{ flex: 1, overflow: "auto" }}>
					<DetailBar handleClick={handleClick} anchorEl={anchorEl} open={open} handleClose={handleClose} inputValue={inputValue} HandleSave={HandleSave} handleInputChange={handleInputChange} onClose={onClose} ticket={ticket} />
					<TicketComment showNotification={showNotification} data={ticket} setComments={setComments} />
					<CommentList data={Comments} />
				</Box>
			</Box>
			{/* <DetailSideBar ticket={ticket} IsClosed={IsClosed} /> */}
			<Box
				sx={{
					width: 200,
					flexGrow: 1,
					height: "100%",
					// borderLeft: "1px solid #dfe1e6",
					bgcolor: "#ffffff",
				}}
			>
				<img src={imag1} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
			</Box>
		</Box>
	);
};

export default TicketDetail;
