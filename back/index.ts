import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';

import { connect, NatsConnection } from 'nats';

import dotenv from 'dotenv';

import crypto from 'crypto';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.use(bodyParser.json());

const natsConnectionObj = {
  servers: '',
  user: '',
  pass: '',
};

let natsEventsToListen: string[] = [];

class NatsWorker {
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

const natsWorker = new NatsWorker();

app.post('/credentials', (req, res) => {
  const { servers, user, pass } = req.body;

  console.log('Received credentials');
  console.log({ servers, user, pass });

  natsConnectionObj.servers = servers;
  natsConnectionObj.user = user;
  natsConnectionObj.pass = pass;

  natsWorker.reset();

  res.send('OK');
});

app.post('/event', (req, res) => {
  const { event } = req.body;

  console.log('Received event');
  console.log({ event });

  console.log('Adding event to NATS');

  natsEventsToListen.push(event);

  natsWorker.reset();

  res.send('OK');
});

app.delete('/event/:event', (req, res) => {
  const { event } = req.params;

  console.log('Received event');
  console.log({ event });

  console.log('Removing event from NATS');

  natsEventsToListen.splice(natsEventsToListen.indexOf(event), 1);

  natsWorker.reset();

  res.send('OK');
});

const server = http.createServer(app);

const io = new Server(server);

io.on('connection', () => {
  console.log('Client connected');
  natsConnectionObj.servers = '';
  natsConnectionObj.user = '';
  natsConnectionObj.pass = '';
  natsEventsToListen = [];

  natsWorker.reset();
});

server.listen(4001, () => {
  console.log('listening on port 4001');
  natsWorker.start();
});
