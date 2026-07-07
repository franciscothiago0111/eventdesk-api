import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventName } from './event-names.constant';

@Injectable()
export class EventDispatcherService {
  constructor(private readonly emitter: EventEmitter2) {}

  dispatch<T extends object>(eventName: EventName, payload: T) {
    this.emitter.emit(eventName, payload);
  }
}
