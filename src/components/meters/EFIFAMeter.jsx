import React from 'react'

export const EFIFAMeter = ({ level, preview = false }) => {
  const ledCount = 16
  
  // Full size for broadcast, small preview for admin
  const scale = preview ? 0.15 : 1
  const ledHeight = 86 * scale
  const containerSize = 1376 * scale
  const barWidth = containerSize / 2
  
  return (
    <div 
      style={{ 
        position: preview ? 'relative' : 'absolute',
        top: preview ? undefined : 0,
        left: preview ? undefined : 0,
        width: containerSize, 
        height: containerSize,
        background: 'transparent',
        display: 'flex'
      }}
    >
      {/* Stereo LED bars - L and R channels */}
      {['L', 'R'].map((channel) => (
        <div 
          key={channel} 
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            width: barWidth,
            height: containerSize
          }}
        >
          {Array.from({ length: ledCount }, (_, i) => {
            const threshold = (i + 1) / ledCount
            const effectiveLevel = channel === 'L' ? level : level * 0.95
            const isActive = effectiveLevel >= threshold
            
            // Color zones: green (0-60%), yellow (60-80%), red (80-100%)
            let activeColor = '#22c55e' // green-500
            
            if (i >= ledCount * 0.6 && i < ledCount * 0.8) {
              activeColor = '#facc15' // yellow-400
            } else if (i >= ledCount * 0.8) {
              activeColor = '#ef4444' // red-500
            }
            
            return (
              <div 
                key={i}
                style={{
                  width: '100%',
                  height: ledHeight,
                  backgroundColor: isActive ? activeColor : '#1f2937',
                  transition: 'background-color 50ms'
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
