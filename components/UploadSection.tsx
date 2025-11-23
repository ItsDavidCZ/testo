import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles, AlertTriangle, RefreshCw, Check, Loader2, Download, Wand2, Undo, Redo, Link as LinkIcon, ArrowRight, HelpCircle, ToggleLeft, ToggleRight, ScanLine, Zap } from 'lucide-react';
import { analyzeImageQuality, enhanceImage } from '../services/geminiService';
import { AnalysisResult } from './AnalysisResult';
import { ImageAnalysis, AnalysisStatus } from '../types';

const LOADING_STEPS = [
    "Initializing Neural Vision",
    "Scanning Texture Geometry",
    "Evaluating Lighting Conditions",
    "Measuring Image Sharpness",
    "Calculating Viral Potential",
    "Generating Enhancement Map"
];

const ENHANCEMENT_STEPS = [
    "Uploading to Quantum Engine",
    "Upscaling Resolution (400%)",
    "Restoring High-Freq Details",
    "Correcting Color Histograms",
    "Reducing ISO Noise Artifacts",
    "Polishing Final Output"
];

export const UploadSection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState(false);

  // Auto-Enhance Feature
  const [autoEnhance, setAutoEnhance] = useState(false);

  // History for Undo/Redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // URL Input
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // Download Confirmation Modal State
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

  // Cycle through loading steps for a premium feel
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let progressInterval: ReturnType<typeof setInterval>;

    const isActive = status === AnalysisStatus.ANALYZING || isEnhancing;

    if (isActive) {
        setLoadingStepIndex(0);
        setProgress(0);
        
        const steps = isEnhancing ? ENHANCEMENT_STEPS : LOADING_STEPS;
        const speed = isEnhancing ? 0.2 : 1; 
        
        progressInterval = setInterval(() => {
            setProgress(prev => {
                const limit = 95;
                if (prev >= limit) return limit;
                return prev + speed;
            });
        }, 50);

        interval = setInterval(() => {
            setLoadingStepIndex(prev => (prev + 1) % steps.length);
        }, isEnhancing ? 2000 : 800);

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }
  }, [status, isEnhancing]);

  // Auto-trigger enhancement logic
  useEffect(() => {
      if (status === AnalysisStatus.COMPLETE && autoEnhance && !enhanced && !isEnhancing && !error && analysis) {
          const timer = setTimeout(() => {
              handleEnhance();
          }, 800);
          return () => clearTimeout(timer);
      }
  }, [status, autoEnhance, enhanced, isEnhancing, error, analysis]);


  const processFile = async (selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Unsupported file format. Please upload JPG, PNG, or WebP images.");
      setStatus(AnalysisStatus.ERROR);
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { 
         setError("File size too large. Please upload an image smaller than 10MB.");
         setStatus(AnalysisStatus.ERROR);
         return;
    }

    setFile(selectedFile);
    setError(null);
    setAnalysis(null);
    setEnhanced(false);
    setIsEnhancing(false);
    setHistory([]);
    setHistoryIndex(-1);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setHistory([result]);
      setHistoryIndex(0);
      handleAnalyze(result, selectedFile.type);
    };
    reader.onerror = () => {
        setError("Failed to read file. The file might be corrupted.");
        setStatus(AnalysisStatus.ERROR);
    }
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!urlInput) return;

      setIsLoadingUrl(true);
      setError(null);

      try {
          if (!navigator.onLine) throw new Error("No internet connection.");

          const targetUrl = urlInput.trim();
          let blob: Blob | null = null;
          let response: Response | null = null;
          
          try {
              response = await fetch(targetUrl);
              if (response.ok) blob = await response.blob();
          } catch (directErr) {
              console.warn("Direct fetch failed, trying proxy...");
          }

          if (!blob) {
               const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
               response = await fetch(proxyUrl);
               if (!response.ok) throw new Error(`Failed to fetch image via proxy (Status: ${response.status})`);
               blob = await response.blob();
          }

          if (!blob) throw new Error("Could not retrieve image data.");

          let mimeType = blob.type;
          if (!mimeType || mimeType === 'application/octet-stream' || !mimeType.startsWith('image/')) {
              const extension = targetUrl.split(/[#?]/)[0].split('.').pop()?.toLowerCase();
              if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
              else if (extension === 'png') mimeType = 'image/png';
              else if (extension === 'webp') mimeType = 'image/webp';
              else if (extension === 'heic') mimeType = 'image/heic';
          }
          if (!mimeType || !mimeType.startsWith('image/')) mimeType = 'image/jpeg';
          
          const file = new File([blob], "downloaded-image", { type: mimeType });
          await processFile(file);
      } catch (err: any) {
          console.error(err);
          let msg = "Could not load image.";
          if (err.message.includes("Failed to fetch")) {
              msg = "Network Error: Unable to access this image. CORS/Firewall block.";
          } else {
              msg = err.message;
          }
          setError(msg);
      } finally {
          setIsLoadingUrl(false);
      }
  };

  const handleAnalyze = async (base64Data: string, mimeType: string) => {
    setStatus(AnalysisStatus.ANALYZING);
    try {
      if (!navigator.onLine) throw new Error("No internet connection.");
      const base64Image = base64Data.split(',')[1];
      const result = await analyzeImageQuality(base64Image, mimeType);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnalysis(result);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleEnhance = async () => {
      if (!preview) return;
      setIsEnhancing(true);
      setError(null);
      
      try {
           if (!navigator.onLine) throw new Error("No internet connection.");
           const matches = preview.match(/^data:(.+);base64,(.+)$/);
           if (!matches) throw new Error("Invalid image source.");
           
           const mimeType = matches[1];
           const base64Data = matches[2];
           const result = await enhanceImage(base64Data, mimeType);
           const newImage = `data:${result.mimeType};base64,${result.data}`;
           
           setPreview(newImage);
           const newHistory = [...history.slice(0, historyIndex + 1), newImage];
           setHistory(newHistory);
           setHistoryIndex(newHistory.length - 1);
           setEnhanced(true);
           setProgress(100);
      } catch (err: any) {
          console.error(err);
          setError(err.message || "Failed to enhance image.");
      } finally {
          setIsEnhancing(false);
      }
  };

  const handleUndo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setPreview(history[newIndex]);
          setEnhanced(newIndex > 0);
      }
  };

  const handleRedo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setPreview(history[newIndex]);
          setEnhanced(newIndex > 0);
      }
  };

  const initiateDownload = () => setShowDownloadConfirm(true);

  const confirmDownload = () => {
    if (preview) {
        const link = document.createElement('a');
        link.href = preview;
        link.download = `lumina-enhanced-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    setShowDownloadConfirm(false);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setStatus(AnalysisStatus.IDLE);
    setAnalysis(null);
    setError(null);
    setEnhanced(false);
    setIsEnhancing(false);
    setHistory([]);
    setHistoryIndex(-1);
    setUrlInput('');
    setShowDownloadConfirm(false);
  };

  return (
    <section id="upload" className="py-32 px-4 relative bg-[#020202]">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Analyze & Enhance
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-light">
            Upload your photo or paste a URL. Our Neural Engine handles the rest.
          </p>
        </div>

        {!preview ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="group relative border border-dashed border-white/10 rounded-3xl p-10 md:p-16 text-center hover:border-indigo-500/50 transition-all duration-500 bg-[#0A0A0A]/50 backdrop-blur-sm animate-fade-in-up overflow-hidden"
          >
             {/* Hover Gradient */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="flex flex-col items-center gap-8 relative z-10">
              <div className="p-6 bg-[#111] rounded-2xl shadow-2xl border border-white/5 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-indigo-500/20">
                <Upload className="h-10 w-10 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              
              <div>
                <p className="text-2xl font-bold text-white mb-3 tracking-tight">Drop your image here</p>
                <div className="flex flex-col items-center gap-4">
                    <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    />
                    <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                    >
                    Select from Device
                    </label>
                </div>
              </div>
              
              {/* URL Input & Auto Enhance Row */}
              <div className="w-full max-w-md space-y-4">
                  
                  {/* URL Input - Pill Shape */}
                  <form onSubmit={handleUrlSubmit} className="relative group/url">
                       <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full opacity-0 group-focus-within/url:opacity-20 blur transition-opacity"></div>
                       <div className="relative flex items-center bg-black/60 border border-white/10 rounded-full overflow-hidden transition-colors focus-within:border-white/30">
                           <div className="pl-4 text-gray-500">
                               <LinkIcon className="w-4 h-4" />
                           </div>
                           <input 
                              type="url" 
                              placeholder="Or paste image URL here..." 
                              className="w-full bg-transparent border-none text-sm text-white px-4 py-3.5 focus:ring-0 placeholder:text-gray-600 font-medium"
                              value={urlInput}
                              onChange={(e) => setUrlInput(e.target.value)}
                           />
                           <button 
                              type="submit"
                              disabled={!urlInput || isLoadingUrl}
                              className="mr-1.5 p-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all disabled:opacity-0 disabled:scale-75"
                           >
                              {isLoadingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                           </button>
                       </div>
                  </form>

                  {/* Auto Enhance Toggle */}
                  <div 
                    className="flex items-center justify-center gap-3 cursor-pointer group/toggle opacity-70 hover:opacity-100 transition-opacity"
                    onClick={() => setAutoEnhance(!autoEnhance)}
                  >
                     <span className={`text-xs font-semibold tracking-wider uppercase ${autoEnhance ? 'text-indigo-400' : 'text-gray-500'}`}>Auto-Apply Magic</span>
                     {autoEnhance ? (
                         <ToggleRight className="w-6 h-6 text-indigo-500 fill-indigo-500/20 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                     ) : (
                         <ToggleLeft className="w-6 h-6 text-gray-700" />
                     )}
                  </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4"/>{error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {/* Main Editor Interface */}
            <div className="relative rounded-3xl overflow-hidden bg-[#050505] border border-white/10 shadow-2xl flex flex-col md:flex-row min-h-[600px]">
              
              {/* Header Controls (Overlay) */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-40 pointer-events-none">
                  {/* Badges */}
                  <div className="flex gap-2">
                       {enhanced && (
                         <div className="bg-emerald-500/90 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg pointer-events-auto animate-fade-in-up">
                            <Check className="w-3.5 h-3.5" /> ENHANCED
                         </div>
                       )}
                  </div>

                  {/* Tools */}
                  <div className="flex items-center gap-2 pointer-events-auto">
                     {(history.length > 1) && !isEnhancing && (
                        <div className="flex items-center bg-black/60 rounded-full p-1 backdrop-blur-xl border border-white/10 shadow-lg mr-2">
                             <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 text-white transition-colors"><Undo className="w-4 h-4" /></button>
                             <div className="w-px h-3 bg-white/20 mx-1"></div>
                             <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 text-white transition-colors"><Redo className="w-4 h-4" /></button>
                        </div>
                     )}
                     <button onClick={reset} className="p-2.5 bg-black/60 hover:bg-red-500/20 hover:text-red-400 text-gray-300 rounded-full backdrop-blur-xl transition-all border border-white/10"><X className="h-4 w-4" /></button>
                  </div>
              </div>

              {/* LEFT: Image Preview Area */}
              <div className="relative flex-1 bg-[#020202] flex items-center justify-center p-4 md:p-8 overflow-hidden">
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className={`max-h-[500px] object-contain rounded-lg shadow-2xl transition-all duration-700 ${enhanced ? 'brightness-110 contrast-105' : ''}`} 
                        />
                    </div>
                    
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                    
                    {/* Scanning Laser Effect - Enhanced */}
                    {(status === AnalysisStatus.ANALYZING || isEnhancing) && (
                        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                             {/* Wider, more subtle scan beam */}
                             <div className={`absolute left-0 right-0 h-1 shadow-[0_0_50px_4px] animate-scan z-30 ${isEnhancing ? 'bg-fuchsia-500 shadow-fuchsia-500' : 'bg-cyan-400 shadow-cyan-400'} opacity-75`}></div>
                             <div className={`absolute left-0 right-0 h-24 bg-gradient-to-b ${isEnhancing ? 'from-fuchsia-500/20' : 'from-cyan-400/20'} to-transparent animate-scan z-20`} style={{animationDelay: '0.05s'}}></div>
                        </div>
                    )}
              </div>

              {/* RIGHT: Sidebar / Loading Overlay */}
              <div className="relative w-full md:w-[400px] bg-[#0A0A0A] border-l border-white/5 flex flex-col">
                 
                 {/* LOADING OVERLAY - FULL COVERAGE TO PREVENT OVERLAP */}
                 {(status === AnalysisStatus.ANALYZING || isEnhancing) && (
                     <div className="absolute inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-fade-in-up">
                         {/* Complex Reactor Spinner */}
                         <div className="relative w-28 h-28 mb-10 flex items-center justify-center">
                             {/* Outer Ring */}
                             <div className={`absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_8s_linear_infinite]`}></div>
                             
                             {/* Middle Active Ring */}
                             <div className={`absolute inset-2 rounded-full border-2 border-transparent border-t-current border-b-current animate-[spin_3s_linear_infinite] ${isEnhancing ? 'text-fuchsia-500/50' : 'text-cyan-500/50'}`}></div>
                             
                             {/* Inner Fast Ring */}
                             <div className={`absolute inset-4 rounded-full border-2 border-transparent border-l-current border-r-current animate-[spin_1.5s_linear_infinite_reverse] ${isEnhancing ? 'text-fuchsia-400' : 'text-cyan-400'}`}></div>
                             
                             {/* Core Icon */}
                             <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm m-6 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                 {isEnhancing ? 
                                    <Zap className="w-6 h-6 text-fuchsia-400 animate-pulse drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]" /> : 
                                    <ScanLine className="w-6 h-6 text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                 }
                             </div>
                         </div>
                         
                         {/* Wave Progress Bar */}
                         <div className="w-full max-w-[240px] h-2 bg-white/10 rounded-full overflow-hidden mb-8 relative shadow-inner">
                             {/* Background pulse */}
                             <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                             
                             <div 
                                className={`h-full rounded-full relative overflow-hidden transition-all duration-300 ease-out`}
                                style={{ width: `${progress}%` }}
                             >
                                 {/* Animated Wave/Shimmer Gradient Fill */}
                                 <div className={`absolute inset-0 w-full h-full bg-gradient-to-r ${isEnhancing ? 'from-fuchsia-600 via-pink-400 to-purple-600' : 'from-cyan-600 via-teal-400 to-blue-600'} bg-[length:200%_100%] animate-shimmer`}></div>
                                 
                                 {/* White Tip Glow */}
                                 <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 blur-[4px] shadow-[0_0_15px_white]"></div>
                             </div>
                         </div>

                         {/* Text Info */}
                         <div className="space-y-2">
                             <h3 className="text-2xl font-bold text-white tracking-tight">{isEnhancing ? 'Enhancing Image' : 'Analyzing Quality'}</h3>
                             <p className="text-sm text-gray-400 font-mono tracking-wide min-h-[20px] animate-pulse">
                                {isEnhancing ? ENHANCEMENT_STEPS[loadingStepIndex] : LOADING_STEPS[loadingStepIndex]}...
                             </p>
                         </div>
                     </div>
                 )}

                 {/* ERROR STATE */}
                 {status === AnalysisStatus.ERROR && (
                      <div className="absolute inset-0 z-40 bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center">
                           <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Process Failed</h3>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">{error}</p>
                            <button onClick={error?.includes("enhance") ? handleEnhance : () => file && processFile(file)} className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200">
                                Try Again
                            </button>
                      </div>
                 )}

                 {/* RESULTS CONTENT (Scrollable) */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {status === AnalysisStatus.COMPLETE && analysis && !isEnhancing && (!error || error.includes("enhance")) && (
                        <AnalysisResult analysis={analysis} />
                    )}
                 </div>

                 {/* BOTTOM ACTION BAR */}
                 {status === AnalysisStatus.COMPLETE && !isEnhancing && !error && (
                     <div className="p-6 border-t border-white/5 bg-[#080808]">
                        {!enhanced ? (
                            <button 
                                onClick={handleEnhance}
                                className="w-full group relative px-6 py-4 bg-white text-black rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent translate-x-[-200%] animate-shimmer"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600" /> Apply Magic Enhancement
                                </span>
                            </button>
                        ) : (
                            <button 
                                onClick={initiateDownload}
                                className="w-full px-6 py-4 bg-[#151515] border border-white/10 text-white rounded-xl font-bold hover:bg-[#202020] transition-all flex items-center justify-center gap-2 group"
                            >
                                <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" /> Download Result
                            </button>
                        )}
                     </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Modal */}
      {showDownloadConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500"></div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to download?</h3>
                <p className="text-gray-400 mb-6 text-sm">Your image has been enhanced to 4K resolution.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowDownloadConfirm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                    <button onClick={confirmDownload} className="px-5 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200">Download</button>
                </div>
            </div>
        </div>
      )}
    </section>
  );
};