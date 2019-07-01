import React from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const ioClient = io.connect("http://localhost:3000");
  ioClient.on("data", msg => console.log(msg, 'from server'));
  return (
    <div className="App">
      
    </div>
  );
}

export default App;
