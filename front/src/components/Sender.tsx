import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { backendURl } from '../App';
import { highlight, languages } from '../assets/prism';
import '../assets/prism.css';

function Sender() {
  const [code, setCode] = React.useState(`{"test": "test"}`);
  const [isValidJSON, setIsValidJSON] = useState(true);
  const [eventType, setEventType] = useState('');

  useEffect(() => {
    try {
      JSON.parse(code);
      setIsValidJSON(true);
    } catch (e) {
      setIsValidJSON(false);
    }
  }, [code]);

  const generateEvent = async () => {
    console.log(`Emitting event ${code} to ${eventType}`);

    await axios.post(`${backendURl}/emit-event`, {
      type: eventType,
      msg: code,
    });

    setCode('{}');
  };

  return (
    <div className='flex flex-col w-2/5 justify-between'>
      <h2 className='text-2xl mb-5'>Generate Event</h2>
      <div className='relative flex-grow'>
        <div
          className={`border ${
            isValidJSON ? 'border-teal-400' : 'border-red-400'
          } rounded-md outline-none flex-grow overflow-auto absolute left-0 top-0 bottom-0 right-0`}
        >
          <Editor
            value={code}
            onValueChange={(codeToParse) => setCode(codeToParse)}
            highlight={(codeToHighlight) =>
              highlight(
                codeToHighlight,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (languages as any).json
              )
            }
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              minHeight: '100%',
            }}
          />
        </div>
      </div>

      {!isValidJSON && <p className='text-xs text-red-400'>Invalid JSON</p>}
      <div className='flex items-center gap-2 mt-3'>
        <label htmlFor='eventType' className='sr-only'>
          Event type:
        </label>
        <input
          placeholder='Event type:'
          id='eventType'
          type='text'
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className='w-96 border border-gray-200 rounded-md p-2 outline-teal-500 px-2'
        />
        <button
          onClick={generateEvent}
          type='button'
          className='px-2 py-1 bg-teal-500 text-white rounded-md font-medium text-lg hover:bg-teal-600'
        >
          Generate
        </button>
      </div>
    </div>
  );
}

export default Sender;
