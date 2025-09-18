# EchoVerse - Speech-to-Text App (MERN + Deepgram)

This project is a speech-to-text web application where users can upload or record audio and get instant transcription. It uses React for the frontend, Express.js + Node.js for the backend, MongoDB for storing transcripts, and Deepgram API for speech recognition.

# Features

- Record audio directly from the browser.

- Upload audio files (mp3, wav, webm supported).

- Get transcription using Deepgram API.

- Save transcripts automatically in MongoDB.

- Delete transcripts from history.

- Can download transcriptions as text file.

- Error handling for invalid file types, large files, and failed API requests.

- Fully deployed with frontend and backend working together.

# Tech Stack

Frontend: React + Tailwind CSS + Axios

Backend: Node.js + Express.js + Multer

Database: MongoDB (Mongoose)

Speech API: Deepgram (Nova-3 Model)

Deployment: Netlify (Frontend) + Render (Backend)

# Local Setup

1. Clone the repositories ( Frontend + Backend)

- git clone [https://github.com/iamhimanidaksh/speech-to-text-frontend]
- git clone [https://github.com/iamhimanidaksh/speech-to-text-backend]

2. Install Dependencies

  (Frontend)

- cd frontend
- npm install
- npm run dev   # starts frontend on localhost:5173

   (Backend)

- cd backend
- npm install
- npm run dev   # starts backend on localhost:4000

  (Endpoints)

- POST /api/transcribe
- Upload audio (multipart/form-data) and get a transcript in response.

- GET /api/transcriptions
- Fetch all saved transcriptions.

- DELETE /api/transcriptions/:id
- Delete a single transcript by ID.

3. Setup Environmental Variables

- MONGO_URI=your_mongodb_connection_string
- DEEPGRAM_API_KEY=your_deepgram_api_key



# Deployment

Frontend (Netlify): [https://speech-to-text-himani-web.netlify.app]

Backend (Render): [https://speech-to-text-backend-hejt.onrender.com]

# Testing

- Upload a valid audio file → transcription appears.

- Record audio → transcription appears.

- Transcripts are saved in MongoDB and shown in history.

- Delete button removes transcripts.

- Download button downloads transcripts.

- Error messages show if:

  File is not audio.

  File size > 10MB.

  Deepgram API fails.

# Author

Built with ❤️ by [Himani]