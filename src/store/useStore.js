import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      // VU Meter design: 'analog', 'digital', 'led', 'gradient', 'circular', 'efifa'
      selectedDesign: 'analog',
      setSelectedDesign: (design) => set({ selectedDesign: design }),
      
      // Volume multiplier (1.0 = 100%, 2.0 = 200%, etc.)
      volumeMultiplier: 1.0,
      setVolumeMultiplier: (multiplier) => set({ volumeMultiplier: multiplier }),
      
      // Selected audio input device
      selectedDeviceId: 'default',
      setSelectedDeviceId: (deviceId) => set({ selectedDeviceId: deviceId }),
      
      // Available audio input devices
      audioDevices: [],
      setAudioDevices: (devices) => set({ audioDevices: devices }),
    }),
    {
      name: 'vu-meter-storage',
    }
  )
)
