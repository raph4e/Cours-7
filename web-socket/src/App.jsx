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

    // quand le serveur accepte la connexion, on met connected à true
    ws.current.onopen = () => setConnected(true)

    // quand le serveur envoie des données, on les parse en JSON puis on ajoute le message à messages
    ws.current.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      setMessages((prev) => [...prev, msg])
    }

    // si la connexion WebSocket échoue, on affiche l'erreur et on met connected à false
    ws.current.onerror = (error) => {
      console.error('Erreur WebSocket :', error)
      setConnected(false)
    }

    // quand le serveur ferme la connexion, on met connected à false
    ws.current.onclose = () => setConnected(false)

    // nettoyage quand le composant est détruit
    return () => ws.current.close()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {

    // Vérifie que le pseudo et le message ne sont pas vides avant d'envoyer
    if (!input.trim() || !username.trim()) return

    // Crée un objet message avec le pseudo, le texte et l'heure actuelle
    const msg = {
      user: username,
      text: input,
      time: new Date().toLocaleTimeString(),
    }

    // Envoie le message au serveur WebSocket sous forme de chaîne JSON
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
