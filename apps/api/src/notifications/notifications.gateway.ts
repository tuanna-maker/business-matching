import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token || typeof token !== "string") {
        client.disconnect(true);
        return;
      }
      const payload: any = this.jwtService.decode(token);
      const userId = payload?.sub as string | undefined;
      if (!userId) {
        client.disconnect(true);
        return;
      }
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets) {
      if (sockets.delete(client.id) && sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  emitToUser(userId: string, payload: any) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    for (const socketId of sockets) {
      this.server.to(socketId).emit("notification", payload);
    }
  }
}

