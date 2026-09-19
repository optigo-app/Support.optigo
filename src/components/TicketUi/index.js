import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TicketList from "./components/Tickets";
import TicketDetail from "./components/Details";
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
	currentView$,
	setCurrentView,
	selectedTicket$,
} from "../../rxjs/ticketStore";

// ─── RightPanel ───────────────────────────────────────────────────────────────
// Isolated memo component driven by currentView$ (RxJS BehaviorSubject).
// Clicking a ticket emits to currentView$ → ONLY this component re-renders.
// The TicketUi parent and TicketList are completely untouched.
const RightPanel = React.memo(({ showNotification, handleCloseDetail, effectivePrefilled, handleCreateTicket }) => {
	const currentView = useSubjectValue(currentView$);
	// Read from selectedTicket$ (RxJS) instead of context — avoids re-rendering
	// TicketUi parent and all other context consumers when selection changes.
	const selectedTicket = useSubjectValue(selectedTicket$);

	if (currentView === "detail") {
		return (
			<TicketDetail
				key={selectedTicket?.TicketNo || selectedTicket?.TicketId}
				showNotification={showNotification}
				onClose={handleCloseDetail}
				ticket={selectedTicket}
			/>
		);
	}
	if (currentView === "create") {
		return (
			<CreateTicketForm
				prefilledData={effectivePrefilled}
				showNotification={showNotification}
				handleCloseDetail={handleCloseDetail}
			/>
		);
	}
	return <BlankPage handleCreateTicket={handleCreateTicket} />;
});

// ─── TicketUi ─────────────────────────────────────────────────────────────────
function TicketUi({ showNotification }) {
	const [activeItem, setActiveItem] = useState(() => {
		try {
			return JSON.parse(window.localStorage.getItem("activeItem")) || "new_ticket";
		} catch {
			return "new_ticket";
		}
	});

	const { tickets, selectedTicket, setSelectedTicket, setNotificationInstance, isTicketDirty, setIsTicketDirty } = useTicket();
	const [discardModalOpen, setDiscardModalOpen] = useState(false);
	const [pendingAction, setPendingAction] = useState(null);
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const contentHeight = `calc(100vh - ${HeaderHeight + 2}px)`;
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
	const setAgesBasedFilter = useCallback((val) => setTicketAgesFilter(val), []);

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

	// Stable scroll key: only changes when user navigates (tabs, age sort, search, filters).
	// Adding comments or updating ticket data does NOT change this key, preserving scroll position.
	const scrollKey = useMemo(() => {
		const f = filters || {};
		return `${activeItem}|${AgesBasedFilter}|${f.searchQuery || ""}|${(f.status || []).join(",")}|${f.priority || ""}|${f.category || ""}|${f.projectCode || ""}|${f.appname || ""}|${f.isStarred || ""}`;
	}, [activeItem, AgesBasedFilter, filters]);

	// ─── Dirty-check guard ─────────────────────────────────────────────────────
	const executeWithDirtyCheck = useCallback((action) => {
		if (isTicketDirty) {
			setPendingAction(() => action);
			setDiscardModalOpen(true);
		} else {
			action();
		}
	}, [isTicketDirty]);

	const handleConfirmDiscard = useCallback(() => {
		setIsTicketDirty(false);
		setDiscardModalOpen(false);
		if (pendingAction) {
			pendingAction();
			setPendingAction(null);
		}
	}, [pendingAction]);

	const handleCancelDiscard = useCallback(() => {
		setDiscardModalOpen(false);
		setPendingAction(null);
	}, []);

	// ─── Handlers — all event-driven via RxJS, no intermediate React state ─────

	const handleTicketSelect = useCallback((ticket) => {
		// Early exit — already selected and showing detail
		if (selectedTicket?.TicketNo === ticket?.TicketNo && currentView$.getValue() === "detail") {
			return;
		}
		executeWithDirtyCheck(() => {
			setSelectedTicket(ticket);
			// Emit to RxJS → only RightPanel re-renders (not TicketUi, not TicketList)
			setCurrentView("detail");
		});
	}, [selectedTicket?.TicketNo, executeWithDirtyCheck]);

	const handleCreateTicket = useCallback(() => {
		executeWithDirtyCheck(() => {
			setSelectedTicket(null);
			setCurrentView("create");
		});
	}, [executeWithDirtyCheck]);

	const handleCloseDetail = useCallback(() => {
		executeWithDirtyCheck(() => {
			setSelectedTicket(null);
			setCurrentView("blank");
		});
	}, [executeWithDirtyCheck]);

	const handleSetActiveItem = useCallback((item) => {
		if (activeItem === item) return;
		executeWithDirtyCheck(() => {
			// ✅ Call setTicketActiveTab SYNCHRONOUSLY here — not in a useEffect.
			// Previously it ran inside useEffect which fired AFTER a full render cycle,
			// meaning the list didn't update until render #2. Now it's instant.
			setTicketActiveTab(item);
			window.localStorage.setItem("activeItem", JSON.stringify(item));
			setActiveItem(item);
			if (!isNavigated && !isPreviewNavigated) {
				setSelectedTicket(null);
				setCurrentView("blank");
			}
		});
	}, [activeItem, isNavigated, isPreviewNavigated, executeWithDirtyCheck]);

	// ─── Effects ───────────────────────────────────────────────────────────────

	useEffect(() => {
		setNotificationInstance(showNotification);
	}, [showNotification]);

	// Sync activeItem to RxJS on first mount (localStorage restore)
	useEffect(() => {
		setTicketActiveTab(activeItem);
		window.localStorage.setItem("activeItem", JSON.stringify(activeItem));
	// Only run once on mount — handleSetActiveItem handles subsequent changes synchronously
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Navigate to blank view when tab changes (only if not navigated from external link)
	useEffect(() => {
		if (!isNavigated && !isPreviewNavigated) {
			setSelectedTicket(null);
			setCurrentView("blank");
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeItem]);

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
						{/* scrollKey drives scroll-to-top on intentional tab/filter switch; data updates preserve position */}
						<TicketList tickets={data} onTicketSelect={handleTicketSelect} scrollKey={scrollKey} />
						{/* RightPanel subscribes to currentView$ directly — only it re-renders on view change */}
						<RightPanel
							showNotification={showNotification}
							handleCloseDetail={handleCloseDetail}
							effectivePrefilled={effectivePrefilled}
							handleCreateTicket={handleCreateTicket}
						/>
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
