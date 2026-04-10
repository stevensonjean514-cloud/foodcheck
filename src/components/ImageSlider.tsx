import { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

interface ImageSliderProps {
  adImage: string;
  realityImage: string | null;
  itemName: string;
}

export default function ImageSlider({ adImage, realityImage, itemName }: ImageSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 select-none touch-none ${realityImage ? 'cursor-ew-resize' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {realityImage ? (
        <>
          <img
            src={realityImage}
            alt={`${itemName} - Reality`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={adImage}
              alt={`${itemName} - Ad`}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>

          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize touch-none"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center active:scale-110 transition-transform">
              <div className="flex space-x-0.5">
                <div className="w-0.5 h-5 bg-gray-400 rounded"></div>
                <div className="w-0.5 h-5 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>

          <div
            className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded font-bold text-sm shadow-lg transition-opacity"
            style={{ opacity: sliderPosition > 20 ? 1 : 0 }}
          >
            AD
          </div>

          <div
            className="absolute top-4 right-4 bg-yellow-500 text-gray-900 px-3 py-1 rounded font-bold text-sm shadow-lg transition-opacity"
            style={{ opacity: sliderPosition < 80 ? 1 : 0 }}
          >
            REAL
          </div>
        </>
      ) : (
        <>
          <img
            src={adImage}
            alt={`${itemName} - Ad`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center space-y-3 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <p className="text-white font-bold text-lg leading-snug">
              Be the first to upload a real photo
            </p>
            <p className="text-white/70 text-sm">
              Help the community see the truth
            </p>
          </div>
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded font-bold text-sm shadow-lg">
            AD
          </div>
          <div className="absolute top-4 right-4 bg-yellow-500 text-gray-900 px-3 py-1 rounded font-bold text-sm shadow-lg opacity-40">
            REAL
          </div>
        </>
      )}
    </div>
  );
}
