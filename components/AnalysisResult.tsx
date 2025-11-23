import React, { useEffect, useState } from 'react';
import { ImageAnalysis } from '../types';
import { CheckCircle2, Zap, TrendingUp, Search } from 'lucide-react';

interface AnalysisResultProps {
  analysis: ImageAnalysis;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  return (
    <div className="w-full h-full flex flex-col animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30">
            <Zap className="text-indigo-400 h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-white">AI Quality Report</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        <ScoreCard label="Sharpness" score={analysis.sharpnessScore} color="text-cyan-400" delay={100} />
        <ScoreCard label="Lighting" score={analysis.lightingScore} color="text-yellow-400" delay={200} />
        <ScoreCard label="Composition" score={analysis.compositionScore} color="text-fuchsia-400" delay={300} />
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <div className="animate-fade-in-up delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
          <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="h-3 w-3" /> Viral Potential
          </h4>
          <p className="text-sm md:text-base text-white font-medium bg-white/5 p-4 rounded-xl border-l-2 border-indigo-500 shadow-lg">
            {analysis.viralPotential}
          </p>
        </div>

        <div className="animate-fade-in-up delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
           <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3 flex items-center gap-2">
            <Search className="h-3 w-3" /> Recommended Improvements
          </h4>
          <ul className="space-y-3">
            {analysis.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm md:text-base bg-black/20 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const ScoreCard: React.FC<{ label: string; score: number; color: string; delay: number }> = ({ label, score, color, delay }) => {
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        let startTime: number;
        let rAF: number;
        
        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / 1500, 1); // 1.5s duration
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out
            
            setAnimatedValue(progress === 1 ? score : score * ease);
            
            if (progress < 1) {
                rAF = requestAnimationFrame(animate);
            }
        };

        const timer = setTimeout(() => {
            rAF = requestAnimationFrame(animate);
        }, delay);

        return () => {
            clearTimeout(timer);
            if (rAF) cancelAnimationFrame(rAF);
        };
    }, [score, delay]);
    
    // Circle configuration
    const radius = 26;
    const center = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedValue / 10) * circumference;

    // Helper to get glow class based on text color
    const getGlowClass = (c: string) => {
        if (c.includes('cyan')) return 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]';
        if (c.includes('yellow')) return 'drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]';
        if (c.includes('fuchsia')) return 'drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]';
        return '';
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center justify-center border border-white/10 shadow-lg animate-fade-in-up opacity-0 group hover:bg-white/10 transition-colors" style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}>
            <div className="relative h-16 w-16 flex items-center justify-center mb-3">
                <svg className="transform -rotate-90 w-16 h-16 overflow-visible">
                    {/* Background Track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-white/10"
                    />
                    {/* Active Progress */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`${color} ${getGlowClass(color)}`}
                        strokeLinecap="round"
                    />
                </svg>
                <span className="absolute text-xl font-bold text-white tracking-tight">{Math.round(animatedValue)}</span>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest text-center">{label}</span>
        </div>
    )
}