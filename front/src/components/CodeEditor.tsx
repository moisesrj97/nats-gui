import React, { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from '../assets/prism';
import '../assets/prism.css';

function CodeEditor() {
  const [code, setCode] = React.useState(`{"test": "test"}`);
  const [isValidJSON, setIsValidJSON] = useState(true);

  useEffect(() => {
    try {
      JSON.parse(code);
      setIsValidJSON(true);
    } catch (e) {
      setIsValidJSON(false);
    }
  }, [code]);

  return (
    <>
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
        }}
      />
      {isValidJSON ? <div>Valid JSON</div> : <div>Invalid JSON</div>}
    </>
  );
}

export default CodeEditor;
