import React, { useEffect, useRef, useState } from 'react'
import { EFIFAMeter, designList } from '../components/meters'

export const MainPage = () => {
  const [audioLevel, setAudioLevel] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [sensitivity, setSensitivity] = useState(1.0)
  const [selectedDesign, setSelectedDesign] = useState('classic')
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationRef = useRef(null)
  const streamRef = useRef(null)
  
  const startListening = async () => {
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
        const level = Math.min((avg / 255) * sensitivity, 1)
        setAudioLevel(level)
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
        <h1 style={{ color: 'white', fontSize: 24, marginBottom: 30 }}>eFIFA VU Meter</h1>
        
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
            marginBottom: 30
          }}
        >
          {isListening ? '⏹ Stop Listening' : '▶ Start Listening'}
        </button>
        
        {/* Status */}
        <div style={{ 
          padding: 15, 
          background: isListening ? '#22c55e22' : '#333', 
          borderRadius: 8,
          marginBottom: 30,
          textAlign: 'center'
        }}>
          <div style={{ color: isListening ? '#22c55e' : '#666', fontSize: 14 }}>
            {isListening ? '● LIVE' : '○ Stopped'}
          </div>
          <div style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 5 }}>
            {(audioLevel * 100).toFixed(0)}%
          </div>
        </div>
        
        {/* Design Selector */}
        <div style={{ marginBottom: 30 }}>
          <label style={{ color: '#888', fontSize: 14, display: 'block', marginBottom: 10 }}>
            Design
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
        <div style={{ marginBottom: 30 }}>
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
        
        {/* Info */}
        <div style={{ color: '#666', fontSize: 12, lineHeight: 1.6 }}>
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
