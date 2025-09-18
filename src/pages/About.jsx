import React from "react";

export default function About() {
    return (
        // Container for About page with max width, centered, top margin, and spacing between paragraphs
        <div className="max-w-4xl mx-auto mt-8 text-gray-200 space-y-6">

            {/* Page Heading */}
            <h1 className="text-3xl font-bold text-indigo-400 mb-4">About This Project</h1>

            {/* Introductory paragraph explaining the purpose of the project */}
            <p>
                Welcome to <span className="font-semibold text-indigo-300">EchoVerse</span>,
                a project I built to explore the power of voice technology. The main goal of
                this app is to make it super easy for anyone to convert spoken audio into text.
                Whether you upload a pre-recorded file or speak directly into your microphone,
                the app processes the audio and returns a clean transcription.
            </p>

            {/* Backend explanation */}
            <p>
                The backend is powered by <span className="text-indigo-300 font-medium">Express.js </span>
                and integrates with a transcription service to process audio. All transcriptions
                are stored in a <span className="text-indigo-300 font-medium">MongoDB database</span>,
                so users can always go back and review their history. You can even delete old entries
                if you no longer need them.
            </p>

            {/* Frontend explanation */}
            <p>
                On the frontend, I used <span className="text-indigo-300 font-medium">React </span> and styled everything with <span className="text-indigo-300 font-medium">Tailwind CSS</span>.
                The design is meant to be clean, minimal, and user-friendly so that the focus stays
                on what matters most — the transcriptions themselves.
            </p>

            {/* Learning and experience gained */}
            <p>
                This project taught me a lot about working with APIs, handling audio data, and
                connecting a frontend with a backend in a smooth way. It’s also deployed online,
                which means anyone can try it out without having to install anything locally.
            </p>

            {/* Future improvements */}
            <p>
                Ultimately, this app is just the beginning. In the future, I plan to enhance it
                with authentication so users can save their personal transcripts securely,
                and maybe even add multi-language transcription support.
            </p>

            {/* Thank you note */}
            <p className="text-indigo-300 font-semibold">
                Thank you for checking out my project!
            </p>
        </div>
    );
}
