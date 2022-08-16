import axios from 'axios';
import React, { useEffect, useState } from 'react';

import io from 'socket.io-client';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CredentialsForm } from './components/CredentialsForm';
import { NewEventForm } from './components/NewEventForm';
import { EventsDisplay } from './components/EventsDisplay';

export const backendURl = 'http://localhost:4001';

const socket = io(backendURl, { transports: ['websocket'] });

export type Event = {
  id: string;
  type: string;
  msg: any;
};

function App() {
  const [events, setEvents] = useState<{
    [key: string]: Event[];
  }>({});

  const [eventsToListen, setEventsToListen] = useState<string[]>([]);

  const [connectionEstablished, setConnectionEstablished] =
    useState<boolean>(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket');
    });

    socket.on('event', (event: Event) => {
      setEvents((events) => {
        const newEvents = { ...events };
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
      <Header connectionEstablished={connectionEstablished} />
      <main className='flex-grow'>
        <div className='flex gap-5 w-full'>
          <CredentialsForm connectionEstablished={connectionEstablished} />
          <NewEventForm
            connectionEstablished={connectionEstablished}
            eventsToListen={eventsToListen}
            setEventsToListen={setEventsToListen}
          />
        </div>

        <EventsDisplay
          events={events}
          eventsToListen={eventsToListen}
          handleDeleteEvent={handleDeleteEvent}
        ></EventsDisplay>
      </main>

      <Footer />
    </div>
  );
}

export default App;
