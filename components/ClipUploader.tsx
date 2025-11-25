import { useRef, ChangeEvent, FC } from 'react';
import { VideoClip } from '../types';

interface ClipUploaderProps {
  onClipsAdded: (clips: VideoClip[]) => void;
}

export const ClipUploader: FC<ClipUploaderProps> = ({ onClipsAdded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newClips: VideoClip[] = [];

    Array.from(files).forEach((fileRaw) => {
      const file = fileRaw as File;
      // Basic validation for video types
      if (!file.type.startsWith('video/')) return;

      const url = URL.createObjectURL(file);
      
      // We generate a temp ID. In a real app, you might hash the file or use UUID.
      const clip: VideoClip = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        file,
        duration: 0, // Will be set when loaded, or assumed approx 5s for now
      };

      newClips.push(clip);
    });

    if (newClips.length > 0) {
      onClipsAdded(newClips);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full p-6 border-2 border-dashed border-slate-700 rounded-xl hover:border-primary transition-colors bg-slate-800/50 flex flex-col items-center justify-center text-center group cursor-pointer"
         onClick={() => fileInputRef.current?.click()}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/mp4,video/webm,video/ogg"
        multiple
        className="hidden"
      />
      <div className="p-4 bg-slate-700 rounded-full mb-3 group-hover:bg-primary transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white">อัปโหลดคลิปวิดีโอ</h3>
      <p className="text-slate-400 text-sm mt-1">เลือกหลายไฟล์พร้อมกัน (แนะนำคลิปละ ~5 วินาที)</p>
      <p className="text-xs text-slate-500 mt-2">MP4, WebM</p>
    </div>
  );
};