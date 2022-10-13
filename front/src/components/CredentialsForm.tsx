import axios from 'axios';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { backendURl } from '../App';
import useClickOutside from '../hooks/useClickOutside';

export function CredentialsForm({
  connectionEstablished,
  setShowCredentialsModal,
}: {
  connectionEstablished: boolean;
  setShowCredentialsModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [connectionCredentials, setConnectionCredentials] = useState({
    servers: '',
    user: '',
    pass: '',
  });

  useEffect(() => {
    const credentials = localStorage.getItem('nats-credentials');
    if (credentials) {
      setConnectionCredentials(JSON.parse(credentials));
    }
  }, []);

  const modal = useRef<HTMLDivElement>(null);

  useClickOutside(modal, () => setShowCredentialsModal(false));

  const handleSubmitCredentials = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e?.preventDefault();
    await axios.post(`${backendURl}/credentials`, {
      servers: connectionCredentials.servers,
      user: connectionCredentials.user,
      pass: connectionCredentials.pass,
    });
    localStorage.setItem(
      'nats-credentials',
      JSON.stringify(connectionCredentials)
    );
    setShowCredentialsModal(false);
  };

  return (
    <div className='bg-black/75 fixed top-0 left-0 w-screen h-screen flex items-center justify-center z-10'>
      <div className='bg-white p-10 rounded-md shadow-md' ref={modal}>
        <h2 className='text-2xl mb-5'>Credentials</h2>
        <form
          onSubmit={handleSubmitCredentials}
          className='flex flex-col gap-5'
        >
          <label className='flex flex-col sr-only' htmlFor='servers'>
            Server:
          </label>
          <input
            className='border rounded-md mt-1 mr-5 px-2 py-1 w-96'
            type='text'
            name='servers'
            id='servers'
            placeholder='Server: nats://XXXXXXXXX'
            value={connectionCredentials.servers}
            onChange={(e) =>
              setConnectionCredentials({
                ...connectionCredentials,
                servers: e.target.value,
              })
            }
          />
          <label className='flex flex-col sr-only' htmlFor='user'>
            {' '}
            User:
          </label>
          <input
            className='border rounded-md mt-1 mr-5 px-2 py-1'
            type='text'
            name='user'
            id='user'
            placeholder='User'
            value={connectionCredentials.user}
            onChange={(e) =>
              setConnectionCredentials({
                ...connectionCredentials,
                user: e.target.value,
              })
            }
          />
          <label className='flex flex-col sr-only' htmlFor='pass'>
            {' '}
            Password:
          </label>
          <input
            className='border rounded-md mt-1 mr-5 px-2 py-1'
            type='text'
            name='pass'
            id='pass'
            value={connectionCredentials.pass}
            placeholder='Password'
            onChange={(e) =>
              setConnectionCredentials({
                ...connectionCredentials,
                pass: e.target.value,
              })
            }
          />
          <button
            className='px-2 py-1 bg-teal-500 text-white rounded-md font-medium text-lg shadow-md hover:bg-teal-600'
            type='submit'
          >
            {connectionEstablished ? 'Change credentials' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}
