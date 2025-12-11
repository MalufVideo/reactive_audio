import { WebSocketServer } from 'ws'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3001

// Admin lock state
let currentAdmin = null
let currentAdminId = null

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
  
  // API endpoint for admin status
  if (req.url === '/api/admin-status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ hasAdmin: currentAdmin !== null }))
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
  
  // Send current admin status to new client
  ws.send(JSON.stringify({
    type: 'admin_status',
    payload: { 
      hasAdmin: currentAdmin !== null,
      isYouAdmin: false
    }
  }))
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      
      // Handle admin claim request
      if (data.type === 'claim_admin') {
        if (currentAdmin === null) {
          currentAdmin = ws
          currentAdminId = clientId
          console.log(`Client ${clientId} is now the admin`)
          
          // Notify this client they are admin
          ws.send(JSON.stringify({
            type: 'admin_status',
            payload: { hasAdmin: true, isYouAdmin: true }
          }))
          
          // Notify all other clients
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'admin_status',
                payload: { hasAdmin: true, isYouAdmin: false }
              }))
            }
          })
        } else {
          // Admin already exists, deny
          ws.send(JSON.stringify({
            type: 'admin_status',
            payload: { hasAdmin: true, isYouAdmin: false }
          }))
        }
      }
      
      // Handle admin release
      if (data.type === 'release_admin') {
        if (currentAdmin === ws) {
          currentAdmin = null
          currentAdminId = null
          console.log(`Client ${clientId} released admin`)
          
          // Notify all clients
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'admin_status',
                payload: { hasAdmin: false, isYouAdmin: false }
              }))
            }
          })
        }
      }
      
      // Handle audio level - only from admin
      if (data.type === 'audio_level') {
        if (currentAdmin === ws) {
          // Broadcast to ALL clients (including admin for preview)
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify(data))
            }
          })
        }
      }
      
      // Handle design change - only from admin
      if (data.type === 'design_change') {
        if (currentAdmin === ws) {
          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify(data))
            }
          })
        }
      }
      
    } catch (err) {
      console.error('Parse error:', err)
    }
  })
  
  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected. Total: ${wss.clients.size}`)
    
    // If admin disconnects, release the lock
    if (currentAdmin === ws) {
      currentAdmin = null
      currentAdminId = null
      console.log('Admin disconnected, lock released')
      
      // Notify all remaining clients
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'admin_status',
            payload: { hasAdmin: false, isYouAdmin: false }
          }))
        }
      })
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
