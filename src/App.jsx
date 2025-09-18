import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import History from "./pages/History";
import About from "./pages/About";

export default function App() {
  return (
    // Wraped the entire app in Router for page navigation
    <Router>
      {/* Main container for background, text color, and vertical layout */}
      <div className="bg-gray-900 min-h-screen text-gray-100 flex flex-col">

        {/* ================= Navbar ================= */}
        <nav className="bg-gray-800 shadow-md w-full">
          <div className="flex justify-between items-center h-16 px-6">

            {/* Logo / Brand name */}
            <div className="text-indigo-400 text-xl font-bold">
              🎤 <span className="text-gray-200">Echo</span>Verse
            </div>

            {/* Navigation links */}
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-300 hover:text-indigo-400 transition">
                Home
              </Link>
              <Link to="/history" className="text-gray-300 hover:text-indigo-400 transition">
                History
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-indigo-400 transition">
                About
              </Link>
            </div>
          </div>
        </nav>

        {/* ================= Page Content ================= */}
        <div className="flex-grow p-6 flex justify-center">
          <Routes>
            {/* Route for Home page */}
            <Route path="/" element={<Home />} />

            {/* Route for History page */}
            <Route path="/history" element={<History />} />

            {/* Route for About page */}
            <Route path="/about" element={<About />} />
          </Routes>
        </div>

        {/* ================= Footer ================= */}
        <footer className="bg-gray-800 text-gray-400 py-4 text-center">
          <p className="text-sm font-medium tracking-wide">
            Made with <span className="text-red-500">❤️</span> by{" "}
            <span className="ml-1 text-indigo-400 font-semibold">Himani</span>
          </p>
        </footer>
      </div>
    </Router>
  );
}
