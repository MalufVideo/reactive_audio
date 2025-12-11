import React from 'react'

export const LEDMeter = ({ level }) => {
  const ledCount = 30
  
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-700 shadow-2xl">
        <div className="text-center text-gray-300 mb-4 text-xl font-bold tracking-wider">
          LED VU METER
        </div>
        
        {/* Stereo LED bars (simulated as dual mono for visual effect) */}
        <div className="flex gap-8">
          {['L', 'R'].map((channel) => (
            <div key={channel} className="flex flex-col items-center">
              <div className="text-gray-400 text-sm mb-2">{channel}</div>
              <div className="flex flex-col-reverse gap-1 bg-black p-3 rounded-lg">
                {Array.from({ length: ledCount }, (_, i) => {
                  const threshold = (i + 1) / ledCount
                  const effectiveLevel = channel === 'L' ? level : level * 0.95 // Slight variation
                  const isActive = effectiveLevel >= threshold
                  
                  let baseColor = 'bg-gray-800'
                  let activeColor = 'bg-green-500'
                  let glowColor = 'shadow-green-500/60'
                  
                  if (i >= ledCount * 0.6 && i < ledCount * 0.8) {
                    activeColor = 'bg-yellow-400'
                    glowColor = 'shadow-yellow-400/60'
                  } else if (i >= ledCount * 0.8) {
                    activeColor = 'bg-red-500'
                    glowColor = 'shadow-red-500/60'
                  }
                  
                  return (
                    <div 
                      key={i}
                      className={`w-8 h-2 rounded-sm transition-all duration-50 ${
                        isActive 
                          ? `${activeColor} shadow-lg ${glowColor}` 
                          : baseColor
                      }`}
                      style={{
                        boxShadow: isActive ? `0 0 8px currentColor` : 'none'
                      }}
                    />
                  )
                })}
              </div>
              
              {/* dB scale */}
              <div className="flex flex-col justify-between h-full text-xs text-gray-500 mt-2">
                <span>+6</span>
                <span>0</span>
                <span>-6</span>
                <span>-12</span>
                <span>-24</span>
                <span>-∞</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom indicators */}
        <div className="flex justify-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${level > 0.85 ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`} />
            <span className="text-xs text-gray-400">CLIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${level > 0 ? 'bg-green-500' : 'bg-gray-700'}`} />
            <span className="text-xs text-gray-400">SIG</span>
          </div>
        </div>
      </div>
      <div className="mt-4 text-gray-400 text-sm">LED Bar VU Meter</div>
    </div>
  )
}
