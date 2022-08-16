import React from 'react';
import clsx from '../helpers/clsx';

export function Header({
  connectionEstablished,
}: {
  connectionEstablished: boolean;
}) {
  return (
    <header className='flex justify-between items-center'>
      <h2 className='text-xl font-bold text-center'>
        <span className='text-teal-500'>NATS</span> GUI 🥦
      </h2>
      <p className='flex items-center self-end'>
        {connectionEstablished ? 'Online' : 'Offline'}
        <span
          className={clsx(
            'ml-2',
            connectionEstablished ? 'text-green-500' : 'text-red-500'
          )}
        >
          ●
        </span>
      </p>
    </header>
  );
}
