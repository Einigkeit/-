import React, { useState, useRef, useEffect } from 'react';
import { Type, RotateCcw, X } from 'lucide-react';

interface FontControllerProps {
  scale: number;
  onScaleChange: (newScale: number) => void;
}

export const FontController: React.FC<FontControllerProps> = ({ scale, onScaleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReset = () => {
    onScaleChange(1);
  };

  return (
    <div ref={menuRef} className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {/* Trigger Button - Unobtrusive */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-amber-500 text-red-900 shadow-lg scale-110' : 'bg-black/20 text-white/30 hover:bg-black/40 hover:text-white/80'}`}
        title="调节字体大小"
      >
        {isOpen ? <X size={20} /> : <Type size={20} />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="mt-3 p-4 bg-red-950/90 backdrop-blur-md border border-amber-500/30 rounded-xl shadow-2xl w-64 animate-fade-in origin-top-right">
          <div className="flex items-center justify-between mb-4">
            <span className="text-amber-100 font-song font-bold text-sm">全局字体缩放</span>
            <span className="text-amber-500/60 text-xs font-mono">{Math.round(scale * 100)}%</span>
          </div>

          <div className="flex items-center gap-3">
             <span className="text-xs text-amber-500/50">A</span>
             <input 
                type="range" 
                min="0.8" 
                max="1.5" 
                step="0.05" 
                value={scale} 
                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-lg text-amber-500/80">A</span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
             <button 
                onClick={handleReset}
                className="text-xs text-amber-200/50 hover:text-amber-400 flex items-center gap-1 transition-colors"
             >
                <RotateCcw size={12} />
                重置默认
             </button>
          </div>
        </div>
      )}
    </div>
  );
};