import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TicketList from "./components/Tickets";
import TicketDetail from "./components/Details";
import { appBarHeight } from "../../libs/data";
import BlankPage from "./components/BlankPage";
import { useTicket } from "../../context/useTicket";
import { TicketTheme } from "../../styles/MuiStyles";
import { useUrlFilters } from "../../hooks/useFilters";
import withNotification from "../../hoc/withNotification";
import { useLocation } from "react-router-dom";
import CreateTicketForm from "./components/CreateTicket/index";
import MetaWrapper from "../../meta/MetaWrapper";
import ReusableConfirmModal from "./components/ui/Modal";
import { HeaderHeight } from "../_ui/HeaderWrapper";
import {
	setTicketRawList,
	setTicketActiveTab,
	setTicketAgesFilter,
	setTicketFilters,
	ticketDisplayList$,
	ticketAgesFilter$,
	useSubjectValue,
} from "../../rxjs/ticketStore";

function TicketUi({ showNotification }) {
	const [currentView, setCurrentView] = useState("blank");
	const [activeItem, setActiveItem] = useState(() => {
		const SelectedMenu = window.localStorage.getItem("activeItem");
		if (SelectedMenu) {
			return JSON.parse(SelectedMenu);
		} else {
			return "new_ticket";
		}
	});
	const { tickets, selectedTicket, setSelectedTicket, setNotificationInstance, isTicketDirty, setIsTicketDirty } = useTicket();
	const [discardModalOpen, setDiscardModalOpen] = useState(false);
	const [pendingAction, setPendingAction] = useState(null);
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const contentHeight = `calc(100vh - ${HeaderHeight+2}px)`;
	const id = queryParams.get("TicketId") ? atob(queryParams.get("TicketId")) : null;
	const appname = queryParams.get("Appname") ? atob(queryParams.get("Appname")) : null;
	const TicketPreviewId = queryParams.get("TicketPreviewId") ? atob(queryParams.get("TicketPreviewId")) : null;
	const stateData = location.state;
	const isNavigated = Boolean(stateData || id);
	const isPreviewNavigated = Boolean(TicketPreviewId);

	const effectivePrefilled = useMemo(() => {
		if (stateData) {
			return {
				...stateData,
				id: stateData.id || stateData.sr || id,
				sr: stateData.sr || stateData.id || id,
				CallId: stateData.CallId || stateData.id || stateData.sr || id,
				appname: stateData.appname || appname || '',
			};
		}
		if (id) {
			return {
				id,
				sr: id,
				CallId: id,
				appname: appname || '',
			};
		}
		return null;
	}, [stateData, id, appname]);

	// AgesBasedFilter — read from RxJS store, writes back through action
	const AgesBasedFilter = useSubjectValue(ticketAgesFilter$);
	const setAgesBasedFilter = (val) => setTicketAgesFilter(val);

	// Sync raw tickets into RxJS store whenever tickets update
	useEffect(() => {
		setTicketRawList(tickets || []);
	}, [tickets]);

	// Read the fully filtered + sorted display list from RxJS (reactive, no extra useMemo)
	const data = useSubjectValue(ticketDisplayList$);

	// Sync URL filters into RxJS store so ticketDisplayList$ reacts to filter changes
	const { filters } = useUrlFilters();
	useEffect(() => {
		setTicketFilters(filters);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters]);

	const executeWithDirtyCheck = (action) => {
		if (isTicketDirty) {
			setPendingAction(() => action);
			setDiscardModalOpen(true);
		} else {
			action();
		}
	};

	const handleConfirmDiscard = () => {
		setIsTicketDirty(false);
		setDiscardModalOpen(false);
		if (pendingAction) {
			pendingAction();
			setPendingAction(null);
		}
	};

	const handleCancelDiscard = () => {
		setDiscardModalOpen(false);
		setPendingAction(null);
	};

	const handleTicketSelect = (ticket) => {
		if (selectedTicket?.TicketNo === ticket?.TicketNo && currentView === "detail") {
			return;
		}
		executeWithDirtyCheck(() => {
			setSelectedTicket(ticket);
			setCurrentView("detail");
		});
	};

	const handleCreateTicket = () => {
		executeWithDirtyCheck(() => {
			setCurrentView("create");
			setSelectedTicket(null);
		});
	};

	const handleCloseDetail = () => {
		executeWithDirtyCheck(() => {
			setSelectedTicket(null);
			setCurrentView("blank");
		});
	};

	const handleSetActiveItem = (item) => {
		if (activeItem === item) return;
		executeWithDirtyCheck(() => {
			setActiveItem(item);
		});
	};

	useEffect(() => {
		setNotificationInstance(showNotification);
	}, [showNotification]);

	useEffect(() => {
		window.localStorage.setItem("activeItem", JSON.stringify(activeItem));
		setTicketActiveTab(activeItem);
		if (!isNavigated && !isPreviewNavigated) {
			setSelectedTicket(null);
			setCurrentView("blank");
		}
	}, [activeItem, isNavigated, isPreviewNavigated]);

	useEffect(() => {
		if (TicketPreviewId) {
			const target = String(TicketPreviewId).trim().toLowerCase();
			const ticket = tickets?.find((t) => {
				if (!t) return false;
				const tNo = String(t.TicketNo || '').trim().toLowerCase();
				const tId = String(t.TicketId || '').trim().toLowerCase();
				const cId = String(t.CallId || '').trim().toLowerCase();
				const clId = String(t.CallLogId || t.callLogId || '').trim().toLowerCase();
				const rawId = String(t.id || '').trim().toLowerCase();

				return (
					tNo === target ||
					tId === target ||
					cId === target ||
					clId === target ||
					rawId === target ||
					(target.startsWith('j') && tNo.endsWith(target.slice(1))) ||
					(tNo.startsWith('j') && target.endsWith(tNo.slice(1)))
				);
			});
			if (ticket) {
				setSelectedTicket(ticket);
				setCurrentView("detail");
			}
		}
	}, [TicketPreviewId, tickets]);

	useEffect(() => {
		if (isNavigated) {
			handleCreateTicket();
		}
	}, [stateData, appname, id]);



	return (
		<ThemeProvider theme={TicketTheme}>
			<MetaWrapper page="TicketManagement" />
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
					<Sidebar AgesBasedFilter={AgesBasedFilter} setAgesBasedFilter={setAgesBasedFilter} activeItem={activeItem} setActiveItem={handleSetActiveItem} handleCreateTicket={handleCreateTicket} />
					<Box
						sx={{
							display: "flex",
							flexGrow: 1,
							overflow: "hidden",
							borderLeft: "1px solid #e0e0e0",
						}}
					>
						<TicketList key={activeItem} tickets={data} selectedTicket={selectedTicket} onTicketSelect={handleTicketSelect} />
						{currentView === "detail" && <TicketDetail key={selectedTicket?.TicketNo || selectedTicket?.TicketId} showNotification={showNotification} onClose={handleCloseDetail} ticket={selectedTicket} />}
						{currentView === "create" && <CreateTicketForm prefilledData={effectivePrefilled} showNotification={showNotification} handleCloseDetail={handleCloseDetail} />}
						{currentView === "blank" && <BlankPage handleCreateTicket={handleCreateTicket} />}
					</Box>
				</Box>
			</Box>
			<ReusableConfirmModal
				open={discardModalOpen}
				onClose={handleCancelDiscard}
				onConfirm={handleConfirmDiscard}
				type="discard"
			/>
		</ThemeProvider>
	);
}

export default withNotification(TicketUi);
