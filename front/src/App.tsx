import axios from 'axios';
import React, { useEffect, useState } from 'react';

import io from 'socket.io-client';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CredentialsForm } from './components/CredentialsForm';
import { NewEventForm } from './components/NewEventForm';
import { EventsDisplay } from './components/EventsDisplay';
import Sender from './components/Sender';

export const backendURl = 'http://localhost:4001';

const socket = io(backendURl, { transports: ['websocket'] });

export type Event = {
  id: string;
  type: string;
  msg: string;
};

function App() {
  const [events, setEvents] = useState<{
    [key: string]: Event[];
  }>({});

  const [eventsToListen, setEventsToListen] = useState<string[]>([]);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const [connectionEstablished, setConnectionEstablished] =
    useState<boolean>(false);

  useEffect(() => {
    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('Connected to Socket');
    });

    socket.on('event', (event: Event) => {
      setEvents((oldEvents) => {
        const newEvents = { ...oldEvents };
        if (!newEvents[event.type]) {
          newEvents[event.type] = [];
        }
        if (!newEvents[event.type].some((e) => e.id === event.id)) {
          newEvents[event.type].push(event);
        }
        return newEvents;
      });
    });

    socket.on('nats-connected', () => {
      setConnectionEstablished(true);
    });
    socket.on('nats-disconnected', () => {
      setConnectionEstablished(false);
    });
  }, []);

  const handleDeleteEvent = async (event: string) => {
    await axios.delete(`${backendURl}/event/${encodeURIComponent(event)}`);
    setEventsToListen((prevEvents) => prevEvents.filter((e) => e !== event));
  };

  return (
    <div className='w-screen min-h-screen flex flex-col p-5 justify-between'>
      {showCredentialsModal && (
        <CredentialsForm
          connectionEstablished={connectionEstablished}
          setShowCredentialsModal={setShowCredentialsModal}
        />
      )}
      <Header
        connectionEstablished={connectionEstablished}
        setShowCredentialsModal={setShowCredentialsModal}
      />
      <main className='flex-grow flex'>
        <div className='flex-grow flex gap-8 p-10'>
          <Sender />
          <div className='flex flex-col gap-5 w-3/5'>
            <NewEventForm
              connectionEstablished={connectionEstablished}
              eventsToListen={eventsToListen}
              setEventsToListen={setEventsToListen}
            />
            <EventsDisplay
              events={events}
              eventsToListen={eventsToListen}
              handleDeleteEvent={handleDeleteEvent}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
