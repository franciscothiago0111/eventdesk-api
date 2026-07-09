import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

interface JwtPayload {
  sub: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) return;

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'change-me-in-local-env',
      });
      client.join(this.userRoomFor(payload.sub));
      client.emit('authenticated', { userId: payload.sub });
    } catch (error) {
      // Invalid/expired token — the socket simply won't receive user-scoped
      // notifications, but event-room realtime (public-facing) still works.
      client.emit('auth-error', {
        message: error instanceof Error ? error.message : 'Invalid token',
      });
    }
  }

  @SubscribeMessage('join-event')
  handleJoinEvent(
    @MessageBody() eventId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(this.roomFor(eventId));
  }

  emitCheckInRecorded(eventId: string, payload: unknown) {
    this.server.to(this.roomFor(eventId)).emit('checkin.recorded', payload);
  }

  emitRegistrationConfirmed(eventId: string, payload: unknown) {
    this.server
      .to(this.roomFor(eventId))
      .emit('registration.confirmed', payload);
  }

  emitNotification(userId: string, payload: unknown) {
    this.server.to(this.userRoomFor(userId)).emit('notification', payload);
  }

  private roomFor(eventId: string): string {
    return `event:${eventId}`;
  }

  private userRoomFor(userId: string): string {
    return `user:${userId}`;
  }
}
