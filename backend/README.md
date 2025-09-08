# Backend - Voice Automation STT Service

## Overview

Express.js server that provides speech-to-text functionality using OpenAI's Whisper API.

## Features

- `/stt` endpoint for audio transcription
- File upload handling with validation
- OpenAI Whisper API integration
- Error handling and cleanup
- Health check endpoint

## Setup

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_actual_api_key_here
PORT=3000
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "message": "Backend is running!"
}
```

### Speech-to-Text
```
POST /stt
```

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Audio file with field name `audio`

**Supported Audio Formats:**
- MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM
- Max file size: 25MB

**Response:**
```json
{
  "text": "schedule a team meeting tomorrow at 5pm"
}
```

**Error Response:**
```json
{
  "error": "Error description",
  "details": "Detailed error message"
}
```

## Testing

### Using curl

1. Record an audio file or use a sample audio file
2. Test the endpoint:

```bash
curl -X POST \
  -F "audio=@path/to/your/audio.mp3" \
  http://localhost:3000/stt
```

### Using Postman

1. Set method to `POST`
2. URL: `http://localhost:3000/stt`
3. Body → form-data
4. Add key `audio` with type `File`
5. Upload your audio file
6. Send request

## Project Structure

```
backend/
├── src/
│   └── app.ts          # Main Express application
├── uploads/            # Temporary file storage (auto-created)
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 3000) | No |

## Error Handling

The service includes comprehensive error handling:

- Missing audio file validation
- Audio format validation
- File size limits (25MB max)
- OpenAI API errors
- File cleanup on errors

## Security Considerations

- Audio files are temporarily stored and immediately deleted after processing
- File type validation prevents malicious uploads
- API key is required and validated
- CORS enabled for frontend integration

## Next Steps

This is Step 2 of the voice automation system. Next steps include:
- Intent parsing (`/intent` endpoint)
- Workflow execution (`/execute` endpoint)  
- Text-to-speech (`/tts` endpoint)