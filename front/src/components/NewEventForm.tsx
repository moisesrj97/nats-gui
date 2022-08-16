import axios from 'axios';
import React, { useState } from 'react';
import { backendURl } from '../App';

export function NewEventForm({
  setEventsToListen,
  connectionEstablished,
  eventsToListen,
}: {
  setEventsToListen: React.Dispatch<React.SetStateAction<string[]>>;
  connectionEstablished: boolean;
  eventsToListen: string[];
}) {
  const [newEvent, setNewEvent] = useState<string>('');

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (connectionEstablished && !eventsToListen.includes(newEvent)) {
      await axios.post(`${backendURl}/event`, {
        event: newEvent,
      });

      setEventsToListen((prevEvents) => [...prevEvents, newEvent]);
    }

    setNewEvent('');
  };

  return (
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
            value={newEvent}
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
    </div>
  );
}
