import React from 'react';
import { Sparkles, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setIsOpen(false);
      }
  };

  return (
    <nav className="fixed w-full z-50 bg-[#020202]/70 backdrop-blur-2xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => scrollToSection('products')}>
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="relative">
                  <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-white/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Lumina<span className="text-indigo-400">.ai</span>
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-12 flex items-baseline space-x-1">
                {['Products', 'Features', 'About'].map((item) => (
                    <button 
                        key={item}
                        onClick={() => scrollToSection(item.toLowerCase())} 
                        className="text-gray-400 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white/5"
                    >
                        {item}
                    </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
             <button 
                onClick={() => scrollToSection('upload')}
                className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
             >
                Get Started
             </button>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-b border-white/5">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => scrollToSection('products')} className="text-gray-300 hover:text-white block px-3 py-4 rounded-md text-base font-bold w-full text-left">Products</button>
            <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white block px-3 py-4 rounded-md text-base font-bold w-full text-left">Features</button>
            <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-white block px-3 py-4 rounded-md text-base font-bold w-full text-left">About</button>
             <button 
                onClick={() => scrollToSection('upload')}
                className="w-full mt-4 bg-white text-black px-5 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
             >
                Get Started
             </button>
          </div>
        </div>
      )}
    </nav>
  );
};