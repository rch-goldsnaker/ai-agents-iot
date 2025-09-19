import React from 'react';
import { Github } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 px-4 py-2 sticky top-0 z-50 glassmorphism-header h-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI IoT Chat
          </h1>
        </div>
        
        {/* Watermark centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-xs text-gray-400/60 font-light">
          Made by Mirutec with &#10084;&#65039;
        </div>
        
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-6">
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-all duration-300 hover:glow-text"
            >
              Chat
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-all duration-300 hover:glow-text"
            >
              IoT Devices
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-all duration-300 hover:glow-text"
            >
              Settings
            </a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 hover:glow-text"
              aria-label="GitHub Repository"
            >
              <Github size={20} />
            </a>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center glassmorphism-avatar">
              <span className="text-white text-sm font-medium">AI</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;