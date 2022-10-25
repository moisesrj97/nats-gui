import { connect, NatsConnection, StringCodec } from 'nats';
import crypto from 'crypto';
import { io } from '.';

export default class NatsWorker {
  connection!: NatsConnection;

  reconnectionsLimit = 10;

  reconnections = 0;

  credentials: {
    servers: string;
    user: string;
    pass: string;
  } = {
    servers: '',
    user: '',
    pass: '',
  };

  eventsToListen: string[] = [];

  async start() {
    try {
      if (Object.values(this.credentials).every((value) => value !== '')) {
        await this.connect();
        console.log('Connected to NATS');
        io.emit('nats-connected');
        await this.stablishListeners();
      }
    } catch (error) {
      this.reconnections += 1;
      if (this.reconnections < this.reconnectionsLimit) {
        this.start();
      } else {
        io.emit('nats-disconnected');
        console.log("Can't connect to NATS");
      }
    }
  }

  async stablishListeners() {
    this.eventsToListen.forEach((event) => {
      console.log('Listening to event: ', event);
      this.connection.subscribe(event, {
        callback: (error, msg) => {
          console.log(`Received message on ${event}`);
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

  async connect() {
    this.connection = await connect(this.credentials);
  }

  async stop() {
    if (this.connection) {
      await this.connection.close();
    }
  }

  setCredentials(servers: string, user: string, pass: string) {
    this.credentials.servers = servers;
    this.credentials.user = user;
    this.credentials.pass = pass;
  }

  clearCredentials() {
    this.credentials.servers = '';
    this.credentials.user = '';
    this.credentials.pass = '';
  }

  addEventToListen(event: string) {
    this.eventsToListen.push(event);
  }

  removeEventToListen(event: string) {
    this.eventsToListen.splice(this.eventsToListen.indexOf(event), 1);
  }

  clearEventsToListen() {
    this.eventsToListen = [];
  }

  emitEvent(type: string, msg: string) {
    this.connection.publish(type, StringCodec().encode(msg));
  }

  reset() {
    this.reconnections = 0;
    this.stop();
    this.start();
  }
}
