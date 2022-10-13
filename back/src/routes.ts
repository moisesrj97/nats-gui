import { Router } from 'express';
import { StringCodec } from 'nats';
import { natsConnectionObj, natsEventsToListen, natsWorker } from '.';

const router = Router();

router.post('/credentials', (req, res) => {
  const { servers, user, pass } = req.body;

  console.log('Received credentials');
  console.log({ servers, user, pass });

  natsConnectionObj.servers = servers;
  natsConnectionObj.user = user;
  natsConnectionObj.pass = pass;

  natsWorker.reset();

  res.send('OK');
});

router.post('/event', (req, res) => {
  const { event } = req.body;

  console.log('Received event');
  console.log({ event });

  console.log('Adding event to NATS');

  natsEventsToListen.push(event);

  natsWorker.reset();

  res.send('OK');
});

router.delete('/event/:event', (req, res) => {
  const { event } = req.params;

  console.log('Received event');
  console.log({ event });

  console.log('Removing event from NATS');

  natsEventsToListen.splice(natsEventsToListen.indexOf(event), 1);

  natsWorker.reset();

  res.send('OK');
});

router.post('/emit-event', (req, res) => {
  const { type, msg } = req.body;

  console.log('Received event to send');
  console.log({ type, msg });

  console.log('Emitting event to NATS');

  natsWorker.connection.publish(type, StringCodec().encode(msg));

  res.send('OK');
});

export default router;
