import React from 'react'

export const DigitalMeter = ({ level }) => {
  const db = level > 0 ? (20 * Math.log10(level)).toFixed(1) : '-∞'
  const percentage = (level * 100).toFixed(0)
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 p-8 rounded-xl border-2 border-cyan-500 shadow-2xl shadow-cyan-500/20">
        {/* Digital display */}
        <div className="bg-black p-6 rounded-lg border border-gray-700 mb-6">
          <div className="font-mono text-6xl text-cyan-400 tracking-wider text-center" 
               style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.8)' }}>
            {db === '-∞' ? '-∞' : `${db}`}
            <span className="text-2xl ml-2">dB</span>
          </div>
          <div className="text-center text-gray-500 text-sm mt-2">
            {percentage}%
          </div>
        </div>
        
        {/* Segmented bar display */}
        <div className="flex gap-1 justify-center mb-4">
          {Array.from({ length: 20 }, (_, i) => {
            const threshold = (i + 1) / 20
            const isActive = level >= threshold
            let color = 'bg-gray-800'
            
            if (isActive) {
              if (i < 12) color = 'bg-green-500 shadow-green-500/50'
              else if (i < 16) color = 'bg-yellow-500 shadow-yellow-500/50'
              else color = 'bg-red-500 shadow-red-500/50'
            }
            
            return (
              <div 
                key={i}
                className={`w-4 h-16 rounded-sm transition-all duration-75 ${color} ${isActive ? 'shadow-lg' : ''}`}
              />
            )
          })}
        </div>
        
        {/* Scale */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>-60</span>
          <span>-40</span>
          <span>-20</span>
          <span>-10</span>
          <span>0</span>
        </div>
        
        {/* Peak indicator */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className={`w-4 h-4 rounded-full ${level > 0.9 ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`} />
          <span className="text-gray-400 text-sm">PEAK</span>
          <div className={`w-4 h-4 rounded-full ${level > 0 ? 'bg-green-500' : 'bg-gray-700'}`} />
          <span className="text-gray-400 text-sm">SIGNAL</span>
        </div>
      </div>
      <div className="mt-4 text-gray-400 text-sm">Digital VU Meter</div>
    </div>
  )
}
