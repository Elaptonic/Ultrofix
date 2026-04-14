import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { logger } from "./logger";

let io: SocketIOServer | null = null;

export const vendorSockets = new Map<number, string>();

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    path: "/api/socket.io",
    cors: { origin: "*" },
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Socket connected");

    socket.on("join", (userId: string) => {
      socket.join(`user:${userId}`);
      logger.debug({ userId, socketId: socket.id }, "Socket joined user room");
    });

    socket.on("register-vendor", (providerId: number) => {
      vendorSockets.set(providerId, socket.id);
      socket.join(`vendor:${providerId}`);
      logger.info({ providerId, socketId: socket.id }, "Vendor registered");
      socket.emit("vendor:registered", { providerId, status: "online" });
    });

    socket.on("disconnect", () => {
      for (const [providerId, socketId] of vendorSockets.entries()) {
        if (socketId === socket.id) {
          vendorSockets.delete(providerId);
          logger.info({ providerId, socketId: socket.id }, "Vendor disconnected");
          break;
        }
      }
      logger.debug({ socketId: socket.id }, "Socket disconnected");
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToVendor(providerId: number, event: string, payload: unknown) {
  if (!io) return;
  io.to(`vendor:${providerId}`).emit(event, payload);
}
