import React, { useState, useEffect } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { 
  AnalogMeter, 
  DigitalMeter, 
  LEDMeter, 
  GradientMeter, 
  CircularMeter,
  EFIFAMeter
} from '../components/meters'

const meterComponents = {
  analog: AnalogMeter,
  digital: DigitalMeter,
  led: LEDMeter,
  gradient: GradientMeter,
  circular: CircularMeter,
  efifa: EFIFAMeter,
}

export const BroadcastPage = () => {
  const { lastMessage, isConnected } = useWebSocket()
  const [settings, setSettings] = useState({
    selectedDesign: 'analog',
    volumeMultiplier: 1.0
  })
  const [audioLevel, setAudioLevel] = useState(0)
  
  // Fetch initial settings from server on mount
  useEffect(() => {
    fetch('http://localhost:3001/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }))
      })
      .catch(err => console.log('Could not fetch initial settings:', err))
  }, [])
  
  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return
    
    console.log('Broadcast: Received message:', lastMessage)
    
    if (lastMessage.type === 'settings') {
      console.log('Broadcast: Updating settings to:', lastMessage.payload)
      setSettings(prev => ({ ...prev, ...lastMessage.payload }))
    }
    
    if (lastMessage.type === 'audio_level') {
      // Apply volume multiplier from settings
      const adjustedLevel = Math.min(lastMessage.payload.level * settings.volumeMultiplier, 1)
      setAudioLevel(adjustedLevel)
    }
  }, [lastMessage, settings.volumeMultiplier])
  
  const MeterComponent = meterComponents[settings.selectedDesign] || AnalogMeter
  const isEfifa = settings.selectedDesign === 'efifa'
  
  return (
    <div 
      style={{ 
        backgroundColor: 'transparent',
        position: isEfifa ? 'relative' : 'static',
        width: isEfifa ? 1376 : '100%',
        height: isEfifa ? 1376 : '100vh',
        minHeight: isEfifa ? 'auto' : '100vh',
        display: isEfifa ? 'block' : 'flex',
        alignItems: isEfifa ? undefined : 'center',
        justifyContent: isEfifa ? undefined : 'center'
      }}
    >
      {/* Connection indicator - only visible if disconnected */}
      {!isConnected && (
        <div className="fixed top-4 left-4 px-3 py-1 bg-red-500/80 text-white text-sm rounded-full animate-pulse">
          Disconnected - Reconnecting...
        </div>
      )}
      
      {/* VU Meter only */}
      <div className="vu-meter-container">
        <MeterComponent level={audioLevel} />
      </div>
      
      {/* Inline styles for transparent background */}
      <style>{`
        html, body, #root {
          background: transparent !important;
          margin: 0;
          padding: 0;
          overflow: ${isEfifa ? 'hidden' : 'auto'};
        }
        .vu-meter-container > div {
          background: transparent !important;
        }
        .vu-meter-container > div > div:last-child {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
