import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faDownload, faBroom } from "@fortawesome/free-solid-svg-icons";

export default function History() {
    // State to store all transcriptions fetched from backend
    const [history, setHistory] = useState([]);

    // Fetch history when component mounts
    useEffect(() => {
        fetchHistory();
    }, []);

    // ================= Fetch History from Backend =================
    async function fetchHistory() {
        try {
            const res = await axios.get("https://speech-to-text-backend-hejt.onrender.com/api/transcriptions");
            setHistory(res.data); // store fetched transcriptions
        } catch {
            alert("Failed to fetch history");
        }
    }

    // ================= Delete Single Transcript =================
    async function deleteTranscript(id) {
        if (!window.confirm("Are you sure you want to delete this transcript?")) return;
        try {
            await axios.delete(`https://speech-to-text-backend-hejt.onrender.com/api/transcriptions/${id}`);
            fetchHistory(); // refresh the list after deletion
        } catch {
            alert("Delete failed");
        }
    }

    // ================= Clear All History =================
    async function clearAllHistory() {
        if (!window.confirm("This will delete ALL transcripts. Continue?")) return;
        try {
            // Loop through each transcript and delete individually
            for (const item of history) {
                await axios.delete(`https://speech-to-text-backend-hejt.onrender.com/${item._id}`);
            }
            setHistory([]); // clear state after deletion
            alert("All transcripts cleared!");
        } catch {
            alert("Failed to clear history");
        }
    }

    // ================= Download All Transcripts =================
    function downloadAllHistory() {
        if (history.length === 0) return alert("No transcripts to download!");

        // Format all transcripts into text
        const content = history
            .map(
                (h, i) =>
                    `#${i + 1} - ${new Date(h.createdAt).toLocaleString()}\n${h.transcript}\n\n`
            )
            .join("");

        // Create a temporary link to download the file
        const blob = new Blob([content], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "transcriptions.txt";
        link.click();
    }

    // ================= Render UI =================
    return (
        <div className="w-full max-w-4xl mx-auto mt-8">

            {/* Heading + buttons */}
            {history.length === 0 ? (
                // No history case
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-indigo-400 mb-4">History</h1>
                    <p className="text-lg mt-10 text-gray-400">No history yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Upload or record something and it’ll show up here!</p>
                </div>
            ) : (
                // History exists: show heading + buttons
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-indigo-400">History</h1>
                    <div className="flex space-x-3 mt-2">
                        {/* Download all button */}
                        <button
                            onClick={downloadAllHistory}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faDownload} />
                            Download All
                        </button>

                        {/* Clear all button */}
                        <button
                            onClick={clearAllHistory}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faBroom} />
                            Clear All
                        </button>
                    </div>
                </div>
            )}

            {/* List of individual history items */}
            {history.length > 0 && (
                <div className="space-y-4">
                    {history.map((h) => (
                        <div
                            key={h._id}
                            className="p-4 bg-gray-800 rounded-lg shadow hover:shadow-lg transition flex justify-between items-start"
                        >
                            {/* Transcript info */}
                            <div>
                                <div className="text-xs text-gray-400">
                                    {new Date(h.createdAt).toLocaleString()}
                                </div>
                                <p className="mt-2 text-gray-200">{h.transcript}</p>
                            </div>

                            {/* Delete single transcript button */}
                            <button
                                onClick={() => deleteTranscript(h._id)}
                                className="ml-4 px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition flex items-center"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
