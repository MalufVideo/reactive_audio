import { WebSocketServer } from 'ws'
import http from 'http'

const PORT = 3001

// Store current settings
let currentSettings = {
  selectedDesign: 'analog',
  volumeMultiplier: 1.0,
  selectedDeviceId: 'default'
}

// Create HTTP server
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  if (req.url === '/settings' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(currentSettings))
    return
  }
  
  res.writeHead(404)
  res.end('Not Found')
})

// Create WebSocket server
const wss = new WebSocketServer({ server })

const broadcast = (data) => {
  const message = JSON.stringify(data)
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message)
    }
  })
}

wss.on('connection', (ws) => {
  console.log('Client connected')
  
  // Send current settings on connection
  ws.send(JSON.stringify({
    type: 'settings',
    payload: currentSettings
  }))
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      
      if (data.type === 'update_settings') {
        // Update stored settings
        currentSettings = { ...currentSettings, ...data.payload }
        console.log('Settings updated:', currentSettings)
        
        // Broadcast to all clients (including broadcast pages)
        broadcast({
          type: 'settings',
          payload: currentSettings
        })
      }
      
      if (data.type === 'audio_level') {
        // Broadcast audio level to all clients
        broadcast({
          type: 'audio_level',
          payload: data.payload
        })
      }
    } catch (err) {
      console.error('Error parsing message:', err)
    }
  })
  
  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`)
  console.log(`HTTP server running on http://localhost:${PORT}`)
})
