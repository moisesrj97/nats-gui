import { connect, NatsConnection } from 'nats';
import { io, natsConnectionObj, natsEventsToListen } from '.';
import crypto from 'crypto';

export default class NatsWorker {
  connection!: NatsConnection;

  reconnectionsLimit = 10;

  reconnections = 0;

  async start() {
    try {
      this.connection = await connect(natsConnectionObj);
      console.log('Connected to NATS');
      io.emit('nats-connected');
      await this.stablishListeners();
    } catch (error) {
      this.reconnections++;
      if (this.reconnections < this.reconnectionsLimit) {
        this.start();
      } else {
        io.emit('nats-disconnected');
        console.log("Can't connect to NATS");
      }
    }
  }

  async stablishListeners() {
    natsEventsToListen.forEach((event) => {
      console.log('Listening to event: ', event);
      this.connection.subscribe(event, {
        callback: (error, msg) => {
          console.log('Received message on ', event);
          console.log(msg.data.toString());
          io.emit('event', {
            id: crypto.randomUUID(),
            type: event,
            msg: msg.data.toString(),
          });
        },
      });
    });
  }

  async stop() {
    if (this.connection) {
      await this.connection.close();
    }
  }

  reset() {
    this.reconnections = 0;
    this.stop();
    this.start();
  }
}
