"use client";

import React, { useState } from 'react';
import { Github, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 px-3 sm:px-4 lg:px-6 py-2 sticky top-0 z-50 glassmorphism-header h-14 sm:h-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI IoT Chat
          </h1>
        </div>
        
        {/* Watermark centered - hidden on mobile */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-xs text-gray-400/60 font-light hidden md:block">
          Made by Mirutec with &#10084;&#65039;
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4">
          <nav className="flex space-x-6">
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-all duration-300 hover:glow-text text-sm lg:text-base"
            >
              Chat
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-all duration-300 hover:glow-text text-sm lg:text-base"
            >
              IoT Devices
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-all duration-300 hover:glow-text text-sm lg:text-base"
            >
              Settings
            </a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <a 
              href="https://github.com/rch-goldsnaker/ai-agents-iot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 hover:glow-text"
              aria-label="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center glassmorphism-avatar">
              <span className="text-white text-sm font-medium">AI</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center space-x-2">
          <a 
            href="https://github.com/rch-goldsnaker/ai-agents-iot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-all duration-300"
            aria-label="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-300 hover:text-white transition-all duration-300 p-1"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
          <nav className="flex flex-col space-y-2 p-4">
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-all duration-300 py-2 px-3 rounded-md hover:bg-gray-800/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Chat
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-all duration-300 py-2 px-3 rounded-md hover:bg-gray-800/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              IoT Devices
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-all duration-300 py-2 px-3 rounded-md hover:bg-gray-800/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </a>
            <div className="flex items-center justify-center pt-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center glassmorphism-avatar">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;