import { WebSocketServer } from 'ws'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3001

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  // Serve static files from dist folder
  const distPath = path.join(__dirname, 'dist')
  let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url)
  
  // Handle SPA routing - serve index.html for non-file routes
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

const wss = new WebSocketServer({ server })

// Generate unique client ID
const generateId = () => Math.random().toString(36).substring(2, 15)

wss.on('connection', (ws) => {
  const clientId = generateId()
  ws.clientId = clientId
  
  console.log(`Client ${clientId} connected. Total: ${wss.clients.size}`)
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      
      // Handle broadcast from admin - sends audio level and design to all viewers
      if (data.type === 'broadcast') {
        // Broadcast to ALL other clients (viewers)
        let sentCount = 0
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(data))
            sentCount++
          }
        })
        if (sentCount > 0) {
          console.log(`Broadcast to ${sentCount} viewers - level: ${(data.payload.level * 100).toFixed(0)}%`)
        }
      }
      
    } catch (err) {
      console.error('Parse error:', err)
    }
  })
  
  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected. Total: ${wss.clients.size}`)
  })
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
