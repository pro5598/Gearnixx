import React from 'react';
import { Home, Grid3x3, Tag, Award, Users } from 'lucide-react';

export default function SidebarComponent() {
  return (
<div className="w-64 bg-gray-50 border-r border-gray-200 pt-6 min-h-screen sticky top-16 self-start">
      <nav className="px-4 py-6">
        {/* Home */}
        <div className="mb-2">
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 transition-all duration-200 transform hover:scale-105"
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </a>
        </div>

        {/* Questions Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white bg-cyan-500 shadow-md">
            <Grid3x3 size={20} />
            <span className="font-medium">Questions</span>
          </div>
          
          {/* Questions Subsections */}
          <div className="ml-9 mt-2 space-y-1">
            <a 
              href="#" 
              className="block px-3 py-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 rounded-md transition-all duration-200 transform hover:translate-x-1"
            >
              Newest
            </a>
            <a 
              href="#" 
              className="block px-3 py-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 rounded-md transition-all duration-200 transform hover:translate-x-1"
            >
              Active
            </a>
            <a 
              href="#" 
              className="block px-3 py-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 rounded-md transition-all duration-200 transform hover:translate-x-1"
            >
              Bountied
            </a>
            <a 
              href="#" 
              className="block px-3 py-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 rounded-md transition-all duration-200 transform hover:translate-x-1"
            >
              Unanswerd
            </a>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-2">
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 transition-all duration-200 transform hover:scale-105"
          >
            <Tag size={20} />
            <span className="font-medium">Tags</span>
          </a>
        </div>

        {/* Points */}
        <div className="mb-2">
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 transition-all duration-200 transform hover:scale-105"
          >
            <Award size={20} />
            <span className="font-medium">Points</span>
          </a>
        </div>

        {/* Users */}
        <div className="mb-2">
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 transition-all duration-200 transform hover:scale-105"
          >
            <Users size={20} />
            <span className="font-medium">Users</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
