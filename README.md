# Orchestra

Orchestra is a voice-enabled AI chatbot mobile app built with React Native and Expo. It supports real-time voice input via OpenAI's Whisper API (speech-to-text) and speaks AI responses aloud using the device's native TTS engine. Chat is powered by GPT-4o-mini, with messages persisted to a Supabase database and cached locally via AsyncStorage for offline access. Navigation is tab-based with screens for Chat, Home, and Support.

## Setup

**Prerequisites:** Node.js, Expo CLI, a Supabase project, and an OpenAI API key.

1. Install dependencies: `yarn install`
2. Create a `.env` file in the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   OPENAI_API_KEY=<your-openai-api-key>
   ```
3. Deploy the Supabase Edge Functions:
   ```
   npx supabase functions deploy speech-to-text
   npx supabase functions deploy chat-completion
   ```
4. Start the app: `yarn start` (or `yarn ios` / `yarn android` for a specific platform)

Voice features work best on a physical device, as simulators have limited audio support.
