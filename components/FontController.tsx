import React, { useState, useRef, useEffect } from 'react';
import { Type, RotateCcw, X, Settings2, Languages, HelpCircle, List, CheckCircle, Info, Bookmark } from 'lucide-react';
import { FontScales } from '../types';

interface FontControllerProps {
  scales: FontScales;
  onScalesChange: (newScales: FontScales) => void;
}

export const FontController: React.FC<FontControllerProps> = ({ scales, onScalesChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    onScalesChange({
      global: 1,
      question: 1,
      option: 1.2,
      ui: 1,
      tag: 1,
      answer: 1,
      detail: 1
    });
  };

  const updateScale = (key: keyof FontScales, value: number) => {
    onScalesChange({ ...scales, [key]: value });
  };

  return (
    <div ref={menuRef} className="fixed top-4 right-4 z-[100] flex flex-col items-end">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-amber-500 text-red-900 shadow-lg scale-110' : 'bg-black/20 text-white/30 hover:bg-black/40 hover:text-white/80'}`}
        title="字体设置"
      >
        {isOpen ? <X size={20} /> : <Settings2 size={20} />}
      </button>

      {isOpen && (
        <div className="mt-3 p-5 bg-red-950/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl w-80 max-h-[85vh] overflow-y-auto custom-scrollbar animate-fade-in origin-top-right">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-red-950/20 backdrop-blur-md pb-2 z-10">
            <h3 className="text-amber-100 font-song font-bold text-base flex items-center gap-2">
              <Type size={18} /> 字体细化调节
            </h3>
          </div>

          <div className="space-y-6">
            <ScaleSlider 
              label="全局基础缩放" 
              icon={<Languages size={14} />} 
              value={scales.global} 
              onChange={(v) => updateScale('global', v)} 
            />
            <ScaleSlider 
              label="题目内容" 
              icon={<HelpCircle size={14} />} 
              value={scales.question} 
              onChange={(v) => updateScale('question', v)} 
            />
            <ScaleSlider 
              label="选项文本" 
              icon={<List size={14} />} 
              value={scales.option} 
              onChange={(v) => updateScale('option', v)} 
            />
            <ScaleSlider 
              label="题目标签" 
              icon={<Bookmark size={14} />} 
              value={scales.tag} 
              onChange={(v) => updateScale('tag', v)} 
            />
            <ScaleSlider 
              label="正确答案展示" 
              icon={<CheckCircle size={14} />} 
              value={scales.answer} 
              onChange={(v) => updateScale('answer', v)} 
            />
            <ScaleSlider 
              label="详细解析文字" 
              icon={<Info size={14} />} 
              value={scales.detail} 
              onChange={(v) => updateScale('detail', v)} 
            />
            <ScaleSlider 
              label="导航按钮" 
              icon={<Settings2 size={14} />} 
              value={scales.ui} 
              onChange={(v) => updateScale('ui', v)} 
            />
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
             <button 
                onClick={handleReset}
                className="text-xs text-amber-200/50 hover:text-amber-400 flex items-center gap-1 transition-colors"
             >
                <RotateCcw size={12} />
                重置所有设置
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ScaleSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (val: number) => void;
}

const ScaleSlider: React.FC<ScaleSliderProps> = ({ label, icon, value, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-amber-500/70 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-amber-400 font-mono text-xs">{Math.round(value * 100)}%</span>
    </div>
    <div className="flex items-center gap-3">
      <input 
        type="range" 
        min="0.5" 
        max="4.0" 
        step="0.05" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-colors"
      />
    </div>
  </div>
);