import React, { useState, useCallback } from 'react';
import { ClipUploader } from './components/ClipUploader';
import { MixPlayer } from './components/MixPlayer';
import { VideoClip, Mix } from './types';
import { generateBatchMixMetadata } from './services/geminiService';

// Constants
const CLIP_DURATION = 5; // 5 seconds per clip as the variable
const CLIPS_PER_MIX = 3; // A-B-C pattern
const TOTAL_DURATION = CLIP_DURATION * CLIPS_PER_MIX; // 15 seconds

// Themes for random selection or user choice
const THEMES = [
  "High Energy",
  "Chill Vibes",
  "Chaos Mode",
  "Travel Diary",
  "Foodie Heaven",
  "Fitness Motivation",
  "Cyberpunk",
  "Retro Style"
];

const BATCH_SIZES = [1, 5, 10, 15, 20];

function App() {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [batchSize, setBatchSize] = useState<number>(1);

  const handleClipsAdded = useCallback((newClips: VideoClip[]) => {
    setClips((prev) => [...prev, ...newClips]);
  }, []);

  const handleDeleteClip = (id: string) => {
    setClips(prev => prev.filter(c => c.id !== id));
  };

  const handleGenerateMix = async () => {
    if (clips.length < CLIPS_PER_MIX) {
      alert(`กรุณาอัปโหลดอย่างน้อย ${CLIPS_PER_MIX} คลิปเพื่อทำการ Remix (A-B-C Pattern)`);
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Get Metadata for the whole batch at once to save time
      const metadataList = await generateBatchMixMetadata(selectedTheme, batchSize);

      const newMixes: Mix[] = [];

      // 2. Loop to create the requested number of mixes
      for (let i = 0; i < batchSize; i++) {
        // A-B-C Logic: Select 3 random clips from the library
        // We create a shallow copy and shuffle it
        const shuffled = [...clips].sort(() => 0.5 - Math.random());
        const selectedClips = shuffled.slice(0, CLIPS_PER_MIX);

        // Get corresponding metadata or fallback to last one
        const meta = metadataList[i] || metadataList[0];

        newMixes.push({
          id: Date.now().toString() + i,
          clips: selectedClips,
          title: meta.title,
          description: meta.description,
          theme: selectedTheme,
          createdAt: Date.now(),
        });
      }

      setMixes(prev => [...newMixes, ...prev]);

    } catch (error) {
      console.error("Failed to generate mix", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-primary selection:text-white pb-20">
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                        <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h2.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875h-2.25A1.875 1.875 0 0 1 1.5 18.375V5.625Zm21 0c0-1.036-.84-1.875-1.875-1.875h-2.25C17.34 3.75 16.5 4.59 16.5 5.625v12.75c0 1.035.84 1.875 1.875 1.875h2.25c1.035 0 1.875-.84 1.875-1.875V5.625Z" clipRule="evenodd" />
                        <path d="M9.75 5.625c0-1.036.84-1.875 1.875-1.875h2.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875h-2.25a1.875 1.875 0 0 1-1.875-1.875V5.625Z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    ClipMasher <span className="text-primary text-xs uppercase px-1.5 py-0.5 rounded border border-primary/30">AI</span>
                </h1>
            </div>
            
            {/* API Key Status (Mock) */}
             <div className="text-xs text-slate-500 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${process.env.API_KEY ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {process.env.API_KEY ? 'AI Ready' : 'API Key Missing'}
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        
        {/* Section 1: Upload & Library */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Upload Raw Clips
                    </h2>
                    <ClipUploader onClipsAdded={handleClipsAdded} />
                    
                    <div className="space-y-4 mt-6">
                        {/* Theme Selection */}
                        <div>
                             <label className="block text-sm font-medium text-slate-300 mb-2">Target Vibe (Theme)</label>
                             <select 
                                value={selectedTheme}
                                onChange={(e) => setSelectedTheme(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                             >
                                 {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                        </div>

                        {/* Batch Size Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Quantity to Create
                                <span className="ml-2 text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">New!</span>
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {BATCH_SIZES.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setBatchSize(size)}
                                        className={`py-2 rounded-md text-sm font-semibold transition-all border ${
                                            batchSize === size 
                                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Generates {batchSize} unique {TOTAL_DURATION}s videos (A-B-C pattern).
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateMix}
                        disabled={clips.length < CLIPS_PER_MIX || isGenerating}
                        className={`w-full mt-6 py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                            ${clips.length < CLIPS_PER_MIX || isGenerating 
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-primary to-secondary hover:shadow-primary/25 hover:scale-[1.02]'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating {batchSize} videos...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                                </svg>
                                Generate Batch ({batchSize})
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="md:col-span-2">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span>Source Library ({clips.length})</span>
                    </h2>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        Recommended: ~{CLIP_DURATION}s per clip
                    </span>
                 </div>
                 
                 {clips.length === 0 ? (
                    <div className="border border-dashed border-slate-700 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500 h-64">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-50">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                        <p>No clips yet. Upload videos to start remixing!</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {clips.map((clip) => (
                            <div key={clip.id} className="relative group aspect-[9/16] bg-black rounded-lg overflow-hidden border border-slate-700">
                                <video src={clip.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">
                                    ~{CLIP_DURATION}s
                                </div>
                                <button 
                                    onClick={() => handleDeleteClip(clip.id)}
                                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                 )}
            </div>
        </section>

        {/* Section 2: Generated Mixes */}
        {mixes.length > 0 && (
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-purple-500">Output Gallery</span>
                            <span className="text-sm font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{mixes.length}</span>
                        </h2>
                        <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-green-400">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                            </svg>
                            TikTok Optimized (9:16)
                        </span>
                    </div>
                    <button 
                        onClick={() => setMixes([])} 
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mixes.map((mix) => (
                        <div key={mix.id} className="flex flex-col gap-4 animate-fadeIn">
                             <div className="relative">
                                <MixPlayer mix={mix} />
                                {/* Decorative elements */}
                                <div className="absolute -z-10 top-4 -right-2 w-full h-full bg-primary/20 rounded-2xl blur-xl opacity-30"></div>
                             </div>
                             
                             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg text-white leading-tight">{mix.title}</h3>
                                        <p className="text-xs text-primary font-medium mt-1 uppercase tracking-wider">{mix.theme}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                            {TOTAL_DURATION}s
                                        </span>
                                        <span className="text-[10px] text-slate-600 mt-1">A-B-C</span>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{mix.description}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

      </main>
    </div>
  );
}

export default App;