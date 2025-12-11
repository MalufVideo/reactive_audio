import React from 'react'

export const GradientMeter = ({ level }) => {
  const percentage = level * 100
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl w-96">
        <div className="text-center text-white mb-6 text-xl font-light tracking-widest">
          SPECTRUM
        </div>
        
        {/* Main gradient bar */}
        <div className="relative h-12 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div 
            className="absolute inset-y-0 left-0 transition-all duration-75 rounded-full"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, 
                #22c55e 0%, 
                #84cc16 30%, 
                #eab308 50%, 
                #f97316 70%, 
                #ef4444 90%, 
                #dc2626 100%)`,
              boxShadow: level > 0 ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none'
            }}
          />
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
        </div>
        
        {/* Tick marks */}
        <div className="flex justify-between mt-2 px-2">
          {[0, 25, 50, 75, 100].map(tick => (
            <div key={tick} className="flex flex-col items-center">
              <div className="w-px h-2 bg-gray-600" />
              <span className="text-xs text-gray-500 mt-1">{tick}%</span>
            </div>
          ))}
        </div>
        
        {/* Waveform visualization */}
        <div className="mt-6 flex items-end justify-center gap-1 h-24 bg-black/50 rounded-lg p-4">
          {Array.from({ length: 32 }, (_, i) => {
            const variation = Math.sin(i * 0.5 + Date.now() * 0.005) * 0.3 + 0.7
            const barLevel = level * variation
            const height = Math.max(4, barLevel * 80)
            
            return (
              <div 
                key={i}
                className="w-2 rounded-t transition-all duration-75"
                style={{
                  height: `${height}px`,
                  background: `linear-gradient(to top, 
                    ${barLevel > 0.8 ? '#ef4444' : barLevel > 0.5 ? '#eab308' : '#22c55e'},
                    ${barLevel > 0.8 ? '#fca5a5' : barLevel > 0.5 ? '#fde047' : '#86efac'})`,
                  boxShadow: barLevel > 0.3 ? `0 0 10px ${barLevel > 0.8 ? '#ef4444' : barLevel > 0.5 ? '#eab308' : '#22c55e'}` : 'none'
                }}
              />
            )
          })}
        </div>
        
        {/* Level display */}
        <div className="mt-4 text-center">
          <span className="text-4xl font-bold bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="mt-4 text-gray-400 text-sm">Gradient VU Meter</div>
    </div>
  )
}
