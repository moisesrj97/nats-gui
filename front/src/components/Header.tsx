import React, { Dispatch, SetStateAction } from 'react';
import clsx from '../helpers/clsx';

export function Header({
  connectionEstablished,
  setShowCredentialsModal,
}: {
  connectionEstablished: boolean;
  setShowCredentialsModal: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <header className='flex justify-between items-center'>
      <h2 className='text-xl font-bold text-center'>
        <span className='text-teal-500'>NATS</span> GUI 🥦
      </h2>
      <button
        className={clsx(
          'flex items-center self-end px-4 py-2 text-sm font-semibold text-gray-700 rounded-md',
          connectionEstablished
            ? 'bg-green-200 hover:bg-green-300'
            : 'bg-red-200 hover:bg-red-300'
        )}
        onClick={() => setShowCredentialsModal(true)}
        type='button'
      >
        {connectionEstablished ? 'Online' : 'Offline'}
        <span
          className={clsx(
            'ml-2',
            connectionEstablished ? 'text-green-500' : 'text-red-500'
          )}
        >
          ●
        </span>
      </button>
    </header>
  );
}
