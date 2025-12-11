import React, { useEffect, useRef } from 'react'

export const CircularMeter = ({ level }) => {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 30
    
    // Clear canvas
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, width, height)
    
    // Draw outer ring (background)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 20
    ctx.stroke()
    
    // Draw level arc
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (level * Math.PI * 2)
    
    // Create gradient for the arc
    const gradient = ctx.createConicGradient(startAngle, centerX, centerY)
    gradient.addColorStop(0, '#22c55e')
    gradient.addColorStop(0.5, '#eab308')
    gradient.addColorStop(0.8, '#f97316')
    gradient.addColorStop(1, '#ef4444')
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = gradient
    ctx.lineWidth = 20
    ctx.lineCap = 'round'
    ctx.stroke()
    
    // Draw inner decorative rings
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius - 35 - i * 15, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(100, 116, 139, ${0.1 + i * 0.1})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
    
    // Draw tick marks
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
      const innerRadius = radius - 40
      const outerRadius = radius - 30
      
      const x1 = centerX + Math.cos(angle) * innerRadius
      const y1 = centerY + Math.sin(angle) * innerRadius
      const x2 = centerX + Math.cos(angle) * outerRadius
      const y2 = centerY + Math.sin(angle) * outerRadius
      
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    
    // Draw center display
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 50, 0, Math.PI * 2)
    ctx.fillStyle = '#1e293b'
    ctx.fill()
    
    // Draw percentage text
    const percentage = (level * 100).toFixed(0)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${percentage}`, centerX, centerY - 10)
    
    ctx.fillStyle = '#94a3b8'
    ctx.font = '16px Arial'
    ctx.fillText('PERCENT', centerX, centerY + 25)
    
    // Draw dB value
    const db = level > 0 ? (20 * Math.log10(level)).toFixed(1) : '-∞'
    ctx.fillStyle = '#64748b'
    ctx.font = '14px Arial'
    ctx.fillText(`${db} dB`, centerX, centerY + 50)
    
    // Draw pulsing glow effect when high level
    if (level > 0.8) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + 5, startAngle, endAngle)
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + Math.sin(Date.now() * 0.01) * 0.2})`
      ctx.lineWidth = 30
      ctx.stroke()
    }
    
  }, [level])
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={350} 
          height={350}
          className="rounded-full shadow-2xl"
        />
        
        {/* Corner indicators */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${level > 0 ? 'bg-green-500' : 'bg-gray-700'}`} />
          <span className="text-xs text-gray-400">IN</span>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-xs text-gray-400">PEAK</span>
          <div className={`w-2 h-2 rounded-full ${level > 0.9 ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`} />
        </div>
      </div>
      <div className="mt-4 text-gray-400 text-sm">Circular VU Meter</div>
    </div>
  )
}
