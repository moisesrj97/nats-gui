import axios from 'axios';
import React, { useEffect, useState } from 'react';

import io from 'socket.io-client';

const backendURl = 'http://localhost:4001';

const socket = io(backendURl, { transports: ['websocket'] });

type Event = {
  id: string;
  type: string;
  msg: any;
};

function App() {
  const [events, setEvents] = useState<{
    [key: string]: Event[];
  }>({});

  const [eventsToListen, setEventsToListen] = useState<string[]>([]);

  const [newEvent, setNewEvent] = useState<string>('');

  const [connectionEstablished, setConnectionEstablished] =
    useState<boolean>(false);

  const [connectionCredentials, setConnectionCredentials] = useState({
    servers: '',
    user: '',
    pass: '',
  });

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected');
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

  const handleSubmitCredentials = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    await axios.post(`${backendURl}/credentials`, {
      servers: connectionCredentials.servers,
      user: connectionCredentials.user,
      pass: connectionCredentials.pass,
    });
  };

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await axios.post(`${backendURl}/event`, {
      event: newEvent,
    });

    setEventsToListen((prevEvents) => [...prevEvents, newEvent]);
  };

  const handleDeleteEvent = async (event: string) => {
    await axios.delete(`${backendURl}/event/${encodeURIComponent(event)}`);
    setEventsToListen((prevEvents) => prevEvents.filter((e) => e !== event));
  };

  return (
    <div className='App'>
      <h2>Status</h2>
      <p>Connection established: {`${connectionEstablished}`}</p>
      <div>
        <h2>Credenciales</h2>
        <form onSubmit={handleSubmitCredentials}>
          <label htmlFor='servers'>
            Server:
            <input
              type='text'
              name='servers'
              id='servers'
              onChange={(e) =>
                setConnectionCredentials({
                  ...connectionCredentials,
                  servers: e.target.value,
                })
              }
            />
          </label>
          <label htmlFor='user'>
            {' '}
            User:
            <input
              type='text'
              name='user'
              id='user'
              onChange={(e) =>
                setConnectionCredentials({
                  ...connectionCredentials,
                  user: e.target.value,
                })
              }
            />
          </label>
          <label htmlFor='pass'>
            {' '}
            Password:
            <input
              type='text'
              name='pass'
              id='pass'
              onChange={(e) =>
                setConnectionCredentials({
                  ...connectionCredentials,
                  pass: e.target.value,
                })
              }
            />
          </label>
          <button type='submit'>Cambiar credenciales</button>
        </form>
      </div>
      <div>
        <h2>Eventos</h2>
        <form onSubmit={handleAddEvent}>
          <label htmlFor='addEvent'>
            Add event:
            <input
              type='text'
              name='addEvent'
              id='addEvent'
              onChange={(e) => setNewEvent(e.target.value)}
            />
          </label>
          <button type='submit'>Añadir evento</button>
        </form>
      </div>
      <div>
        <ul>
          {eventsToListen.map((event) => (
            <li key={event}>
              {event}{' '}
              <span onClick={() => handleDeleteEvent(event)}>- X -</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Eventos recibidos</h3>
        {Object.keys(events).map((event) => (
          <div key={event}>
            <h4>{event}</h4>
            <ul>
              {events[event].map((e) => (
                <li key={e.id}>{e.msg}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
