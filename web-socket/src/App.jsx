import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [username, setUsername] = useState('')
  const [connected, setConnected] = useState(false)
  const ws = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080')

    ws.current.onopen = () => setConnected(true)

    ws.current.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      setMessages((prev) => [...prev, msg])
    }

    ws.current.onclose = () => setConnected(false)

    return () => ws.current.close()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !username.trim()) return

    const msg = {
      user: username,
      text: input,
      time: new Date().toLocaleTimeString(),
    }

    ws.current.send(JSON.stringify(msg))
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Chat WebSocket</h1>
        <span className={`status ${connected ? 'online' : 'offline'}`}>
          {connected ? '● Connecté' : '● Déconnecté'}
        </span>
      </header>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <span className="msg-user">{msg.user}</span>
            <span className="msg-text">{msg.text}</span>
            <span className="msg-time">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-inputs">
        <input
          className="input-username"
          placeholder="Pseudo"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input-message"
          placeholder="Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage} disabled={!connected}>
          Envoyer
        </button>
      </div>
    </div>
  )
}

export default App
