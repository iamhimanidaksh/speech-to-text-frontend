// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function App() {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [latestAudioUrl, setLatestAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [latestTranscript, setLatestTranscript] = useState("");
  const [history, setHistory] = useState([]);
  const chunksRef = useRef([]);

  // On load, fetch saved transcripts from backend
  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await axios.get("http://localhost:4000/api/transcriptions");
      setHistory(res.data);
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options.mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        options.mimeType = "audio/webm";
      }
      const mr = new MediaRecorder(stream, options);

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        const url = URL.createObjectURL(blob);
        setLatestAudioUrl(url);

        await uploadAudio(blob, "recording.webm");
      };

      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch (err) {
      console.error("Could not start recording:", err);
      alert("Microphone access denied.");
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setRecording(false);
    }
  }

 async function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  // 1) Check if file is an audio
  if (!file.type.startsWith("audio/")) {
    alert("Please select a valid audio file (mp3, wav, webm).");
    return;
  }

  // 2) Check file size (e.g., max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert("File too large. Max 10MB allowed.");
    return;
  }

  // If valid, show preview and upload
  setLatestAudioUrl(URL.createObjectURL(file));
  await uploadAudio(file, file.name);
}


 async function uploadAudio(fileOrBlob, filename = "audio.webm") {
  setLoading(true);
  try {
    const form = new FormData();
    const file =
      fileOrBlob instanceof Blob
        ? new File([fileOrBlob], filename, { type: fileOrBlob.type })
        : fileOrBlob;

    form.append("audio", file);

    const res = await axios.post("http://localhost:4000/api/transcribe", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!res.data.transcript) {
      alert("Transcription failed. Try again.");
      setLatestTranscript("");
      return;
    }

    setLatestTranscript(res.data.transcript);
    await fetchHistory(); // refresh history
  } catch (err) {
    console.error("Upload/transcription error:", err);
    alert("Upload or transcription failed. Please try again.");
    setLatestTranscript("");
  } finally {
    setLoading(false);
  }
}


  // Add this function inside App component
  async function deleteTranscript(id) {
    if (!window.confirm("Are you sure you want to delete this transcript?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/transcriptions/${id}`);
      // Refresh history after deletion
      fetchHistory();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete transcript.");
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 space-y-6 max-h-[100vh] overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          🎤 Speech → Text
        </h1>



        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="file" accept="audio/*" onChange={handleFileChange} />
            <div className="text-sm text-gray-500">or</div>

            {!recording ? (
              <button
                onClick={startRecording}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 transform hover:scale-105"
              >
                Start Recording
              </button>

            ) : (
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 transition duration-200 transform hover:scale-105"
              >
                Stop Recording
              </button>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <span>Transcribing…</span>
                <span className="inline-block w-4 h-4 border-2 border-t-transparent border-gray-600 rounded-full animate-spin"></span>
              </div>
            )}

          </div>

          {latestAudioUrl && (
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-2">Audio preview</h3>
              <audio controls src={latestAudioUrl} className="w-full rounded" />
            </div>
          )}


          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Latest transcript</h3>
            <div className="p-4 bg-gray-100 rounded-lg min-h-[48px]">
              {latestTranscript || <span className="text-gray-400">No transcript yet</span>}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">History</h3>
            <div className="mt-2 space-y-3 max-h-64 overflow-auto">
              {history.length === 0 && (
                <div className="text-sm text-gray-500 italic">
                  You don’t have any saved transcripts yet. Upload or record audio to get started!
                </div>
              )}

              {history.map((h) => (
                <div
                  key={h._id}
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-200 flex justify-between items-start"
                >
                  <div>
                    <div className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleString()}</div>
                    <div className="mt-1">{h.transcript}</div>
                  </div>
                  <button
                    onClick={() => deleteTranscript(h._id)}
                    className="ml-4 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
