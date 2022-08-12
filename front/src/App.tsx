import axios from 'axios';
import React, { useEffect, useState } from 'react';

import { TrashIcon } from '@heroicons/react/outline';

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
    <div className='w-screen h-min-screen flex flex-col p-10'>
      <h2 className='text-3xl font-bold text-center underline-offset-4 decoration-teal-500 underline'>
        NATS GUI
      </h2>
      <p className='flex items-center self-end'>
        Connected
        <span
          className={`text-${connectionEstablished ? 'green' : 'red'}-500 ml-2`}
        >
          ●
        </span>
      </p>
      <div className='flex gap-5 w-full'>
        <div className='p-10 rounded-md shadow-md w-full'>
          <h2 className='text-2xl mb-5'>Credentials</h2>
          <form
            onSubmit={handleSubmitCredentials}
            className='flex flex-col gap-5'
          >
            <label className='flex flex-col' htmlFor='servers'>
              Server:
              <input
                className='border rounded-md mt-1 mr-5 px-2 py-1'
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
            <label className='flex flex-col' htmlFor='user'>
              {' '}
              User:
              <input
                className='border rounded-md mt-1 mr-5 px-2 py-1'
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
            <label className='flex flex-col' htmlFor='pass'>
              {' '}
              Password:
              <input
                className='border rounded-md mt-1 mr-5 px-2 py-1'
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
            <button
              className='px-2 py-1 bg-teal-500 text-white rounded-md font-medium text-lg shadow-md hover:bg-teal-600'
              type='submit'
            >
              {connectionEstablished ? 'Change credentials' : 'Connect'}
            </button>
          </form>
        </div>
        <div className='p-10 rounded-md shadow-md w-full'>
          <h2 className='text-2xl mb-5'>Events listened</h2>
          <form onSubmit={handleAddEvent} className='flex flex-col gap-5'>
            <label htmlFor='addEvent' className='flex flex-col'>
              Add event:
              <input
                className='border rounded-md mt-1 mr-5 px-2 py-1'
                type='text'
                name='addEvent'
                id='addEvent'
                onChange={(e) => setNewEvent(e.target.value)}
              />
            </label>
            <button
              type='submit'
              className='px-2 py-1 bg-teal-500 text-white rounded-md font-medium text-lg shadow-md hover:bg-teal-600'
            >
              Añadir evento
            </button>
          </form>
          <ul className='flex flex-col gap-2 mt-5'>
            {eventsToListen.map((event) => (
              <li
                key={event}
                className='flex justify-between items-center gap-8'
              >
                <span className='p-2 rounded-lg bg-gray-200 flex-grow text-center'>
                  {event}
                </span>
                <TrashIcon
                  className='text-red-300 hover:text-red-500 h-8 cursor-pointer'
                  onClick={() => handleDeleteEvent(event)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='w-full p-10'>
        {Object.keys(events).map((event) => (
          <div key={event}>
            <h4 className='text-2xl m-2'>{event}</h4>
            <ul className='flex flex-col gap-4'>
              {events[event].map((e) => (
                <li key={e.id} className='p-4 bg-gray-200 rounded-sm'>
                  <pre>{JSON.stringify(JSON.parse(e.msg), null, 2)}</pre>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
