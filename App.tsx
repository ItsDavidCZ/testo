import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { UploadSection } from './components/UploadSection';
import { Layers, Zap, Shield, Camera, Info } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-indigo-500/30">
      <Navbar />
      
      <main>
        <div id="products">
            <Hero />
        </div>
        
        {/* Features Grid */}
        <section id="features" className="py-24 bg-surface/50 border-t border-white/5 relative overflow-hidden">
             {/* Background glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core Technology</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Built on the advanced Gemini architecture to deliver pixel-perfect results.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard 
                        icon={<Zap className="w-6 h-6 text-yellow-400" />}
                        title="Lightning Fast"
                        description="Powered by Gemini Flash 2.5 for sub-second analysis."
                        tooltip="Uses low-latency inference to process 4K images in under 1.5 seconds."
                        delay={0}
                    />
                    <FeatureCard 
                        icon={<Layers className="w-6 h-6 text-indigo-400" />}
                        title="Detail Recovery"
                        description="Hallucinates realistic textures where data is missing."
                        tooltip="Generative adversarial networks reconstruct lost high-frequency details."
                        delay={100}
                    />
                    <FeatureCard 
                        icon={<Camera className="w-6 h-6 text-pink-400" />}
                        title="Photo Realism"
                        description="Maintains skin texture and natural lighting."
                         tooltip="Preserves biological textures and physically accurate lighting models."
                         delay={200}
                    />
                    <FeatureCard 
                        icon={<Shield className="w-6 h-6 text-emerald-400" />}
                        title="Privacy First"
                        description="Your images are processed securely and not stored."
                        tooltip="Ephemeral processing ensures data is wiped immediately after the session."
                        delay={300}
                    />
                </div>
            </div>
        </section>

        <UploadSection />
      </main>

      <footer id="about" className="py-12 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Lumina AI. Inspired by Lepshee.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    tooltip: string;
    delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, tooltip, delay }) => (
    <div 
        className="group relative p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up opacity-0"
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
        <div className="flex justify-between items-start">
             {/* Tooltip Wrapper for Icon */}
            <div className="relative group/icon">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 cursor-help">
                    {icon}
                </div>
                {/* Tooltip Content (On Icon Hover) */}
                 <div className="absolute left-0 bottom-full mb-2 w-48 opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all duration-200 transform translate-y-2 group-hover/icon:translate-y-0 z-20 pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-md border border-white/10 text-xs text-gray-200 p-3 rounded-lg shadow-xl relative">
                        {tooltip}
                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-black/90 border-r border-b border-white/10 rotate-45"></div>
                    </div>
                </div>
            </div>
            
            <Info className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors opacity-50" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </div>
);

export default App;