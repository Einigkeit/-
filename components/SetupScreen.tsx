import React, { useState } from 'react';
import { Upload, Play, FileText, AlertCircle, Edit2, Trash2, BookOpen, Type } from 'lucide-react';
import { Button } from './Button';
import { Question, GameConfig } from '../types';

interface SetupScreenProps {
  onStartGame: (config: GameConfig) => void;
  initialConfig?: GameConfig | null;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, initialConfig }) => {
  const [title, setTitle] = useState(initialConfig?.title || '以赛促学明方向，笃行实干谋发展');
  const [subtitle, setSubtitle] = useState(initialConfig?.subtitle || '知识竞赛');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  // Independent scales for title and subtitle
  const [titleScale, setTitleScale] = useState(initialConfig?.titleScale || 1);
  const [subtitleScale, setSubtitleScale] = useState(initialConfig?.subtitleScale || 1);
  
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<Question[] | null>(initialConfig?.questions || null);

  const handleParse = () => {
    setError(null);
    try {
      if (!jsonInput.trim()) {
        throw new Error("请输入题库 JSON 内容");
      }
      
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON 格式错误：必须是题目数组");
      }

      if (parsed.length === 0) {
        throw new Error("题库为空");
      }

      // Basic validation
      const validQuestions: Question[] = parsed.map((q: any, idx: number) => {
        if (!q.text) throw new Error(`第 ${idx + 1} 题缺少题目内容 (text)`);
        if (q.type !== 'text' && (!q.options || !Array.isArray(q.options))) {
           throw new Error(`第 ${idx + 1} 题是选择题，但缺少选项数组 (options)`);
        }
        
        return {
          id: `q-${idx}`,
          type: q.type || 'single', // default to single choice
          text: q.text,
          options: q.options || [],
          answer: q.answer, // Can be number index or string
          explanation: q.explanation || ''
        };
      });

      setParsedQuestions(validQuestions);
    } catch (err: any) {
      setError(err.message);
      setParsedQuestions(null);
    }
  };

  const handleStart = () => {
    if (parsedQuestions) {
      onStartGame({
        title,
        subtitle,
        questions: parsedQuestions,
        titleScale,
        subtitleScale
      });
    }
  };

  const handleReset = () => {
    setParsedQuestions(null);
    setJsonInput('');
    setError(null);
  }

  const sampleJson = `[
  {
    "type": "single",
    "text": "党的二十届四中全会的主题是什么？",
    "options": ["选项A内容", "选项B内容", "选项C内容", "选项D内容"],
    "answer": 0
  },
  {
    "type": "multiple",
    "text": "以下属于“四个自信”的是？",
    "options": ["道路自信", "理论自信", "制度自信", "文化自信"],
    "answer": [0, 1, 2, 3]
  },
  {
    "type": "text",
    "text": "简述中国式现代化的本质要求。",
    "answer": "坚持中国共产党领导，坚持中国特色社会主义..."
  }
]`;

  return (
    <div className="max-w-5xl mx-auto w-full p-6 animate-fade-in flex flex-col items-center">
      {/* Title Section */}
      <div className="mb-10 text-center relative group w-full flex flex-col items-center gap-2">
        {isEditingTitle ? (
          <div className="flex flex-col items-center gap-4 animate-pop w-full max-w-4xl bg-black/40 p-6 rounded-2xl border border-amber-500/30 backdrop-blur-md">
             <div className="w-full">
               <label className="text-amber-500/60 text-xs mb-1 block font-song">竞赛主题</label>
               <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-b border-amber-500/50 text-3xl font-bold text-center text-amber-100 outline-none w-full py-2 font-song focus:border-amber-400 transition-colors"
                autoFocus
              />
             </div>
             <div className="w-full">
               <label className="text-amber-500/60 text-xs mb-1 block font-song">副标题</label>
               <input 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="bg-transparent border-b border-amber-500/50 text-2xl font-bold text-center text-amber-100 outline-none w-full py-2 font-song focus:border-amber-400 transition-colors"
              />
             </div>
             
             {/* Font Size Sliders */}
             <div className="w-full grid grid-cols-2 gap-8 mt-2">
                <div>
                  <div className="flex items-center justify-between text-amber-500/60 text-xs mb-2">
                     <span className="flex items-center gap-1"><Type size={14}/> 主标题大小</span>
                     <span>{Math.round(titleScale * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={titleScale} 
                    onChange={(e) => setTitleScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-amber-500/60 text-xs mb-2">
                     <span className="flex items-center gap-1"><Type size={14}/> 副标题大小</span>
                     <span>{Math.round(subtitleScale * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={subtitleScale} 
                    onChange={(e) => setSubtitleScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
             </div>

            <Button onClick={() => setIsEditingTitle(false)} variant="gold" className="px-6 py-2 mt-4 w-full">
              完成编辑
            </Button>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditingTitle(true)}
            className="cursor-pointer hover:scale-105 transition-transform duration-300 group relative p-6 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            <h1 
              className="font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 drop-shadow-md font-song leading-tight mb-4"
              style={{ fontSize: `${3.75 * titleScale}rem`, lineHeight: '1.1' }}
            >
              {title}
            </h1>
            <h2 
              className="font-bold text-amber-500/90 font-song tracking-widest"
              style={{ fontSize: `${2.25 * subtitleScale}rem` }}
            >
              {subtitle}
            </h2>
            <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={16} className="text-amber-400" />
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-amber-500/30 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                点击编辑标题与字体大小
            </div>
          </div>
        )}
        <div className="mt-4 h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full opacity-50"></div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden w-full max-w-4xl">
        <div className="p-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent h-px w-full"></div>
        
        <div className="p-8">
          {/* Step 1: Import */}
          {!parsedQuestions ? (
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-amber-100 flex items-center gap-2">
                  <FileText className="text-amber-400" />
                  导入题库
                </h2>
                <div className="text-sm text-amber-200/60 bg-amber-900/30 px-3 py-1 rounded-full border border-amber-500/20">
                  支持格式：JSON (单选/多选/简答)
                </div>
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center gap-3 text-red-200 animate-shake">
                  <AlertCircle size={20} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="relative">
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={12}
                  placeholder={sampleJson}
                  className="w-full bg-black/20 border-2 border-amber-900/50 rounded-xl px-6 py-4 text-amber-50 font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-y placeholder-white/20"
                />
                <div className="absolute top-2 right-2">
                   <Button 
                      variant="ghost" 
                      onClick={() => setJsonInput(sampleJson)}
                      className="text-xs py-1 px-2 h-auto"
                   >
                     填入示例
                   </Button>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleParse} 
                  variant="gold"
                  className="w-full py-4 text-lg shadow-amber-500/20"
                  icon={<Upload size={24} />}
                >
                  解析并预览
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Preview & Start
            <div className="space-y-8 animate-slide-up text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                <BookOpen size={40} className="text-green-400" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">题库导入成功</h2>
                <p className="text-amber-200/80 text-lg">
                  共导入 <strong className="text-white text-xl mx-1">{parsedQuestions.length}</strong> 道题目
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto bg-black/20 p-4 rounded-xl border border-white/10">
                 <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-amber-400">
                      {parsedQuestions.filter(q => q.type === 'single').length}
                    </span>
                    <span className="text-xs text-slate-300 uppercase mt-1">单选题</span>
                 </div>
                 <div className="flex flex-col items-center border-l border-white/10">
                    <span className="text-2xl font-bold text-amber-400">
                      {parsedQuestions.filter(q => q.type === 'multiple').length}
                    </span>
                    <span className="text-xs text-slate-300 uppercase mt-1">多选题</span>
                 </div>
                 <div className="flex flex-col items-center border-l border-white/10">
                    <span className="text-2xl font-bold text-amber-400">
                      {parsedQuestions.filter(q => q.type === 'text').length}
                    </span>
                    <span className="text-xs text-slate-300 uppercase mt-1">简答题</span>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleReset} 
                  variant="secondary"
                  className="flex-1 py-4"
                  icon={<Trash2 size={20} />}
                >
                  重新导入
                </Button>
                <Button 
                  onClick={handleStart} 
                  variant="gold"
                  className="flex-[2] py-4 text-xl shadow-amber-500/20"
                  icon={<Play size={24} />}
                >
                  开始竞赛
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-amber-200/30 text-sm font-song">
        {title}
      </div>
    </div>
  );
};