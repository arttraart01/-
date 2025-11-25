import { useState, useRef, useEffect, FC } from 'react';
import { Mix } from '../types';

interface MixPlayerProps {
  mix: Mix;
}

export const MixPlayer: FC<MixPlayerProps> = ({ mix }) => {
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Total duration is 15s (3 clips * 5s)
  // We force cut each clip at 5 seconds for the "mashup" effect
  const CLIP_LIMIT = 5; 
  const TOTAL_DURATION = 15;

  useEffect(() => {
    // Reset when mix changes
    setCurrentClipIndex(0);
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [mix.id]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.error("Play error", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentClipIndex]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    
    // Calculate global progress (0-100) based on 15s total
    const currentGlobalTime = (currentClipIndex * CLIP_LIMIT) + currentTime;
    setProgress((currentGlobalTime / TOTAL_DURATION) * 100);

    // Force switch if clip exceeds 5s
    if (currentTime >= CLIP_LIMIT) {
       handleNextClip();
    }
  };

  const handleNextClip = () => {
    if (currentClipIndex < mix.clips.length - 1) {
      setCurrentClipIndex(prev => prev + 1);
      // Auto-play next clip is handled by effect dependence on currentClipIndex + isPlaying
    } else {
      // End of mashup
      setIsPlaying(false);
      setCurrentClipIndex(0);
      setProgress(100);
    }
  };

  const togglePlay = () => {
    if (progress >= 100) {
        // Restart
        setCurrentClipIndex(0);
        setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700 max-w-sm mx-auto w-full aspect-[9/16] relative group">
      {/* Video Display: Strict 9:16 container with object-cover for best TikTok resolution */}
      <video
        key={mix.clips[currentClipIndex].url} // Key forces re-render/reload on source change
        ref={videoRef}
        src={mix.clips[currentClipIndex].url}
        className="w-full h-full object-cover"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNextClip}
        onClick={togglePlay}
      />

      {/* Overlay UI */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <h2 className="text-white font-bold text-xl drop-shadow-md line-clamp-2">{mix.title}</h2>
        <p className="text-white/80 text-sm drop-shadow-sm">{mix.description}</p>
      </div>

      {/* Play/Pause Button Overlay (only when paused) */}
      {!isPlaying && (
        <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity"
            onClick={togglePlay}
        >
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full border border-white/30 hover:bg-white/30 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Progress Bar & Segments */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-1 h-1">
         {[0, 1, 2].map((idx) => (
             <div key={idx} className="flex-1 bg-white/30 rounded-full overflow-hidden h-full">
                 <div 
                    className="h-full bg-primary transition-all duration-100 ease-linear"
                    style={{ 
                        width: idx < currentClipIndex ? '100%' : 
                               idx === currentClipIndex ? `${(videoRef.current?.currentTime || 0) / CLIP_LIMIT * 100}%` : '0%' 
                    }}
                 />
             </div>
         ))}
      </div>
      
      {/* Clip Indicator */}
      <div className="absolute bottom-8 right-4 px-2 py-1 bg-black/50 backdrop-blur text-xs text-white rounded font-mono border border-white/10">
        CLIP {currentClipIndex + 1}/3
      </div>
    </div>
  );
};