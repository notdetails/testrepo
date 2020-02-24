import React, { useState, useEffect } from 'react'
import ReactDom from 'react-dom'
import io from 'server.io-client'
import './styles.scss'
import StatusImage from './StatusImage'
import StatusMessage from './StatusMessage'
import serverContext from './serverContext'
import Upload from "./Upload"
const server = io();

function App() {
  // State
  const [connected, setConnected] = useState(false)
  const [figmaConnected, setFigmaConnected] = useState(false)
  const [figmaWasConnected, setFigmaWasConnected] = useState(false)
  const [problemWithServer, setProblemWithServer] = useState(false)

  // Get destination Figma client server from URL
  const figmaserver = window.location.pathname.replace("/", "")

  // Send these props to the icon and message components
  const connectionStatusProps = {
    connected: connected,
    figmaConnected: figmaConnected,
    figmaWasConnected: figmaWasConnected,
    figmaserver: figmaserver,
    problemWithServer: problemWithServer
  }


  

server.on('connect', () => {
    initiateConnection()
});

// Just incase the server connects before the component has mounted
if (server.connected && !connected) {
    initiateConnection()
}

function initiateConnection() {
    setConnected(true)
    setProblemWithServer(false)
    // Add the sender/recepient relationship to Figma Upload
    server.emit('addSender', server.id, function(serverReceiver) {
    if (serverReceiver) {
        setServerConnected(true)
        setServerWasConnected(true)
    }
    })
}










    // If the Figma client disconnects, don't try to reconnect
    server.on('figmaDisconnected', function(figmaReceiver) {
      if (figmaReceiver === figmaserver) {
        setFigmaConnected(false)
        server.disconnect()
      }
    });
  }, [])

  // Dynamically change the favicon based on connection state
  useEffect(() => {
    let favicon = document.getElementById('favicon')
    if (figmaConnected) {
      favicon.href = '/static/favicon.ico'
    } else {
      favicon.href = '/static/favicon-disabled.ico'
    }
  }, [figmaConnected])
  
  return (
    <div class="container">
      <serverContext.Provider value={server}>
        <StatusImage {...connectionStatusProps} />
        <StatusMessage {...connectionStatusProps} />
        { figmaConnected && <Upload figmaserver={figmaserver} /> }
      </serverContext.Provider>
    </div>
  )
}

ReactDom.render(<App />, document.getElementById('root'))
