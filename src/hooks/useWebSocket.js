import { useEffect, useRef, useCallback, useState } from 'react'

// Use relative WebSocket URL in production, localhost in development
const getWsUrl = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    // In production, WebSocket is on same host. In dev, use localhost:3001
    if (host.includes('localhost:5173')) {
      return 'ws://localhost:3001'
    }
    return `${protocol}//${host}`
  }
  return 'ws://localhost:3001'
}

const WS_URL = getWsUrl()

export const useWebSocket = () => {
  const wsRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const reconnectTimeoutRef = useRef(null)
  
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    
    try {
      wsRef.current = new WebSocket(WS_URL)
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket raw message received:', data.type)
          setLastMessage(data)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        
        // Attempt reconnect after 2 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 2000)
      }
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (err) {
      console.error('Failed to connect:', err)
    }
  }, [])
  
  const sendMessage = useCallback((type, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Sending message:', type, payload)
      wsRef.current.send(JSON.stringify({ type, payload }))
    } else {
      console.log('WebSocket: Cannot send, not connected. ReadyState:', wsRef.current?.readyState)
    }
  }, [])
  
  const updateSettings = useCallback((settings) => {
    sendMessage('update_settings', settings)
  }, [sendMessage])
  
  const sendAudioLevel = useCallback((level) => {
    sendMessage('audio_level', { level })
  }, [sendMessage])
  
  useEffect(() => {
    connect()
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    updateSettings,
    sendAudioLevel
  }
}
