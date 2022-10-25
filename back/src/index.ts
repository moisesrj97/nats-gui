import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';

import dotenv from 'dotenv';

import NatsWorker from './natsWorker';

import routes from './routes';

dotenv.config();

export const natsWorker = new NatsWorker();

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

app.use(bodyParser.json());

app.use(routes);

const server = http.createServer(app);

export const io = new Server(server);

io.on('connection', () => {
  console.log('Client connected');
  natsWorker.clearCredentials();
  natsWorker.clearEventsToListen();
  natsWorker.reset();
});

server.listen(4001, () => {
  console.log('listening on port 4001');
  natsWorker.start();
});
