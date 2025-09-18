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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Pick best available format
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : MediaRecorder.isTypeSupported("audio/webm")
                    ? "audio/webm"
                    : MediaRecorder.isTypeSupported("audio/ogg")
                        ? "audio/ogg"
                        : "audio/3gpp";

            const mr = new MediaRecorder(stream, { mimeType });

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mr.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: mr.mimeType });
                chunksRef.current = [];

                console.log("🎤 Recorded:", mr.mimeType, "size:", blob.size);

                if (blob.size < 2000) {
                    alert("⚠️ No audio captured. Try speaking louder or check mic permissions.");
                    return;
                }

                await uploadAudio(blob, "recording." + mr.mimeType.split("/")[1]);
            };

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
    let blob = fileOrBlob;

    // Convert to WAV if not already
    if (!(blob.type.includes("wav"))) {
      const audioCtx = new AudioContext();
      const buffer = await blob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(buffer);

      const wavBuffer = audioBufferToWav(decoded); // helper function
      blob = new Blob([wavBuffer], { type: "audio/wav" });
      filename = "recording.wav";
    }

    const file = new File([blob], filename, { type: blob.type });
    const form = new FormData();
    form.append("audio", file);

    const res = await axios.post("http://localhost:4000/api/transcribe", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setLatestTranscript(res.data.transcript || "Transcription failed.");
  } catch (err) {
    console.error("Upload error:", err);
    alert("No speech detected. Try again.");
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
