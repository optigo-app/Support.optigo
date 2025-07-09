import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TicketList from "./Tickets";
import TicketDetail from "./Details";
import { appBarHeight } from "../../../libs/data";
import BlankPage from "./BlankPage";
import { useTicket } from "../../../context/useTicket";
import { getFilteredTickets } from "../../../utils/TicketListUtils";
import { TicketTheme } from "../../../styles/MuiStyles";
import { useUrlFilters } from "../../../hooks/useFilters";
import { filterTickets } from "../../../utils/TicketFilter";
import withNotification from "../../../hoc/withNotification";
import { useLocation } from "react-router-dom";
import CreateTicketForm from "./CreateTicket/index";

function TicketUi({ showNotification }) {
	const [currentView, setCurrentView] = useState("blank");
	const [activeItem, setActiveItem] = useState(() => {
		const SelectedMenu = window.localStorage.getItem("activeItem");
		if (SelectedMenu) {
			return JSON.parse(SelectedMenu);
		} else {
			return "all";
		}
	});
	const { tickets, selectedTicket, setSelectedTicket } = useTicket();
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const contentHeight = `calc(100vh - ${appBarHeight}px)`;
	const id = queryParams.get("TicketId") ? atob(queryParams.get("TicketId")) : null;
	const appname = queryParams.get("Appname") ? atob(queryParams.get("Appname")) : null;
	const TicketPreviewId = queryParams.get("TicketPreviewId") ? atob(queryParams.get("TicketPreviewId")) : null;
	const stateData = location.state;
	const [AgesBasedFilter, setAgesBasedFilter] = useState(() => {
		const storedFilter = sessionStorage.getItem("AgesBasedFilter");
		return storedFilter ? JSON.parse(storedFilter) : "created";
	});
	const { filters } = useUrlFilters();

	const filteredByMenu = useMemo(() => getFilteredTickets(activeItem, tickets, AgesBasedFilter), [activeItem, tickets, AgesBasedFilter]);
	const data = useMemo(() => filterTickets(filteredByMenu, filters), [filteredByMenu, filters]);

	const handleTicketSelect = (ticket) => {
		setSelectedTicket(ticket);
		setCurrentView("detail");
	};

	const handleCreateTicket = () => {
		setCurrentView("create");
		setSelectedTicket(null);
	};

	const handleCloseDetail = () => {
		setSelectedTicket(null);
		setCurrentView("blank");
		setActiveItem("all");
	};

	useEffect(() => {
		window.localStorage.setItem("activeItem", JSON.stringify(activeItem));
		setSelectedTicket(null);
		setCurrentView("blank");
	}, [activeItem]);

	useEffect(() => {
		if (TicketPreviewId) {
			const ticket = tickets?.find((ticket) => ticket?.CallId?.[0] === TicketPreviewId);
			if (ticket) {
				setSelectedTicket(ticket);
				setCurrentView("detail");
			}
		} else {
			setSelectedTicket(null);
			setCurrentView("blank");
			setActiveItem("all");
		}
	}, [TicketPreviewId]);

	useEffect(() => {
		if (stateData && appname && id) {
			handleCreateTicket();
		}
	}, [stateData, appname, id]);

	return (
		<ThemeProvider theme={TicketTheme}>
			<CssBaseline />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					height: contentHeight,
					bgcolor: "white",
				}}
			>
				{/* <Header onSelect={handleTicketSelect} />  */}
				<Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
					<Sidebar AgesBasedFilter={AgesBasedFilter} setAgesBasedFilter={setAgesBasedFilter} tickets={tickets} activeItem={activeItem} setActiveItem={setActiveItem} handleCreateTicket={handleCreateTicket} />
					<Box
						sx={{
							display: "flex",
							flexGrow: 1,
							overflow: "hidden",
							borderLeft: "1px solid #e0e0e0",
						}}
					>
						<TicketList key={activeItem} tickets={data} selectedTicket={selectedTicket} onTicketSelect={handleTicketSelect} />
						{currentView === "detail" && <TicketDetail showNotification={showNotification} onClose={() => setCurrentView("blank")} ticket={selectedTicket} />}
						{currentView === "create" && <CreateTicketForm prefilledData={stateData} showNotification={showNotification} handleCloseDetail={handleCloseDetail} />}
						{currentView === "blank" && <BlankPage handleCreateTicket={handleCreateTicket} />}
					</Box>
				</Box>
			</Box>
		</ThemeProvider>
	);
}

export default withNotification(TicketUi);
