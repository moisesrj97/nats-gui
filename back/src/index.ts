import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';

import dotenv from 'dotenv';

import NatsWorker from './natsWorker';

import routes from './routes';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.use(bodyParser.json());

export const natsConnectionObj = {
  servers: '',
  user: '',
  pass: '',
};

export let natsEventsToListen: string[] = [];

export const natsWorker = new NatsWorker();

app.use(routes);

const server = http.createServer(app);

export const io = new Server(server);

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
