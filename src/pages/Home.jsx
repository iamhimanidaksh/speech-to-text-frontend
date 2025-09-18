// frontend/src/pages/Home.jsx
import React, { useState, useRef } from "react";
import axios from "axios";

// Font Awesome icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop, faUpload } from "@fortawesome/free-solid-svg-icons";

// Use environment variable 
const API_URL = process.env.REACT_APP_API_URL || "https://speech-to-text-backend-hejt.onrender.com";

export default function Home() {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [latestTranscript, setLatestTranscript] = useState("");
    const chunksRef = useRef([]);

    // ================= Start Recording =================
    async function startRecording() {
        try {
            // Ask for microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create MediaRecorder to capture audio


            const mimeType = MediaRecorder.isTypeSupported("audio/webm")
                ? "audio/webm"
                : "audio/mp4";
            const mr = new MediaRecorder(stream, { mimeType });



            // Collect audio chunks as data becomes available
            mr.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            // When recording stops, combine chunks and upload
            mr.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                chunksRef.current = []; // reset chunks
                await uploadAudio(blob, "recording.webm");
            };

            mr.start(); // start recording
            setMediaRecorder(mr);
            setRecording(true); // update UI
        } catch {
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
            const file =
                fileOrBlob instanceof Blob
                    ? new File([fileOrBlob], filename, { type: fileOrBlob.type })
                    : fileOrBlob;

            form.append("audio", file);

            const res = await axios.post(`${API_URL}/api/transcribe`, form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setLatestTranscript(res.data.transcript || "Transcription failed.");
        } catch (err) {
            console.error("Upload error:", err.response?.data || err.message);
            alert("⚠️ No speech detected or server error. Try again.");
            setLatestTranscript("");
        } finally {
            setLoading(false);
        }
    }

    // ================= UI =================
    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 py-8 px-4">
            <h1 className="text-4xl font-bold text-indigo-400 text-center">
                Speech → <span className="text-gray-200">Text</span>
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
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

            {loading && (
                <p className="text-indigo-400 text-center animate-pulse">Transcribing…</p>
            )}

            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                    Latest Transcript
                </h3>
                <p className="text-gray-100">{latestTranscript || "No transcript yet"}</p>
            </div>
        </div>
    );
}
