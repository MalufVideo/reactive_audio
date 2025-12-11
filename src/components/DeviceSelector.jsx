import React from 'react'
import { Mic, RefreshCw, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

export const DeviceSelector = ({ onRefresh }) => {
  const { audioDevices, selectedDeviceId, setSelectedDeviceId } = useStore()
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Mic className="w-6 h-6 text-green-400" />
          <h3 className="text-white font-semibold">Audio Input</h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          title="Refresh devices"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {/* Device list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {audioDevices.length === 0 ? (
          <div className="text-gray-500 text-sm py-4 text-center">
            No audio devices found. Click refresh or grant microphone permissions.
          </div>
        ) : (
          <>
            {/* Default option */}
            <button
              onClick={() => setSelectedDeviceId('default')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                ${selectedDeviceId === 'default' 
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${selectedDeviceId === 'default' ? 'border-green-400' : 'border-gray-500'}`}>
                {selectedDeviceId === 'default' && <Check className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">System Default</div>
                <div className="text-xs text-gray-500">Use system's default audio input</div>
              </div>
            </button>
            
            {/* Device options */}
            {audioDevices.map((device) => (
              <button
                key={device.deviceId}
                onClick={() => setSelectedDeviceId(device.deviceId)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                  ${selectedDeviceId === device.deviceId 
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedDeviceId === device.deviceId ? 'border-green-400' : 'border-gray-500'}`}>
                  {selectedDeviceId === device.deviceId && <Check className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {device.label || `Microphone ${device.deviceId.slice(0, 8)}...`}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {device.deviceId.slice(0, 20)}...
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
      
      <p className="text-gray-500 text-xs mt-4">
        Select the audio input device to use for the VU meter.
      </p>
    </div>
  )
}
