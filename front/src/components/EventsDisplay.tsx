import React, { useEffect, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/outline';
import clsx from '../helpers/clsx';
import { Event } from '../App';

export function EventsDisplay({
  eventsToListen,
  events,
  handleDeleteEvent,
}: {
  eventsToListen: string[];
  events: {
    [key: string]: Event[];
  };
  handleDeleteEvent: (id: string) => void;
}) {
  const [selectedEvent, setSelectedEvent] = useState<string>('');

  useEffect(() => {
    if (!eventsToListen.includes(selectedEvent)) {
      setSelectedEvent(eventsToListen[0]);
    }
  }, [eventsToListen, selectedEvent]);

  return (
    <div>
      <div className='flex gap-6 mt-8'>
        {eventsToListen.map((event) => (
          <div
            key={event}
            className={clsx(
              'group flex gap-2 items-center px-4 py-2 rounded-md cursor-pointer',
              event === selectedEvent ? 'bg-teal-200' : 'bg-teal-100'
            )}
            onClick={() => setSelectedEvent(event)}
          >
            <h4 className={clsx('text-xl cursor-pointer')}>{event}</h4>
            <XCircleIcon
              className='text-red-500 w-0 opacity-0 group-hover:w-6 group-hover:opacity-100 transition-all ease-linear'
              onClick={() => handleDeleteEvent(event)}
            />
          </div>
        ))}
      </div>

      <div className='w-full p-10'>
        <ul className='flex flex-col gap-4}'>
          {events[selectedEvent] &&
            events[selectedEvent].map((e) => (
              <li key={e.id} className='p-4 bg-gray-200 rounded-sm'>
                <pre>{JSON.stringify(JSON.parse(e.msg), null, 2)}</pre>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
