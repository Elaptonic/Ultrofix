import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export type SocketStatus = "connecting" | "connected" | "disconnected" | "error";

export interface NewLead {
  bookingId: number;
  serviceName: string;
  category: string;
  providerName: string;
  date: string;
  time: string;
  address: string;
  price: number;
  userId: string;
}

export function useVendorSocket(
  providerId: number | null,
  onNewLead?: (lead: NewLead) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const onNewLeadRef = useRef(onNewLead);
  onNewLeadRef.current = onNewLead;

  const [status, setStatus] = useState<SocketStatus>("disconnected");

  useEffect(() => {
    if (providerId === null) return;

    const socket = io(SOCKET_URL, {
      path: "/api/socket.io",
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;
    setStatus("connecting");

    socket.on("connect", () => {
      setStatus("connected");
      socket.emit("register-vendor", providerId);
    });

    socket.on("vendor:registered", () => {
      setStatus("connected");
    });

    socket.on("NEW_LEAD", (lead: NewLead) => {
      onNewLeadRef.current?.(lead);
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setStatus("error");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setStatus("disconnected");
    };
  }, [providerId]);

  return { socket: socketRef.current, status };
}
