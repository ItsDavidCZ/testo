import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage, className = '' }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Tilt State for Parallax Effect
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  // Use Pointer Events for unified mouse/touch handling
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  }, [handleMove]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
    
    // Calculate Tilt for Parallax Effect
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation (max 5 degrees)
        const rotateX = ((y - centerY) / centerY) * -5; 
        const rotateY = ((x - centerX) / centerX) * 5;

        setTilt({ x: rotateX, y: rotateY });
    }
  }, [isDragging, handleMove]);
  
  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
      setIsDragging(false);
      // Reset tilt smoothly
      setTilt({ x: 0, y: 0 });
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
          // Ignore if not captured
      }
  }, []);

  // Fallback: Global listener if pointer capture fails
  useEffect(() => {
    const handleGlobalUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
        window.removeEventListener('mouseup', handleGlobalUp);
        window.removeEventListener('touchend', handleGlobalUp);
    }
  }, []);

  return (
    <div 
      className="perspective-1000"
      style={{ perspective: '1000px' }}
    >
        <div 
        ref={containerRef}
        className={`relative w-full overflow-hidden select-none group cursor-ew-resize rounded-2xl border border-white/10 shadow-2xl ${className} touch-none transition-transform duration-100 ease-out`} 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ 
            aspectRatio: '16/9',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d'
        }}
        >
        {/* After Image (Background) */}
        <img 
            src={afterImage} 
            alt="After" 
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
        />
        
        {/* Label After */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full z-10 border border-white/10 pointer-events-none transition-transform duration-300 transform translate-z-10" style={{ transform: 'translateZ(20px)' }}>
            AFTER
        </div>

        {/* Before Image (Foreground - Clipped) */}
        <div 
            className="absolute top-0 left-0 h-full overflow-hidden pointer-events-none border-r border-white/50"
            style={{ width: `${sliderPosition}%` }}
        >
            <img 
            src={beforeImage} 
            alt="Before" 
            className="absolute top-0 left-0 max-w-none h-full object-cover"
            style={{ width: containerRef.current ? containerRef.current.offsetWidth : '100%' }}
            draggable={false}
            />
            {/* Label Before */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full z-10 border border-white/10" style={{ transform: 'translateZ(20px)' }}>
            BEFORE
            </div>
        </div>

        {/* Slider Handle */}
        <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20 flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
        >
            <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transform -translate-x-1/2 text-black transition-transform hover:scale-110 active:scale-95">
            <MoveHorizontal size={16} />
            </div>
        </div>
        
        {/* Shine Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none mix-blend-overlay"></div>
        </div>
    </div>
  );
};
