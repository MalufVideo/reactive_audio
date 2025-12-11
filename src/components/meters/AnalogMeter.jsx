import React, { useEffect, useRef } from 'react'

export const AnalogMeter = ({ level }) => {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height - 40
    const radius = Math.min(width, height) - 80
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)
    
    // Draw meter background
    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false)
    ctx.fillStyle = '#16213e'
    ctx.fill()
    ctx.strokeStyle = '#e94560'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.restore()
    
    // Draw scale markings
    const markings = ['-20', '-10', '-7', '-5', '-3', '0', '+3']
    markings.forEach((mark, i) => {
      const angle = Math.PI + (i / (markings.length - 1)) * Math.PI
      const x1 = centerX + Math.cos(angle) * (radius - 10)
      const y1 = centerY + Math.sin(angle) * (radius - 10)
      const x2 = centerX + Math.cos(angle) * (radius - 30)
      const y2 = centerY + Math.sin(angle) * (radius - 30)
      const textX = centerX + Math.cos(angle) * (radius - 50)
      const textY = centerY + Math.sin(angle) * (radius - 50)
      
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = i >= 5 ? '#e94560' : '#0f3460'
      ctx.lineWidth = 2
      ctx.stroke()
      
      ctx.fillStyle = i >= 5 ? '#e94560' : '#eee'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(mark, textX, textY)
    })
    
    // Draw colored zones
    const drawZone = (startRatio, endRatio, color) => {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius - 65, Math.PI + startRatio * Math.PI, Math.PI + endRatio * Math.PI, false)
      ctx.strokeStyle = color
      ctx.lineWidth = 8
      ctx.stroke()
    }
    
    drawZone(0, 0.7, '#4ade80')
    drawZone(0.7, 0.85, '#facc15')
    drawZone(0.85, 1, '#ef4444')
    
    // Draw needle
    const needleAngle = Math.PI + level * Math.PI
    const needleLength = radius - 70
    const needleX = centerX + Math.cos(needleAngle) * needleLength
    const needleY = centerY + Math.sin(needleAngle) * needleLength
    
    // Needle shadow
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 3
    
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(needleX, needleY)
    ctx.strokeStyle = '#e94560'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.restore()
    
    // Needle pivot
    ctx.beginPath()
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
    ctx.fillStyle = '#e94560'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // VU label
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('VU', centerX, centerY - radius / 2)
    
  }, [level])
  
  return (
    <div className="flex flex-col items-center">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={280}
        className="rounded-lg shadow-2xl border-2 border-gray-700"
      />
      <div className="mt-4 text-gray-400 text-sm">Analog VU Meter</div>
    </div>
  )
}
