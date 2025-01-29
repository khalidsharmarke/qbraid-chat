# qbraid-chat README

This is the README for the extension "qbraid-chat".

## Commands
- QBraid: Set Api Key
  - Sets your API key (defaults to looking up ~/.qbraid/qbraidrc file)
- QBraid: Set QBraidRc File Path 
  - Sets your qbraidrc file path (defaults to looking up ~/.qbraid/qbraidrc file)
- QBraid: Select Chat Model
  - Allows you select a model to start a chat with
- QBraid: Start Chat
  - Allows you to start a chat
- QBraid: Enable/Disable Agent Behavior
  - Turns on/off agent(-ish) behavior

## Chat Windows
Each chat window has it own context and retains its own state.
This means you can start multiple chats with independent states, each using a different model.

## Agent Behavior
This is a global setting that is shared across chats and rudimentary. By leveraging the `/chat` endpoint to process whether a user's question is possibly related to one of the other services, it'll respound with all the information regarding a user's data in each other the relevant services.