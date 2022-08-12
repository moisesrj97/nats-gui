import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import http from 'http';

import dotenv from 'dotenv';

import NatsWorker from './natsWorker';

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
