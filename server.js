import { WebSocketServer } from 'ws'
import http from 'http'

const PORT = process.env.PORT || 3001

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('WebSocket Server')
})

const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  console.log('Client connected. Total:', wss.clients.size)
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      
      if (data.type === 'audio_level') {
        // Broadcast to ALL other clients
        let sentCount = 0
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(data))
            sentCount++
          }
        })
        if (sentCount > 0) console.log('Sent audio to', sentCount, 'clients')
      }
    } catch (err) {
      console.error('Parse error:', err)
    }
  })
  
  ws.on('close', () => {
    console.log('Client disconnected. Total:', wss.clients.size)
  })
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
