import React, { useState, useEffect, useRef } from 'react'
import { EFIFAMeter } from '../components/meters'

export const BroadcastPage = () => {
  const [audioLevel, setAudioLevel] = useState(0)
  const wsRef = useRef(null)
  
  useEffect(() => {
    const wsUrl = window.location.host.includes('localhost:5173') 
      ? 'ws://localhost:3001' 
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => console.log('Broadcast: WS connected')
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Broadcast: received', data.type, data.payload?.level)
          if (data.type === 'audio_level' && data.payload?.level !== undefined) {
            setAudioLevel(data.payload.level)
          }
        } catch (e) { console.error('Parse error:', e) }
      }
      
      wsRef.current.onclose = () => {
        setTimeout(connect, 2000)
      }
    }
    
    connect()
    
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [])
  
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <EFIFAMeter level={audioLevel} />
      <style>{`
        html, body, #root { 
          background: transparent !important; 
          margin: 0; 
          padding: 0; 
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
