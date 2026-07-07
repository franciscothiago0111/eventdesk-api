import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

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

  private roomFor(eventId: string): string {
    return `event:${eventId}`;
  }
}
