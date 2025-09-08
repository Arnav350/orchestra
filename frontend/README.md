# Frontend - Voice Automation Mobile App

## Overview

React Native (Expo) mobile application that provides voice input functionality for task automation. Users can record audio, send it to the backend for speech-to-text processing, and receive transcribed results.

## Features

- **Push-to-talk audio recording** with visual feedback
- **Audio upload** to backend STT service
- **Real-time status updates** during recording and processing
- **Cross-platform support** (iOS, Android, Web)
- **Clean, intuitive UI** with recording button and status indicators

## Tech Stack

- **Framework**: React Native with Expo (~53.0.22)
- **Router**: Expo Router (~5.1.5) 
- **Audio**: Expo AV (~15.1.7) for recording
- **File System**: Expo File System (~18.1.11) for file management
- **UI**: React Native components with custom styling
- **TypeScript**: Full TypeScript support

## Project Structure

```
frontend/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab navigation layout
│   │   ├── index.tsx         # Main voice input screen
│   │   └── two.tsx           # Secondary screen
│   ├── _layout.tsx           # Root layout
│   ├── +html.tsx             # Web HTML template
│   ├── +not-found.tsx        # 404 page
│   └── modal.tsx             # Modal screen
├── components/
│   ├── AudioRecorder.tsx     # Main voice recording component
│   ├── Themed.tsx           # Theme-aware components
│   ├── StyledText.tsx       # Custom text components
│   ├── EditScreenInfo.tsx   # Demo component
│   └── ExternalLink.tsx     # External link component
├── services/
│   └── api.ts               # Backend API communication
├── constants/
│   └── Colors.ts            # App color scheme
├── assets/                  # Images, fonts, icons
└── app.json                # Expo configuration
```

## Setup & Installation

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Studio (for emulators)
- Physical device with Expo Go app (optional)

### Installation

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Start development server**:
```bash
npm start
```

3. **Run on specific platforms**:
```bash
npm run ios        # iOS simulator
npm run android    # Android emulator  
npm run web        # Web browser
```

## Key Components

### AudioRecorder Component

**Location**: `components/AudioRecorder.tsx`

**Features**:
- Press-and-hold recording interface
- Microphone permission handling
- Visual recording states (idle, recording, uploading)
- Audio file creation and cleanup
- Error handling with user alerts

**Usage**:
```typescript
<AudioRecorder 
  onAudioRecorded={(uri) => uploadAndProcess(uri)}
  isUploading={uploading}
/>
```

### API Service

**Location**: `services/api.ts`

**Functions**:
- `uploadAudioForSTT(audioUri: string)`: Uploads audio file to backend
- Returns transcribed text or error information
- Handles network errors and timeouts

## Backend Integration

The app connects to the Express.js backend running on `http://localhost:3000`.

**Configuration**: Update `API_BASE_URL` in `services/api.ts` for different environments.

**Endpoint**: `POST /stt`
- Accepts multipart/form-data with audio file
- Returns JSON: `{ "text": "transcribed speech" }`

## Development Workflow

1. **Start backend server** (see backend README)
2. **Start Expo dev server**: `npm start`
3. **Open on device/simulator**:
   - Scan QR code with Expo Go (physical device)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator
   - Press 'w' for web browser

4. **Live reload** automatically updates on code changes

## Testing the Voice Feature

1. **Grant microphone permission** when prompted
2. **Hold down the record button** to start recording
3. **Speak your message** (e.g., "schedule a team meeting tomorrow at 5pm")
4. **Release the button** to stop and upload
5. **View transcribed text** in the app

## Audio Specifications

- **Recording Format**: High quality (configurable)
- **Supported Formats**: M4A, MP3, WAV, etc.
- **Max File Size**: 25MB (backend limit)
- **Recording Mode**: Press-and-hold (push-to-talk)

## Platform-Specific Notes

### iOS
- Requires microphone permission
- Supports background audio recording
- Native audio quality optimization

### Android
- Edge-to-edge UI support
- Adaptive icon configuration
- Hardware back button handling

### Web
- Browser-based audio recording
- File upload via fetch API
- Responsive design

## Environment Configuration

### Development
- Backend: `http://localhost:3000`
- Expo dev server: `http://localhost:8081`
- Live reload enabled

### Production
- Update `API_BASE_URL` to production backend URL
- Build optimized bundles with `expo build`
- Deploy to app stores or web hosting

## Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device  
npm run web        # Run in web browser
npm test           # Run Jest tests
```

## Dependencies

### Core Dependencies
- `expo` - Expo SDK platform
- `react` / `react-native` - React Native framework
- `expo-router` - File-based routing
- `expo-av` - Audio recording and playback
- `expo-file-system` - File system operations

### UI & Navigation
- `@react-navigation/native` - Navigation library
- `react-native-safe-area-context` - Safe area handling
- `react-native-screens` - Native screen optimization

## Future Enhancements

This is **Step 1** of the voice automation system. Upcoming features:

- **Intent display**: Show parsed intents from backend
- **Workflow results**: Display automation results
- **Voice responses**: Play TTS audio responses
- **History**: Save and replay previous commands
- **Settings**: Configure backend URL, voice settings
- **Offline mode**: Local speech recognition

## Troubleshooting

### Common Issues

**Recording not working:**
- Check microphone permissions in device settings
- Ensure backend server is running
- Verify network connectivity

**Upload failures:**
- Confirm backend URL is correct and accessible
- Check backend logs for detailed error messages
- Verify audio file format compatibility

**Development server issues:**
- Clear Expo cache: `expo start -c`
- Restart development server
- Check for port conflicts

### Debug Tips

- Use Expo dev tools for debugging
- Check network requests in developer console
- Monitor backend server logs
- Test with physical device for audio features