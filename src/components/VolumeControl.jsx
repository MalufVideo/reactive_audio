import React from 'react'
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useStore } from '../store/useStore'

export const VolumeControl = () => {
  const { volumeMultiplier, setVolumeMultiplier } = useStore()
  
  const getVolumeIcon = () => {
    if (volumeMultiplier === 0) return <VolumeX className="w-6 h-6" />
    if (volumeMultiplier < 1) return <Volume className="w-6 h-6" />
    if (volumeMultiplier < 2) return <Volume1 className="w-6 h-6" />
    return <Volume2 className="w-6 h-6" />
  }
  
  const presets = [
    { label: '50%', value: 0.5 },
    { label: '100%', value: 1.0 },
    { label: '150%', value: 1.5 },
    { label: '200%', value: 2.0 },
    { label: '300%', value: 3.0 },
  ]
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-cyan-400">
          {getVolumeIcon()}
        </div>
        <h3 className="text-white font-semibold">Volume Gain</h3>
        <span className="ml-auto text-cyan-400 font-mono text-lg">
          {(volumeMultiplier * 100).toFixed(0)}%
        </span>
      </div>
      
      {/* Slider */}
      <div className="relative mb-4">
        <input
          type="range"
          min="0"
          max="4"
          step="0.1"
          value={volumeMultiplier}
          onChange={(e) => setVolumeMultiplier(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:bg-cyan-400
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:shadow-cyan-400/50
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <div 
          className="absolute top-0 left-0 h-2 bg-cyan-400 rounded-l-lg pointer-events-none"
          style={{ width: `${(volumeMultiplier / 4) * 100}%` }}
        />
      </div>
      
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setVolumeMultiplier(preset.value)}
            className={`px-3 py-1 rounded text-sm font-medium transition-all
              ${volumeMultiplier === preset.value 
                ? 'bg-cyan-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      
      <p className="text-gray-500 text-xs mt-4">
        Adjust the gain to amplify weak signals or reduce strong ones for better visualization.
      </p>
    </div>
  )
}
