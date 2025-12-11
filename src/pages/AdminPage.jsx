import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Gauge, Monitor, BarChart3, Palette, Circle, Radio, Wifi, WifiOff, Tv2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { 
  AnalogMeter, 
  DigitalMeter, 
  LEDMeter, 
  GradientMeter, 
  CircularMeter,
  EFIFAMeter
} from '../components/meters'

const designs = [
  {
    id: 'analog',
    name: 'Analog',
    description: 'Classic analog VU meter with needle and scale markings. Reminiscent of vintage audio equipment.',
    icon: Gauge,
    component: AnalogMeter,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'digital',
    name: 'Digital',
    description: 'Modern digital display with dB readout and segmented bar. Clean and precise.',
    icon: Monitor,
    component: DigitalMeter,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'led',
    name: 'LED Bar',
    description: 'Professional LED bar meter with stereo visualization. Studio-grade appearance.',
    icon: BarChart3,
    component: LEDMeter,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Smooth gradient visualization with spectrum analyzer. Modern and colorful.',
    icon: Palette,
    component: GradientMeter,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'circular',
    name: 'Circular',
    description: 'Circular gauge with radial progress. Sleek and contemporary design.',
    icon: Circle,
    component: CircularMeter,
    color: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'efifa',
    name: 'eFIFA',
    description: 'LED bar meter optimized for 1376x1376 resolution. 16 stereo steps, borderless design.',
    icon: Tv2,
    component: EFIFAMeter,
    color: 'from-lime-500 to-green-500',
  },
]

export const AdminPage = () => {
  const { selectedDesign, setSelectedDesign, volumeMultiplier, selectedDeviceId } = useStore()
  const { updateSettings, isConnected } = useWebSocket()
  const [previewLevel, setPreviewLevel] = useState(0)
  const [hoveredDesign, setHoveredDesign] = useState(null)
  
  // Sync settings to server on mount and when connected
  useEffect(() => {
    if (isConnected) {
      updateSettings({ selectedDesign, volumeMultiplier, selectedDeviceId })
    }
  }, [isConnected])
  
  // Broadcast settings to server when design changes
  const handleDesignSelect = (designId) => {
    console.log('Admin: Selecting design:', designId, 'WebSocket connected:', isConnected)
    setSelectedDesign(designId)
    updateSettings({ selectedDesign: designId, volumeMultiplier, selectedDeviceId })
  }
  
  // Animate preview level
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewLevel(prev => {
        const delta = (Math.random() - 0.5) * 0.3
        return Math.max(0.1, Math.min(0.9, prev + delta))
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])
  
  const activeDesign = designs.find(d => d.id === (hoveredDesign || selectedDesign))
  const PreviewComponent = activeDesign?.component || AnalogMeter
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Admin - Design Selection</h1>
              <p className="text-xs text-gray-400">Choose your preferred VU meter style</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/broadcast"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
            >
              <Radio className="w-5 h-5" />
              <span>Open Broadcast</span>
            </Link>
            {/* Server connection status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-xs">{isConnected ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Design selection */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Available Designs</h2>
            <div className="space-y-4">
              {designs.map((design) => {
                const Icon = design.icon
                const isSelected = selectedDesign === design.id
                
                return (
                  <button
                    key={design.id}
                    onClick={() => handleDesignSelect(design.id)}
                    onMouseEnter={() => setHoveredDesign(design.id)}
                    onMouseLeave={() => setHoveredDesign(null)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${
                      isSelected 
                        ? 'bg-gray-800 border-cyan-500 shadow-lg shadow-cyan-500/20' 
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${design.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{design.name}</h3>
                          {isSelected && (
                            <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{design.description}</p>
                      </div>
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-600'
                      }`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            
            {/* Info box */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-blue-400 font-medium mb-2">💡 Tip</h4>
              <p className="text-gray-400 text-sm">
                Hover over any design to preview it on the right. Click to select it as your active meter style.
                Your selection is saved automatically.
              </p>
            </div>
          </div>
          
          {/* Live preview */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Live Preview</h2>
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 min-h-[400px] flex flex-col items-center justify-center">
              <PreviewComponent level={previewLevel} preview={true} />
              
              <div className="mt-6 text-center">
                <div className="text-gray-400 text-sm">
                  Previewing: <span className="text-white font-medium capitalize">{activeDesign?.name}</span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  (Simulated audio level)
                </div>
              </div>
            </div>
            
            {/* Preview level slider */}
            <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Manual Preview Level</span>
                <span className="text-cyan-400 font-mono">{(previewLevel * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={previewLevel}
                onChange={(e) => setPreviewLevel(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-4
                           [&::-webkit-slider-thumb]:h-4
                           [&::-webkit-slider-thumb]:bg-cyan-400
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
