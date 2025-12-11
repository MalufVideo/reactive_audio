import React, { useEffect, useRef, useState } from 'react'
import { EFIFAMeter, designList } from '../components/meters'

export const MainPage = () => {
  const [audioLevel, setAudioLevel] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [sensitivity, setSensitivity] = useState(1.0)
  const [selectedDesign, setSelectedDesign] = useState('classic')
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasAdmin, setHasAdmin] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  
  const wsRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationRef = useRef(null)
  const streamRef = useRef(null)
  const sensitivityRef = useRef(sensitivity)
  const isAdminRef = useRef(false)
  
  // Keep refs updated
  useEffect(() => {
    sensitivityRef.current = sensitivity
  }, [sensitivity])
  
  useEffect(() => {
    isAdminRef.current = isAdmin
  }, [isAdmin])
  
  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = window.location.host.includes('localhost:5173') 
      ? 'ws://localhost:3001' 
      : `${protocol}//${window.location.host}`
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'admin_status') {
            setHasAdmin(data.payload.hasAdmin)
            setIsAdmin(data.payload.isYouAdmin)
          }
          
          if (data.type === 'audio_level') {
            setAudioLevel(data.payload.level)
          }
          
          if (data.type === 'design_change') {
            setSelectedDesign(data.payload.design)
          }
        } catch (e) {
          console.error('Parse error:', e)
        }
      }
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        setIsAdmin(false)
        setTimeout(connect, 2000)
      }
    }
    
    connect()
    
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [])
  
  // Send audio level via WebSocket when listening
  const sendAudioLevel = (level) => {
    if (wsRef.current?.readyState === 1 && isAdminRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'audio_level', payload: { level } }))
    }
  }
  
  // Send design change via WebSocket
  const handleDesignChange = (design) => {
    setSelectedDesign(design)
    if (wsRef.current?.readyState === 1 && isAdmin) {
      wsRef.current.send(JSON.stringify({ type: 'design_change', payload: { design } }))
    }
  }
  
  const startListening = async () => {
    // First, claim admin
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'claim_admin' }))
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      
      const updateLevel = () => {
        analyserRef.current.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        const level = Math.min((avg / 255) * sensitivityRef.current, 1)
        setAudioLevel(level)
        sendAudioLevel(level)
        animationRef.current = requestAnimationFrame(updateLevel)
      }
      
      updateLevel()
      setIsListening(true)
    } catch (err) {
      console.error('Mic error:', err)
      alert('Could not access microphone. Please allow microphone access.')
    }
  }
  
  const stopListening = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    if (audioContextRef.current) audioContextRef.current.close()
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    
    // Release admin
    if (wsRef.current?.readyState === 1 && isAdmin) {
      wsRef.current.send(JSON.stringify({ type: 'release_admin' }))
    }
    
    setIsListening(false)
    setAudioLevel(0)
  }
  
  useEffect(() => {
    return () => stopListening()
  }, [])
  
  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      margin: 0, 
      padding: 0, 
      overflow: 'hidden',
      background: '#000'
    }}>
      {/* eFIFA Meter at 0,0 - exactly 1376x1376 */}
      <div style={{ position: 'absolute', top: 0, left: 0, background: '#111' }}>
        <EFIFAMeter level={audioLevel} design={selectedDesign} />
      </div>
      
      {/* Controls panel - starts at x=1500 */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 1500, 
        width: 400, 
        height: '100vh',
        background: '#1a1a1a',
        padding: 30,
        boxSizing: 'border-box'
      }}>
        <h1 style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>eFIFA VU Meter</h1>
        
        {/* Connection Status */}
        <div style={{ 
          padding: 8, 
          background: isConnected ? '#22c55e22' : '#ef444422', 
          borderRadius: 6,
          marginBottom: 20,
          textAlign: 'center',
          fontSize: 12
        }}>
          <span style={{ color: isConnected ? '#22c55e' : '#ef4444' }}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>
        
        {/* Role Badge */}
        <div style={{ 
          padding: 10, 
          background: isAdmin ? '#3b82f622' : (hasAdmin ? '#f9731622' : '#33333366'), 
          border: `1px solid ${isAdmin ? '#3b82f6' : (hasAdmin ? '#f97316' : '#444')}`,
          borderRadius: 8,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <div style={{ color: isAdmin ? '#3b82f6' : (hasAdmin ? '#f97316' : '#888'), fontSize: 14, fontWeight: 'bold' }}>
            {isAdmin ? '👑 ADMIN (Broadcasting)' : (hasAdmin ? '👁 VIEWER MODE' : '○ No Admin Active')}
          </div>
          {!isAdmin && hasAdmin && (
            <div style={{ color: '#888', fontSize: 11, marginTop: 5 }}>
              Another user is broadcasting audio
            </div>
          )}
        </div>
        
        {/* Start/Stop Button - Only show if no admin or you are admin */}
        {(!hasAdmin || isAdmin) && (
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={hasAdmin && !isAdmin}
            style={{
              width: '100%',
              padding: '20px',
              fontSize: 18,
              fontWeight: 'bold',
              background: isListening ? '#ef4444' : '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: (hasAdmin && !isAdmin) ? 'not-allowed' : 'pointer',
              marginBottom: 20,
              opacity: (hasAdmin && !isAdmin) ? 0.5 : 1
            }}
          >
            {isListening ? '⏹ Stop Listening' : '▶ Start Listening'}
          </button>
        )}
        
        {/* Status */}
        <div style={{ 
          padding: 15, 
          background: isListening || hasAdmin ? '#22c55e22' : '#333', 
          borderRadius: 8,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <div style={{ color: (isListening || hasAdmin) ? '#22c55e' : '#666', fontSize: 14 }}>
            {isAdmin ? '● BROADCASTING' : (hasAdmin ? '● RECEIVING' : '○ Stopped')}
          </div>
          <div style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 5 }}>
            {(audioLevel * 100).toFixed(0)}%
          </div>
        </div>
        
        {/* Design Selector - Admin only can change, viewers see current */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#888', fontSize: 14, display: 'block', marginBottom: 10 }}>
            Design {!isAdmin && hasAdmin && '(controlled by admin)'}
          </label>
          <select
            value={selectedDesign}
            onChange={(e) => handleDesignChange(e.target.value)}
            disabled={!isAdmin && hasAdmin}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 16,
              background: '#333',
              color: 'white',
              border: '1px solid #444',
              borderRadius: 8,
              cursor: (!isAdmin && hasAdmin) ? 'not-allowed' : 'pointer',
              opacity: (!isAdmin && hasAdmin) ? 0.7 : 1
            }}
          >
            {designList.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        
        {/* Sensitivity Control - Admin only */}
        {isAdmin && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: '#888', fontSize: 14, display: 'block', marginBottom: 10 }}>
              Sensitivity: {sensitivity.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        )}
        
        {/* Info */}
        <div style={{ color: '#666', fontSize: 12, lineHeight: 1.6, marginTop: 20 }}>
          <p><strong>For OBS:</strong></p>
          <p>Add Browser Source with this URL</p>
          <p>Set size to 1376×1376</p>
          <p>Position at 0,0</p>
        </div>
      </div>
      
      {/* Transparent background styles */}
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
