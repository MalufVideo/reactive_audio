import React, { useState, useEffect, useRef } from 'react'
import { EFIFAMeter, designList } from '../components/meters'

export const AdminPage = () => {
  const [audioLevel, setAudioLevel] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [sensitivity, setSensitivity] = useState(1.5)
  const [selectedDesign, setSelectedDesign] = useState('classic')
  const [isConnected, setIsConnected] = useState(false)
  const [audioDevices, setAudioDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState('')
  
  const wsRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationRef = useRef(null)
  const streamRef = useRef(null)
  const sensitivityRef = useRef(sensitivity)
  
  useEffect(() => {
    sensitivityRef.current = sensitivity
  }, [sensitivity])
  
  // Get available audio devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter(d => d.kind === 'audioinput')
        setAudioDevices(audioInputs)
        if (audioInputs.length > 0 && !selectedDevice) {
          setSelectedDevice(audioInputs[0].deviceId)
        }
      } catch (err) {
        console.error('Error getting devices:', err)
      }
    }
    getDevices()
  }, [])
  
  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = window.location.host.includes('localhost:5173') 
      ? 'ws://localhost:3001' 
      : `${protocol}//${window.location.host}`
    
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('Admin: WebSocket connected')
        setIsConnected(true)
      }
      
      wsRef.current.onclose = () => {
        console.log('Admin: WebSocket disconnected')
        setIsConnected(false)
        setTimeout(connect, 2000)
      }
      
      wsRef.current.onerror = (err) => {
        console.error('Admin: WebSocket error:', err)
      }
    }
    
    connect()
    
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [])
  
  // Send audio level and design via WebSocket
  const sendData = (level) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ 
        type: 'broadcast', 
        payload: { level, design: selectedDesign } 
      }))
    }
  }
  
  const startListening = async () => {
    try {
      const constraints = {
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
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
        sendData(level)
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
    setIsListening(false)
    setAudioLevel(0)
  }
  
  // Send design change when it changes while listening
  useEffect(() => {
    if (isListening && wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ 
        type: 'broadcast', 
        payload: { level: audioLevel, design: selectedDesign } 
      }))
    }
  }, [selectedDesign])
  
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
      {/* eFIFA Meter Preview */}
      <div style={{ position: 'absolute', top: 0, left: 0, background: '#111' }}>
        <EFIFAMeter level={audioLevel} design={selectedDesign} />
      </div>
      
      {/* Admin Controls */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 1500, 
        width: 400, 
        height: '100vh',
        background: '#1a1a1a',
        padding: 30,
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}>
        <h1 style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>🎛️ ADMIN</h1>
        <p style={{ color: '#888', fontSize: 12, marginBottom: 20 }}>
          Audio Broadcaster
        </p>
        
        {/* Connection Status */}
        <div style={{ 
          padding: 10, 
          background: isConnected ? '#22c55e22' : '#ef444422', 
          borderRadius: 8,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <span style={{ color: isConnected ? '#22c55e' : '#ef4444', fontSize: 14 }}>
            {isConnected ? '● Server Connected' : '○ Server Disconnected'}
          </span>
        </div>
        
        {/* Audio Device Selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#888', fontSize: 14, display: 'block', marginBottom: 10 }}>
            Audio Input Device
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            disabled={isListening}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 14,
              background: '#333',
              color: 'white',
              border: '1px solid #444',
              borderRadius: 8,
              cursor: isListening ? 'not-allowed' : 'pointer',
              opacity: isListening ? 0.6 : 1
            }}
          >
            {audioDevices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Start/Stop Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            width: '100%',
            padding: '20px',
            fontSize: 18,
            fontWeight: 'bold',
            background: isListening ? '#ef4444' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            marginBottom: 20
          }}
        >
          {isListening ? '⏹ STOP BROADCASTING' : '▶ START BROADCASTING'}
        </button>
        
        {/* Status */}
        <div style={{ 
          padding: 15, 
          background: isListening ? '#22c55e22' : '#333', 
          borderRadius: 8,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <div style={{ color: isListening ? '#22c55e' : '#666', fontSize: 14 }}>
            {isListening ? '● LIVE BROADCASTING' : '○ Stopped'}
          </div>
          <div style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 5 }}>
            {(audioLevel * 100).toFixed(0)}%
          </div>
        </div>
        
        {/* Design Selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#888', fontSize: 14, display: 'block', marginBottom: 10 }}>
            LED Design
          </label>
          <select
            value={selectedDesign}
            onChange={(e) => setSelectedDesign(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 16,
              background: '#333',
              color: 'white',
              border: '1px solid #444',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            {designList.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        
        {/* Sensitivity Control */}
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
        
        {/* Viewer URL */}
        <div style={{ 
          padding: 15, 
          background: '#3b82f622', 
          border: '1px solid #3b82f6',
          borderRadius: 8,
          marginBottom: 20
        }}>
          <div style={{ color: '#3b82f6', fontSize: 12, marginBottom: 5 }}>
            📺 VIEWER URL (for OBS):
          </div>
          <div style={{ color: 'white', fontSize: 14, wordBreak: 'break-all' }}>
            {window.location.origin}/
          </div>
        </div>
        
        {/* Info */}
        <div style={{ color: '#666', fontSize: 12, lineHeight: 1.6 }}>
          <p><strong>For OBS:</strong></p>
          <p>• Add Browser Source with viewer URL</p>
          <p>• Set size to 1376×1376</p>
          <p>• Position at 0,0</p>
        </div>
      </div>
      
      <style>{`
        html, body, #root { 
          margin: 0; 
          padding: 0; 
          background: #000 !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
