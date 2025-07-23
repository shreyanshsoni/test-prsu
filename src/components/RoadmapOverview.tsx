import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Target, User, Edit2, Clock } from 'lucide-react';
import { useTheme } from '../app/contexts/ThemeContext';

interface RoadmapOverviewProps {
  goal: string;
  identity: string;
  deadline: string;
  progress: number;
  onUpdateGoal: (goal: { title: string; identity: string; deadline: string }) => void;
}

export default function RoadmapOverview({
  goal,
  identity,
  deadline,
  progress,
  onUpdateGoal
}: RoadmapOverviewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoal, setEditedGoal] = useState(goal);
  const [editedIdentity, setEditedIdentity] = useState(identity);
  const [editedDeadline, setEditedDeadline] = useState(deadline);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the star path
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Define star positions - more aligned with the reference image
    const stars = [
      { x: canvas.width * 0.2, y: canvas.height * 0.7 },   // Starting star
      { x: canvas.width * 0.4, y: canvas.height * 0.5 },   // Middle star 1
      { x: canvas.width * 0.6, y: canvas.height * 0.65 },  // Middle star 2
      { x: canvas.width * 0.85, y: canvas.height * 0.3 },  // End star (near the goal text)
    ];
    
    // Draw very small background stars - more subtle than before
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 0.8; // Smaller stars
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
      ctx.fill();
    }
    
    // Draw the path - using bezier curves for smoother flow
    ctx.beginPath();
    ctx.moveTo(stars[0].x, stars[0].y);
    
    // Draw a smoother curve that resembles the reference image
    ctx.bezierCurveTo(
      stars[0].x + (stars[1].x - stars[0].x) * 0.4, // control point 1 x
      stars[0].y - 20,                              // control point 1 y
      stars[1].x - 30,                              // control point 2 x
      stars[1].y,                                   // control point 2 y
      stars[1].x,                                   // end point x
      stars[1].y                                    // end point y
    );
    
    ctx.bezierCurveTo(
      stars[1].x + 40,                              // control point 1 x
      stars[1].y,                                   // control point 1 y
      stars[2].x - 40,                              // control point 2 x
      stars[2].y - 10,                              // control point 2 y
      stars[2].x,                                   // end point x
      stars[2].y                                    // end point y
    );
    
    ctx.bezierCurveTo(
      stars[2].x + 60,                              // control point 1 x
      stars[2].y + 10,                              // control point 1 y
      stars[3].x - 80,                              // control point 2 x
      stars[3].y + 70,                              // control point 2 y
      stars[3].x,                                   // end point x
      stars[3].y                                    // end point y
    );
    
    // Style the path more like the reference image
    // Create a gradient that fades out toward the right side
    const pathGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    pathGradient.addColorStop(0, isDark ? 'rgba(147, 197, 253, 0.4)' : 'rgba(255, 255, 255, 0.5)');
    pathGradient.addColorStop(0.7, isDark ? 'rgba(147, 197, 253, 0.3)' : 'rgba(255, 255, 255, 0.3)');
    pathGradient.addColorStop(1, isDark ? 'rgba(147, 197, 253, 0)' : 'rgba(255, 255, 255, 0)');
    
    ctx.strokeStyle = pathGradient;
    ctx.lineWidth = 1; // Thinner line
    ctx.stroke();
    
    // Draw stars with subtle glow (more like the reference image)
    stars.forEach((star) => {
      // Outer glow
      const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, 6
      );
      gradient.addColorStop(0, isDark ? 'rgba(191, 219, 254, 0.9)' : 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(1, isDark ? 'rgba(37, 99, 235, 0)' : 'rgba(255, 255, 255, 0)');
      
      ctx.beginPath();
      ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Star center - smaller, more defined
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#bfdbfe' : '#ffffff';
      ctx.fill();
    });
    
    // Add goal text next to the final star (like "Harvard" in the reference image)
    const lastStar = stars[stars.length - 1];
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    // Add stronger glow effect for text
    ctx.shadowColor = isDark ? 'rgba(191, 219, 254, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Position text to the left of the final star
    const textX = lastStar.x - 15;
    const textY = lastStar.y;
    
    // Create text glow
    // First render - outer glow
    ctx.fillStyle = isDark ? 'rgba(147, 197, 253, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(goal, textX, textY);
    
    // Second render - stronger inner glow
    ctx.shadowBlur = 4;
    ctx.shadowColor = isDark ? 'rgba(191, 219, 254, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(goal, textX, textY);
    
    // Final render - solid text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(goal, textX, textY);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
  }, [isDark, goal]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Redraw everything
      const event = new Event('resize');
      window.dispatchEvent(event);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSave = () => {
    onUpdateGoal({
      title: editedGoal,
      identity: editedIdentity,
      deadline: editedDeadline
    });
    setIsEditing(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate days remaining
  const daysRemaining = () => {
    const today = new Date();
    const targetDate = new Date(deadline);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        {/* Star path background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-[#030726] dark:to-[#0a1445]">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full" 
            style={{ position: 'absolute', top: 0, left: 0 }}
          ></canvas>
        </div>
        
        {/* Content overlay */}
        <div className="relative p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-3 text-white">
              {isEditing ? (
                <input
                  type="text"
                  value={editedGoal}
                  onChange={(e) => setEditedGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xl font-bold bg-white/10 backdrop-blur-sm rounded border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Enter your goal"
                />
              ) : (
                <h2 className="text-xl font-bold flex items-center">
                  <Target size={20} className="mr-2" />
                  {goal}
                </h2>
              )}

              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User size={16} className="mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={editedIdentity}
                      onChange={(e) => setEditedIdentity(e.target.value)}
                      className="w-full px-3 py-1 text-sm bg-white/10 backdrop-blur-sm rounded border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Your identity"
                    />
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 flex-shrink-0" />
                    <input
                      type="date"
                      value={editedDeadline}
                      onChange={(e) => setEditedDeadline(e.target.value)}
                      className="w-full px-3 py-1 text-sm bg-white/10 backdrop-blur-sm rounded border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <p className="flex items-center">
                    <User size={16} className="mr-2" />
                    {identity}
                  </p>
                  <p className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {formatDate(deadline)}
                  </p>
                  <p className="flex items-center text-blue-100">
                    <Clock size={16} className="mr-2" />
                    {daysRemaining()} days remaining
                  </p>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-white text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 bg-indigo-700 text-white rounded-md text-sm font-medium hover:bg-indigo-800"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-white opacity-80 hover:opacity-100 rounded-full hover:bg-white/10"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-800">
          <div
            className="h-full bg-teal-500 dark:bg-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-700 dark:text-dark-text">
            Overall Progress: {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
} 
