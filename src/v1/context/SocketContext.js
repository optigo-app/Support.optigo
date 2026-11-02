import React, { createContext, useContext, useEffect, useState } from "react";
import { socketService } from "../apis/SocketController";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket] = useState(() => socketService.init());

  useEffect(() => {
    if (!socket) return undefined;

    const bridgeSocketEvent = (event, ...args) => {
      const payload = args.length > 1 ? args : args[0];
      window.postMessage(
        { channel: "optigo-extension-bridge", type: "socket-event", event, payload },
        window.location.origin,
      );
    };
    const bridgeSocketStatus = (connected) => {
      window.postMessage(
        { channel: "optigo-extension-bridge", type: "socket-status", connected },
        window.location.origin,
      );
    };
    const handleConnect = () => bridgeSocketStatus(true);
    const handleDisconnect = () => bridgeSocketStatus(false);

    socket.connect();
    socket.onAny(bridgeSocketEvent);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    bridgeSocketStatus(socket.connected);
    return () => {
      socket.offAny(bridgeSocketEvent);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
