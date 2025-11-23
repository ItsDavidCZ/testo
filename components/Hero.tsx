import React from 'react';
import { ComparisonSlider } from './ComparisonSlider';
import { ChevronRight, Zap } from 'lucide-react';

export const Hero: React.FC = () => {
    const imageBefore = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop&blur=50";
    const imageAfter = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop";

  return (
    <section className="relative pt-40 pb-32 overflow-hidden bg-[#020202]">
        {/* Lepshee-style Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-[100%] blur-[120px] pointer-events-none mix-blend-screen opacity-60"></div>
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-float mix-blend-screen"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-xs font-semibold tracking-wide text-gray-300 mb-8 hover:bg-white/10 transition-colors cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
            POWERED BY GEMINI 2.5 FLASH
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
            Upscale with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 animate-gradient-x drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                Neural Precision
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Don't settle for pixels. We hallucinate the details you lost using generative AI. 
            <span className="text-gray-200"> Sharper. Cleaner. Better than reality.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
             <button 
                onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })} 
                className="group relative w-full sm:w-auto px-10 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent translate-x-[-200%] animate-shimmer"></div>
                <span className="relative flex items-center justify-center gap-2">
                    Start Enhancing <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                </span>
             </button>
             
             <button className="w-full sm:w-auto px-10 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 group backdrop-blur-md">
                See Examples <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
             </button>
          </div>
        </div>

        {/* Demo Slider Container with Glass Effect */}
        <div className="mt-12 relative max-w-6xl mx-auto">
            {/* Glow behind slider */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-50"></div>
            
            <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-sm p-2 shadow-2xl">
                <ComparisonSlider 
                    beforeImage={imageBefore}
                    afterImage={imageAfter}
                    className="rounded-xl"
                />
            </div>
            
            <div className="mt-6 flex justify-between items-center px-4 text-xs font-mono tracking-widest text-gray-500 uppercase">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Input: 1080p
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span> Output: 4K Neural
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};