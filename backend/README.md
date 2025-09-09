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
PORT=8000
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

The server will start on `http://localhost:8000`

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

### Intent Parsing

```
POST /intent
```

**Request:**

- Method: `POST`
- Content-Type: `application/json`
- Body:

```json
{
  "text": "schedule a team meeting tomorrow at 5pm"
}
```

**Response:**

```json
{
  "action": "create_event",
  "title": "Team meeting",
  "time": "2025-09-09T17:00:00",
  "details": "Meeting scheduled for tomorrow at 5pm",
  "confidence": 0.95
}
```

**Supported Actions:**

- `create_event` - Calendar events, meetings, appointments
- `create_task` - Todos, reminders, tasks
- `send_message` - Emails, texts, slack messages
- `set_reminder` - Time-based reminders
- `search_info` - Look up information
- `unknown` - When intent is unclear

### Workflow Execution
```
POST /execute
```

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body: Intent JSON from `/intent` endpoint
```json
{
  "action": "create_event",
  "title": "Team meeting",
  "time": "2025-09-09T17:00:00",
  "details": "Meeting scheduled for tomorrow at 5pm",
  "confidence": 0.95
}
```

**Response (with n8n):**
```json
{
  "success": true,
  "result": "Event 'Team meeting' has been created in your calendar",
  "intent": { /* original intent object */ }
}
```

**Response (mock mode):**
```json
{
  "success": true,
  "result": "Event 'Team meeting' has been created in your calendar",
  "intent": { /* original intent object */ },
  "mock": true
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

**Test Speech-to-Text:**

```bash
curl -X POST \
  -F "audio=@path/to/your/audio.mp3" \
  http://localhost:8000/stt
```

**Test Intent Parsing:**

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text": "schedule a team meeting tomorrow at 5pm"}' \
  http://localhost:8000/intent
```

**Test Workflow Execution:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_event",
    "title": "Team meeting",
    "time": "2025-09-09T17:00:00",
    "details": "Meeting scheduled for tomorrow at 5pm",
    "confidence": 0.95
  }' \
  http://localhost:8000/execute
```

**Test Text-to-Speech:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"text": "Event has been created in your calendar"}' \
  http://localhost:8000/tts \
  --output response.mp3
```

**Test Complete Flow:**

```bash
# Step 1: Upload audio and get transcribed text
TRANSCRIPT=$(curl -s -X POST -F "audio=@audio.mp3" http://localhost:8000/stt | jq -r '.text')

# Step 2: Parse the transcribed text into structured intent
INTENT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TRANSCRIPT\"}" \
  http://localhost:8000/intent)

# Step 3: Execute the intent workflow
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$INTENT" \
  http://localhost:8000/execute | jq -r '.result')

# Step 4: Convert result to speech
curl -X POST \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$RESULT\"}" \
  http://localhost:8000/tts \
  --output response.mp3 && echo "Complete! Play response.mp3"
```

### Using Postman

**For STT Endpoint:**

1. Set method to `POST`
2. URL: `http://localhost:8000/stt`
3. Body → form-data
4. Add key `audio` with type `File`
5. Upload your audio file
6. Send request

**For Intent Endpoint:**

1. Set method to `POST`
2. URL: `http://localhost:8000/intent`
3. Headers → Content-Type: `application/json`
4. Body → raw JSON:

```json
{
  "text": "schedule a team meeting tomorrow at 5pm"
}
```

5. Send request

**For Execute Endpoint:**
1. Set method to `POST`
2. URL: `http://localhost:8000/execute`
3. Headers → Content-Type: `application/json`
4. Body → raw JSON (use output from `/intent` endpoint):
```json
{
  "action": "create_event",
  "title": "Team meeting",
  "time": "2025-09-09T17:00:00",
  "details": "Meeting scheduled for tomorrow at 5pm",
  "confidence": 0.95
}
```
5. Send request

**For TTS Endpoint:**
1. Set method to `POST`
2. URL: `http://localhost:8000/tts`
3. Headers → Content-Type: `application/json`
4. Body → raw JSON:
```json
{
  "text": "Event has been created in your calendar"
}
```
5. Send request → Save response as MP3 file

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
| `PORT` | Server port (default: 8000) | No |
| `N8N_WEBHOOK_URL` | n8n webhook URL for workflow execution | No* |

*If not provided, `/execute` endpoint will use mock responses for testing.

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

This completes **ALL Steps (2-5)** of the voice automation system! Status:
- ✅ Speech-to-text (`/stt` endpoint) - **COMPLETED**
- ✅ Intent parsing (`/intent` endpoint) - **COMPLETED**  
- ✅ Workflow execution (`/execute` endpoint) - **COMPLETED** (with n8n + mock fallback)
- ✅ Text-to-speech (`/tts` endpoint) - **COMPLETED** (OpenAI TTS)

## n8n Integration

The `/execute` endpoint forwards intent JSON to an n8n webhook for workflow automation. 

### Setup n8n (Optional)
1. Install n8n: `npm install -g n8n`
2. Start n8n: `n8n start`
3. Create workflows for each intent action
4. Set webhook trigger URL in `N8N_WEBHOOK_URL`

### Mock Mode
Without n8n configuration, the endpoint provides realistic mock responses for development and testing.

### Text-to-Speech
```
POST /tts
```

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```json
{
  "text": "Event 'Team meeting' has been created in your calendar"
}
```

**Response:**
- Content-Type: `audio/mpeg`
- Body: MP3 audio file (binary data)

**Voice Options:**
- Model: `tts-1` (OpenAI TTS)
- Voice: `alloy` (can be configured)
- Format: MP3

**Error Response:**
```json
{
  "error": "Text-to-speech conversion failed",
  "details": "Detailed error message"
}
```
