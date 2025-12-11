import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'

export const useAudioAnalyzer = () => {
  const [audioLevel, setAudioLevel] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  
  const { selectedDeviceId, volumeMultiplier, setAudioDevices } = useStore()
  
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const streamRef = useRef(null)
  const animationFrameRef = useRef(null)
  
  // Get available audio input devices
  const refreshDevices = useCallback(async () => {
    try {
      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true })
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(device => device.kind === 'audioinput')
      setAudioDevices(audioInputs)
    } catch (err) {
      console.error('Error enumerating devices:', err)
      setError('Unable to access audio devices')
    }
  }, [setAudioDevices])
  
  // Analyze audio levels
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // Calculate RMS (Root Mean Square) for better VU meter response
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)
    
    // Normalize to 0-1 range and apply volume multiplier
    const normalizedLevel = Math.min((rms / 128) * volumeMultiplier, 1)
    
    setAudioLevel(normalizedLevel)
    animationFrameRef.current = requestAnimationFrame(analyzeAudio)
  }, [volumeMultiplier])
  
  // Start listening to microphone
  const startListening = useCallback(async () => {
    try {
      setError(null)
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      const constraints = {
        audio: {
          deviceId: selectedDeviceId !== 'default' ? { exact: selectedDeviceId } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current.connect(analyserRef.current)
      
      setIsListening(true)
      analyzeAudio()
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Unable to access microphone. Please check permissions.')
      setIsListening(false)
    }
  }, [selectedDeviceId, analyzeAudio])
  
  // Stop listening
  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
    }
    
    setIsListening(false)
    setAudioLevel(0)
  }, [])
  
  // Refresh devices on mount
  useEffect(() => {
    refreshDevices()
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices)
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refreshDevices)
      stopListening()
    }
  }, [refreshDevices, stopListening])
  
  // Restart when device changes
  useEffect(() => {
    if (isListening) {
      startListening()
    }
  }, [selectedDeviceId])
  
  return {
    audioLevel,
    isListening,
    error,
    startListening,
    stopListening,
    refreshDevices
  }
}
