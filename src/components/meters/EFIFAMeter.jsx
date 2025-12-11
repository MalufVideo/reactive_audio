import React from 'react'

const classicColors = [
  '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e', 
  '#facc15', '#facc15', '#facc15', 
  '#ef4444', '#ef4444', '#ef4444'
]

const designs = {
  classic: {
    name: 'Classic',
    activeColors: classicColors,
    inactiveColor: '#1f2937',
    gap: 0,
    borderRadius: 0,
    width: '100%',
    glow: false
  },
  round: {
    name: 'Round Dots',
    activeColors: classicColors,
    inactiveColor: '#1f2937',
    gap: 12,
    borderRadius: '50%',
    width: '60%',
    glow: false
  },
  blocks: {
    name: 'Soft Blocks',
    activeColors: classicColors,
    inactiveColor: '#1f2937',
    gap: 4,
    borderRadius: 4,
    width: '90%',
    glow: false
  },
  pills: {
    name: 'Pills',
    activeColors: classicColors,
    inactiveColor: '#1f2937',
    gap: 6,
    borderRadius: 50,
    width: '80%',
    glow: false
  },
  lines: {
    name: 'Thin Lines',
    activeColors: classicColors,
    inactiveColor: '#1f2937',
    gap: 50,
    borderRadius: 2,
    width: '95%',
    glow: true
  },
  slim: {
    name: 'Slim Center',
    activeColors: classicColors,
    inactiveColor: '#1f2937',
    gap: 2,
    borderRadius: 0,
    width: '40%',
    glow: false
  },
  bricks: {
    name: 'Bricks',
    activeColors: classicColors,
    inactiveColor: '#1f2937',
    gap: 8,
    borderRadius: 1,
    width: '100%',
    glow: false
  }
}

export const designList = Object.keys(designs).map(key => ({ id: key, name: designs[key].name }))

export const EFIFAMeter = ({ level = 0, preview = false, design = 'classic' }) => {
  const ledCount = 16
  const scale = preview ? 0.15 : 1
  const containerSize = 1376 * scale
  const barWidth = containerSize / 2
  
  const currentDesign = designs[design] || designs.classic
  const gap = currentDesign.gap * scale

  return (
    <div style={{ 
      width: containerSize, 
      height: containerSize,
      display: 'flex',
      background: 'transparent'
    }}>
      {['L', 'R'].map((channel) => {
        const channelLevel = channel === 'L' ? level : level * 0.95
        return (
          <div key={channel} style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center',
            width: barWidth,
            height: containerSize,
            gap: gap
          }}>
            {Array.from({ length: ledCount }, (_, i) => {
              const threshold = (i + 1) / ledCount
              const isActive = channelLevel >= threshold
              const activeColor = currentDesign.activeColors[i] || '#22c55e'
              
              return (
                <div key={i} style={{
                  width: currentDesign.width || '100%',
                  flex: 1,
                  backgroundColor: isActive ? activeColor : currentDesign.inactiveColor,
                  borderRadius: currentDesign.borderRadius,
                  boxShadow: isActive && currentDesign.glow ? `0 0 ${10 * scale}px ${activeColor}` : 'none',
                  transition: 'background-color 0.05s ease'
                }} />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
