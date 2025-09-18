import React, { useState, useRef } from "react";
import axios from "axios";

// Font Awesome icons for buttons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop, faUpload } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
    // State to track if recording is ongoing
    const [recording, setRecording] = useState(false);

    // Holds the MediaRecorder instance
    const [mediaRecorder, setMediaRecorder] = useState(null);

    // Loading state while transcribing
    const [loading, setLoading] = useState(false);

    // Stores the latest transcription text
    const [latestTranscript, setLatestTranscript] = useState("");

    // Ref to store audio chunks while recording
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
            mediaRecorder.stop(); // triggers onstop
            setRecording(false);
        }
    }

    // ================= Handle File Upload =================
    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        await uploadAudio(file, file.name);
    }

    // ================= Upload & Transcribe Audio =================
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

            // Send audio to backend API
            const res = await axios.post("http://localhost:4000/api/transcribe", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Update latest transcript
            setLatestTranscript(res.data.transcript || "Transcription failed.");
        } catch {
            alert("No speech detected. Try again.");
            setLatestTranscript("");
        } finally {
            setLoading(false);
        }
    }

    // ================= Render UI =================
    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 py-8 px-4">

            {/* Page title */}
            <h1 className="text-4xl font-bold text-indigo-400 text-center">
                Speech → <span className="text-gray-200">Text</span>
            </h1>

            {/* Upload & Recording Buttons */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">

                {/* Upload Audio Button */}
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

                {/* Conditional recording buttons */}
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

            {/* Loading / transcribing indicator */}
            {loading && (
                <p className="text-indigo-400 text-center animate-pulse">Transcribing…</p>
            )}

            {/* Latest Transcript display */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Latest Transcript</h3>
                <p className="text-gray-100">{latestTranscript || "No transcript yet"}</p>
            </div>
        </div>
    );
}
