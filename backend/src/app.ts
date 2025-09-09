import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// n8n webhook response types
interface N8nWebhookResponse {
  success?: boolean;
  result?: string;
  message?: string;
  data?: unknown;
  error?: string;
  [key: string]: unknown;
}

// Type guard for n8n webhook response
function isN8nWebhookResponse(obj: unknown): obj is N8nWebhookResponse {
  return typeof obj === 'object' && obj !== null;
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp3|mp4|mpeg|mpga|m4a|wav|webm)$/;
    if (allowedTypes.test(file.originalname.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.post("/stt", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    const audioFile = fs.createReadStream(req.file.path);

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    fs.unlinkSync(req.file.path);

    res.json({ text: transcription.text });
  } catch (error) {
    console.error("STT Error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Speech-to-text conversion failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/intent", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text input is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an intent parser for a voice-driven task automation system. 
          Parse the user's natural language input into a structured JSON intent.

          Return JSON in this exact format:
          {
            "action": "action_type",
            "title": "descriptive title",
            "time": "ISO timestamp if time-related",
            "details": "additional context",
            "confidence": 0.95
          }

          Supported actions:
          - "create_event" - calendar events, meetings, appointments
          - "create_task" - todos, reminders, tasks
          - "send_message" - emails, texts, slack messages
          - "set_reminder" - time-based reminders
          - "search_info" - look up information
          - "unknown" - when intent is unclear

          Guidelines:
          - Extract specific times and convert to ISO format
          - If no specific time, use null for time field
          - Include confidence score (0.0-1.0)
          - Be precise with action classification`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const intentText = completion.choices[0]?.message?.content;
    if (!intentText) {
      throw new Error("No response from OpenAI");
    }

    const intent = JSON.parse(intentText);
    res.json(intent);
  } catch (error) {
    console.error("Intent parsing error:", error);
    res.status(500).json({
      error: "Intent parsing failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/execute", async (req, res) => {
  try {
    const intent = req.body;

    if (!intent || typeof intent !== 'object') {
      return res.status(400).json({ error: "Intent JSON is required" });
    }

    const { action } = intent;
    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: "Intent action is required" });
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.warn("N8N_WEBHOOK_URL not configured, using mock execution");
      
      // Mock execution for development/testing
      const mockResults = {
        create_event: `Event "${intent.title || 'Untitled'}" has been created in your calendar`,
        create_task: `Task "${intent.title || 'Untitled'}" has been added to your todo list`,
        send_message: `Message "${intent.title || 'Untitled'}" has been sent`,
        set_reminder: `Reminder "${intent.title || 'Untitled'}" has been set`,
        search_info: `Search completed for "${intent.title || intent.details || 'your query'}"`,
        unknown: "I'm not sure how to handle that request"
      };

      const result = mockResults[action as keyof typeof mockResults] || mockResults.unknown;
      
      return res.json({
        success: true,
        result: result,
        intent: intent,
        mock: true
      });
    }

    // Forward intent to n8n webhook
    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(intent)
    });

    if (!webhookResponse.ok) {
      throw new Error(`n8n webhook failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
    }

    const webhookResult: unknown = await webhookResponse.json();
    
    // Extract result text from n8n response with proper type checking
    let resultText = "Task completed successfully";
    if (isN8nWebhookResponse(webhookResult)) {
      if (typeof webhookResult.result === 'string' && webhookResult.result.trim()) {
        resultText = webhookResult.result;
      } else if (typeof webhookResult.message === 'string' && webhookResult.message.trim()) {
        resultText = webhookResult.message;
      } else if (typeof webhookResult.data === 'string' && webhookResult.data.trim()) {
        resultText = webhookResult.data;
      }
    }

    res.json({
      success: true,
      result: resultText,
      intent: intent
    });

  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({
      error: "Workflow execution failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Text input is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "mp3",
    });

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Set appropriate headers for audio response
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length.toString(),
      'Content-Disposition': 'inline; filename="response.mp3"'
    });

    res.send(buffer);

  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({
      error: "Text-to-speech conversion failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
