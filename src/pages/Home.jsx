// frontend/src/pages/Home.jsx
import React, { useState, useRef } from "react";
import axios from "axios";

// Font Awesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop, faUpload } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  // Recording state
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [latestTranscript, setLatestTranscript] = useState("");

  // Audio chunks
  const chunksRef = useRef([]);

  // ================= Start Recording =================
  async function startRecording() {
    try {
      // Request mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mr = new MediaRecorder(stream, { mimeType });

      // Collect chunks
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // When recording stops → upload file
      mr.onstop = async () => {
        const finalMimeType = mr.mimeType || "audio/webm";
        const extension = finalMimeType.includes("mp4") ? "mp4" : "webm";

        const blob = new Blob(chunksRef.current, { type: finalMimeType });
        chunksRef.current = []; // reset buffer

        await uploadAudio(blob, `recording.${extension}`);
      };

      // Start
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access denied.");
    }
  }

  // ================= Stop Recording =================
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setRecording(false);
    }
  }

  // ================= Handle File Upload =================
  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    await uploadAudio(file, file.name);
  }

  // ================= Upload & Transcribe =================
  async function uploadAudio(fileOrBlob, filename = "audio.webm") {
    setLoading(true);
    try {
      const form = new FormData();

      // Convert Blob to File if needed
      const file =
        fileOrBlob instanceof Blob
          ? new File([fileOrBlob], filename, { type: fileOrBlob.type })
          : fileOrBlob;

      form.append("audio", file);

      // Send to backend
      const res = await axios.post("http://localhost:4000/api/transcribe", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLatestTranscript(res.data.transcript || "Transcription failed.");
    } catch (err) {
      console.error("Upload error:", err);
      alert("⚠️ No speech detected. Try again.");
      setLatestTranscript("");
    } finally {
      setLoading(false);
    }
  }

  // ================= UI =================
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-8 px-4">
      {/* Page title */}
      <h1 className="text-4xl font-bold text-indigo-400 text-center">
        Speech → <span className="text-gray-200">Text</span>
      </h1>

      {/* Upload + Recording buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
        {/* Upload */}
        <label className="cursor-pointer px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center gap-2">
          <FontAwesomeIcon icon={faUpload} />
          Upload Audio
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Record */}
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faMicrophone} />
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faStop} />
            Stop Recording
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-indigo-400 text-center animate-pulse">Transcribing…</p>
      )}

      {/* Transcript */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-200 mb-2">
          Latest Transcript
        </h3>
        <p className="text-gray-100">{latestTranscript || "No transcript yet"}</p>
      </div>
    </div>
  );
}
