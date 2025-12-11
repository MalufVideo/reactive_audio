import React, { useState, useEffect, useRef } from 'react'
import { EFIFAMeter } from '../components/meters'

export const ViewerPage = () => {
  const [audioLevel, setAudioLevel] = useState(0)
  const [selectedDesign, setSelectedDesign] = useState('classic')
  const [isConnected, setIsConnected] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)
  
  const wsRef = useRef(null)
  const lastMessageTime = useRef(0)
  
  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = window.location.host.includes('localhost:5173') 
      ? 'ws://localhost:3001' 
      : `${protocol}//${window.location.host}`
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('Viewer: WebSocket connected')
        setIsConnected(true)
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'broadcast') {
            setAudioLevel(data.payload.level)
            setSelectedDesign(data.payload.design)
            lastMessageTime.current = Date.now()
            setIsReceiving(true)
          }
        } catch (e) {
          console.error('Viewer: Parse error:', e)
        }
      }
      
      wsRef.current.onclose = () => {
        console.log('Viewer: WebSocket disconnected')
        setIsConnected(false)
        setIsReceiving(false)
        setTimeout(connect, 2000)
      }
      
      wsRef.current.onerror = (err) => {
        console.error('Viewer: WebSocket error:', err)
      }
    }
    
    connect()
    
    // Check if we're still receiving data
    const checkReceiving = setInterval(() => {
      if (Date.now() - lastMessageTime.current > 1000) {
        setIsReceiving(false)
        setAudioLevel(0)
      }
    }, 500)
    
    return () => {
      clearInterval(checkReceiving)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])
  
  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      background: 'transparent'
    }}>
      {/* eFIFA Meter - full screen for OBS */}
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <EFIFAMeter level={audioLevel} design={selectedDesign} />
      </div>
      
      {/* Status indicator (only visible when not in OBS) */}
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        right: 20, 
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isReceiving ? '#22c55e' : (isConnected ? '#facc15' : '#ef4444')
        }} />
        <span style={{ color: 'white', fontSize: 12 }}>
          {isReceiving ? 'Receiving' : (isConnected ? 'Waiting for Admin' : 'Disconnected')}
        </span>
      </div>
      
      <style>{`
        html, body, #root { 
          margin: 0; 
          padding: 0; 
          background: transparent !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
