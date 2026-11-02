import { useEffect, useRef, useState } from "react";

const CHANNEL = "quickcall-call-bridge";
const HEARTBEAT_TIMEOUT_MS = 3500;

const postBridgeMessage = (message) => {
  window.postMessage({ channel: CHANNEL, ...message }, window.location.origin);
};

/**
 * Keeps the browser's existing call session authoritative while QuickCall
 * mirrors the compact controller and routes its commands back to this tab.
 */
export function useQuickCallDesktopBridge({
  CurrentCall,
  recordingTimeRef,
  callStartTimeRef,
  calculateElapsedTime,
  isPaused,
  activeFollowUp,
  onStartCall,
  onStartFollowUp,
  onPause,
  onResume,
  onEndCall,
  showNotification,
}) {
  const [isHostedOnDesktop, setIsHostedOnDesktop] = useState(false);
  const stateRef = useRef({});
  const ownerRef = useRef(false);
  const lastHeartbeatRef = useRef(0);
  const notificationRef = useRef(showNotification);
  notificationRef.current = showNotification;

  stateRef.current = {
    CurrentCall,
    recordingTimeRef,
    callStartTimeRef,
    calculateElapsedTime,
    isPaused,
    activeFollowUp,
    onStartCall,
    onStartFollowUp,
    onPause,
    onResume,
    onEndCall,
  };

  useEffect(() => {
    let alive = true;
    const publish = () => {
      if (!alive) return;
      const state = stateRef.current;
      const call = state.CurrentCall;
      const elapsedSeconds = state.calculateElapsedTime?.() ?? state.recordingTimeRef?.current ?? 0;
      const isRunning = Boolean((call?.callStart || elapsedSeconds > 0) && !state.isPaused && !call?.callClosed);
      if (!call?.sr && ownerRef.current) {
        ownerRef.current = false;
        setIsHostedOnDesktop(false);
        postBridgeMessage({ type: "owner-change-request", owner: "browser" });
      }
      postBridgeMessage({
        type: "call-snapshot",
        snapshot: call?.sr ? {
          callId: String(call.sr),
          pageOrigin: window.location.origin,
          callNumber: String(call.sr),
          callerName: String(call.callBy || call.caller || call.CustomerName || "Caller"),
          companyName: String(call.company || call.companyname || call.CompanyName || ""),
          description: String(call.description || ""),
          receivedBy: String(call.receivedBy || ""),
          status: String(call.status || call.Status || ""),
          isPaused: Boolean(state.isPaused),
          isRunning,
          isClosed: Boolean(call.callClosed),
          elapsedSeconds: Math.max(0, Number(elapsedSeconds) || 0),
          startedAt: Number(state.callStartTimeRef?.current) || null,
          isFollowUp: Boolean(state.activeFollowUp),
          followUpCallId: state.activeFollowUp?.followUpCallId || null,
          canStart: state.activeFollowUp
            ? elapsedSeconds <= 0 && !state.isPaused
            : !call.callClosed && !isRunning && !state.isPaused,
          updatedAt: Date.now(),
        } : null,
      });
    };

    const setOwner = (owner) => {
      const nextOwner = owner === "desktop";
      ownerRef.current = nextOwner;
      setIsHostedOnDesktop(nextOwner);
      if (!nextOwner) lastHeartbeatRef.current = 0;
      else if (!lastHeartbeatRef.current) lastHeartbeatRef.current = Date.now();
    };

    const runAction = async ({ name, callId, actionId }) => {
      const state = stateRef.current;
      const call = state.CurrentCall;
      const result = { type: "call-action-result", action: name, actionId, ok: false };
      if (!ownerRef.current || !call?.sr || String(call.sr) !== String(callId)) {
        result.error = "This call is no longer active in the browser.";
      } else {
        try {
          let outcome;
          if (name === "start" && state.activeFollowUp) outcome = await state.onStartFollowUp?.();
          else if (name === "start" && callId) outcome = await state.onStartCall?.(callId);
          else if (name === "pause") outcome = await state.onPause?.();
          else if (name === "resume") outcome = await state.onResume?.();
          else if (name === "end") outcome = await state.onEndCall?.();
          else result.error = "Unsupported call action.";
          if (!result.error && outcome?.success === false) result.error = outcome.error || `Could not ${name} the call.`;
          if (!result.error) result.ok = true;
        } catch (error) {
          result.error = error?.message || "The browser could not apply this call action.";
        }
      }
      postBridgeMessage(result);
      publish();
    };

    const handleMessage = (event) => {
      if (event.source !== window || event.origin !== window.location.origin || event.data?.channel !== CHANNEL) return;
      const message = event.data;
      if (message.type === "call-owner") {
        setOwner(message.owner);
      } else if (message.type === "desktop-heartbeat") {
        lastHeartbeatRef.current = Date.now();
      } else if (message.type === "call-action") {
        void runAction(message.action || {});
      } else if (message.type === "handoff-result" && !message.ok) {
        notificationRef.current?.("QuickCall is not connected. The call is still available in this browser.", "warning");
      }
    };

    window.addEventListener("message", handleMessage);
    publish();
    const snapshotTimer = window.setInterval(publish, 1000);
    const heartbeatWatch = window.setInterval(() => {
      if (ownerRef.current && Date.now() - lastHeartbeatRef.current > HEARTBEAT_TIMEOUT_MS) {
        setOwner("browser");
        notificationRef.current?.("QuickCall disconnected. Call controls returned to this browser.", "warning");
      }
    }, 500);
    return () => {
      alive = false;
      window.removeEventListener("message", handleMessage);
      window.clearInterval(snapshotTimer);
      window.clearInterval(heartbeatWatch);
    };
  }, []);

  return { isHostedOnDesktop };
}
