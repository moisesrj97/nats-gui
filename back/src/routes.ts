import { Router } from 'express';
import { natsWorker } from '.';

const router = Router();

router.post('/credentials', (req, res) => {
  const { servers, user, pass } = req.body;

  console.log('Received credentials');
  console.log({ servers, user, pass });

  natsWorker.setCredentials(servers, user, pass);

  natsWorker.reset();

  res.send('OK');
});

router.post('/event', (req, res) => {
  const { event } = req.body;

  console.log('Received event');
  console.log({ event });

  console.log('Adding event to NATS');

  natsWorker.addEventToListen(event);

  natsWorker.reset();

  res.send('OK');
});

router.delete('/event/:event', (req, res) => {
  const { event } = req.params;

  console.log('Received event');
  console.log({ event });

  console.log('Removing event from NATS');

  natsWorker.removeEventToListen(event);

  natsWorker.reset();

  res.send('OK');
});

router.post('/emit-event', (req, res) => {
  const { type, msg } = req.body;

  console.log('Received event to send');
  console.log({ type, msg });

  console.log('Emitting event to NATS');

  natsWorker.emitEvent(type, msg);

  res.send('OK');
});

export default router;
