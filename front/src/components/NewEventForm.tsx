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
    <div className='rounded-md w-full'>
      <h2 className='text-2xl mb-5'>Events listened</h2>
      <form onSubmit={handleAddEvent} className='flex gap-1'>
        <label htmlFor='addEvent' className='flex flex-col  sr-only'>
          Add event:
        </label>
        <input
          className='w-full border border-gray-200 rounded-md p-2 outline-teal-500 px-2'
          type='text'
          name='addEvent'
          id='addEvent'
          placeholder='Add event:'
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
        />
        <button
          type='submit'
          className='px-2 py-1 bg-teal-500 text-white rounded-md font-medium text-lg hover:bg-teal-600'
        >
          Add
        </button>
      </form>
    </div>
  );
}
