import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Mic, MicOff, AlertCircle, Radio } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer'
import { useWebSocket } from '../hooks/useWebSocket'
import { VolumeControl } from '../components/VolumeControl'
import { DeviceSelector } from '../components/DeviceSelector'
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

export const MainPage = () => {
  const { selectedDesign, volumeMultiplier, selectedDeviceId } = useStore()
  const { 
    audioLevel, 
    isListening, 
    error, 
    startListening, 
    stopListening,
    refreshDevices 
  } = useAudioAnalyzer()
  
  const { sendAudioLevel, updateSettings, isConnected } = useWebSocket()
  
  // Send audio level to broadcast page
  useEffect(() => {
    if (isListening && audioLevel !== undefined) {
      sendAudioLevel(audioLevel)
    }
  }, [audioLevel, isListening, sendAudioLevel])
  
  // Sync settings to server when they change
  useEffect(() => {
    updateSettings({ selectedDesign, volumeMultiplier, selectedDeviceId })
  }, [selectedDesign, volumeMultiplier, selectedDeviceId, updateSettings])
  
  const MeterComponent = meterComponents[selectedDesign] || AnalogMeter
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">VU Meter</h1>
              <p className="text-xs text-gray-400">Real-time Audio Visualizer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/broadcast"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
            >
              <Radio className="w-5 h-5" />
              <span>Broadcast</span>
            </Link>
            <Link 
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Admin</span>
            </Link>
            {/* Server connection status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-xs">{isConnected ? 'Server' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main meter display */}
          <div className="lg:col-span-2 flex flex-col items-center">
            {/* Start/Stop button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`mb-8 flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-6 h-6" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  Start Listening
                </>
              )}
            </button>
            
            {/* VU Meter */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <MeterComponent level={audioLevel} preview={true} />
            </div>
            
            {/* Status */}
            <div className="mt-6 flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-gray-400">
                {isListening ? 'Listening to microphone...' : 'Click Start to begin'}
              </span>
            </div>
            
            {/* Current design badge */}
            <div className="mt-4 px-4 py-2 bg-gray-800 rounded-full border border-gray-700">
              <span className="text-gray-400 text-sm">Current Design: </span>
              <span className="text-cyan-400 font-medium capitalize">{selectedDesign}</span>
            </div>
          </div>
          
          {/* Controls sidebar */}
          <div className="space-y-6">
            <VolumeControl />
            <DeviceSelector onRefresh={refreshDevices} />
            
            {/* Quick design switcher */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Quick Design Switch</h3>
              <p className="text-gray-400 text-sm mb-4">
                Go to the <Link to="/admin" className="text-cyan-400 hover:underline">Admin page</Link> to 
                select from 5 different VU meter designs.
              </p>
              <Link
                to="/admin"
                className="block w-full py-3 text-center bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
              >
                Change Design
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
