# Reactive Audio VU Meter

Real-time audio visualization VU meter with multiple design options.

## Features

- **Multiple VU Meter Designs**: Analog, Digital, LED Bar, Gradient, Circular, eFIFA
- **Real-time Audio Capture**: Microphone input analysis
- **Broadcast Mode**: Separate broadcast page for OBS/streaming
- **WebSocket Sync**: Real-time sync between admin and broadcast pages
- **eFIFA Design**: Optimized 1376x1376 resolution, 16 stereo LED steps

## Setup

```bash
npm install
npm run dev:all
```

## Pages

- `/` - Main control page with audio capture
- `/admin` - Design selection and settings
- `/broadcast` - Clean broadcast output for OBS

## Architecture

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js WebSocket server
- **State**: Zustand with persistence

## Ports

- `5173` - Vite dev server (frontend)
- `3001` - WebSocket + HTTP server (backend)
