import { WebSocketServer } from 'ws'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3001

// Store current settings
let currentSettings = {
  selectedDesign: 'analog',
  volumeMultiplier: 1.0,
  selectedDeviceId: 'default'
}

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
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
  
  // API endpoint for settings
  if (req.url === '/api/settings' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(currentSettings))
    return
  }
  
  // Legacy settings endpoint
  if (req.url === '/settings' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(currentSettings))
    return
  }
  
  // Serve static files from dist folder
  const distPath = path.join(__dirname, 'dist')
  let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url)
  
  // Handle SPA routing - serve index.html for all non-file routes
  const ext = path.extname(filePath)
  if (!ext || !fs.existsSync(filePath)) {
    filePath = path.join(distPath, 'index.html')
  }
  
  if (fs.existsSync(filePath)) {
    const fileExt = path.extname(filePath)
    const contentType = mimeTypes[fileExt] || 'application/octet-stream'
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500)
        res.end('Server Error')
        return
      }
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content)
    })
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
