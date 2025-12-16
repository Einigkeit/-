import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, RefreshCcw, Home, CheckCircle2, XCircle, Trophy, HelpCircle, Check, X, LayoutGrid, GripHorizontal, MoveDiagonal } from 'lucide-react';
import { Question, GameConfig } from '../types';
import { Button } from './Button';

interface GameScreenProps {
  config: GameConfig;
  onExit: () => void;
}

interface AnswerState {
  selectedOptions: number[];
  isSubmitted: boolean;
  isCorrect: boolean | null;
}

export const GameScreen: React.FC<GameScreenProps> = ({ config, onExit }) => {
  const { questions, title, subtitle, titleScale = 1, subtitleScale = 1 } = config;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  
  // Resizable Header State - Default standard height
  const [headerHeight, setHeaderHeight] = useState(100); 
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);
  
  // Resizable Card State - Default desktop size
  const [cardSize, setCardSize] = useState({ width: 900, height: 550 });
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Persistent State for all questions
  const [answersState, setAnswersState] = useState<Record<number, AnswerState>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  
  // Counter Logic
  const currentTypeQuestions = questions.filter(q => q.type === currentQuestion.type);
  const currentTypeIndex = currentTypeQuestions.findIndex(q => q.id === currentQuestion.id) + 1;
  const totalTypeCount = currentTypeQuestions.length;
  
  const currentAnswerState = answersState[currentIndex] || {
    selectedOptions: [],
    isSubmitted: false,
    isCorrect: null
  };

  const { selectedOptions, isSubmitted, isCorrect } = currentAnswerState;

  // Auto-dismiss feedback
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showFeedback) {
      timer = setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showFeedback]);

  // Header Drag Logic
  const handleHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingHeader(true);
  }, []);

  // Card Resize Logic
  const handleCardMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCard(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Header Resizing
      if (isDraggingHeader && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        let newHeight = e.clientY - containerRect.top;
        const minHeight = 60;
        const maxHeight = containerRect.height * 0.4;
        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;
        setHeaderHeight(newHeight);
      }

      // Card Resizing
      if (isDraggingCard) {
         const centerX = window.innerWidth / 2;
         const newWidth = Math.abs(e.clientX - centerX) * 2;
         
         const maxWidth = window.innerWidth - 40; 
         const clampedWidth = Math.max(500, Math.min(newWidth, maxWidth)); 
         
         const availableHeight = window.innerHeight - headerHeight - 80;
         const areaTop = headerHeight;
         const areaCenterY = areaTop + availableHeight / 2;
         
         const newHeight = Math.abs(e.clientY - areaCenterY) * 2;
         const clampedHeight = Math.max(300, Math.min(newHeight, availableHeight));

         setCardSize({
            width: clampedWidth,
            height: clampedHeight
         });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHeader(false);
      setIsDraggingCard(false);
    };

    if (isDraggingHeader || isDraggingCard) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingHeader, isDraggingCard, headerHeight]);

  const updateCurrentState = (updates: Partial<AnswerState>) => {
    setAnswersState(prev => ({
      ...prev,
      [currentIndex]: {
        ...(prev[currentIndex] || { selectedOptions: [], isSubmitted: false, isCorrect: null }),
        ...updates
      }
    }));
  };

  const handleOptionClick = (index: number) => {
    if (isSubmitted) return;

    let newSelected: number[] = [];
    if (currentQuestion.type === 'single') {
      newSelected = [index];
    } else if (currentQuestion.type === 'multiple') {
      newSelected = selectedOptions.includes(index)
        ? selectedOptions.filter(i => i !== index)
        : [...selectedOptions, index];
    }
    updateCurrentState({ selectedOptions: newSelected });
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    let correct: boolean | null = null;
    if (currentQuestion.type === 'single') {
      correct = currentQuestion.answer === selectedOptions[0];
    } else if (currentQuestion.type === 'multiple') {
      const correctIndices = Array.isArray(currentQuestion.answer) 
        ? (currentQuestion.answer as number[]).sort().toString()
        : [currentQuestion.answer].toString();
      const selectedIndices = [...selectedOptions].sort().toString();
      correct = correctIndices === selectedIndices;
    }

    updateCurrentState({ isSubmitted: true, isCorrect: correct });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    setShowFeedback(false);
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setAnswersState(prev => {
        const newState = { ...prev };
        delete newState[prevIndex];
        return newState;
      });
      setCurrentIndex(prevIndex);
      setIsCompleted(false);
    } else {
      onExit();
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowSelector(false);
    setIsCompleted(false);
    setShowFeedback(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswersState({});
    setIsCompleted(false);
    setShowFeedback(false);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch(type) {
      case 'single': return '单项选择题';
      case 'multiple': return '多项选择题';
      case 'text': return '问答题';
      default: return '未知题型';
    }
  }

  const getLetter = (i: number) => String.fromCharCode(65 + i);

  const getCorrectAnswerText = () => {
    if (currentQuestion.type === 'text') {
      return currentQuestion.answer;
    }
    const ans = currentQuestion.answer;
    if (Array.isArray(ans)) {
      return ans.map(i => getLetter(i)).sort().join('、');
    }
    return typeof ans === 'number' ? getLetter(ans) : ans;
  }
  
  const getCorrectAnswerContent = () => {
    if (currentQuestion.type === 'text') return null;
    const ans = currentQuestion.answer;
    const indices = Array.isArray(ans) ? ans : [ans as number];
    return indices.map(i => currentQuestion.options?.[i]).filter(Boolean).join('； ');
  }

  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto w-full p-6 text-center animate-fade-in flex flex-col items-center justify-center h-full">
        <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-2xl p-8 shadow-2xl border-2 border-amber-500/50 relative overflow-hidden w-full">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-yellow-400"></div>
              <div className="absolute top-20 right-20 w-6 h-6 rounded-full bg-red-400"></div>
           </div>

          <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/50 animate-pop">
            <Trophy size={48} className="text-red-900" />
          </div>
          <h2 className="text-4xl font-song font-bold text-white mb-4">竞赛圆满结束</h2>
          <p className="text-amber-100/80 text-xl mb-8">以赛促学，学以致用。感谢您的参与！</p>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRestart} variant="secondary" className="px-6 py-3" icon={<RefreshCcw size={20} />}>
              重新开始
            </Button>
            <Button onClick={onExit} variant="gold" className="px-6 py-3" icon={<Home size={20} />}>
              返回主页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-screen flex flex-col relative select-none overflow-hidden bg-transparent">
      {/* Question Selector Overlay */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={(e) => {
           if (e.target === e.currentTarget) setShowSelector(false);
        }}>
           <div className="bg-gradient-to-br from-red-950 to-red-900 border border-amber-500/30 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="p-4 border-b border-amber-500/20 flex justify-between items-center bg-black/20 rounded-t-xl">
                 <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                    <LayoutGrid size={20}/> 题目快速跳转
                 </h3>
                 <button onClick={() => setShowSelector(false)} className="text-amber-200 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                    <X size={20}/>
                 </button>
              </div>
              <div className="p-4 overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                    {questions.map((q, idx) => {
                       const status = answersState[idx];
                       let btnClass = "bg-white/5 border-amber-500/20 text-amber-100/70 hover:bg-white/10 hover:border-amber-500/50"; 
                       if (idx === currentIndex) {
                          btnClass = "bg-amber-500 text-red-900 border-amber-400 font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-300 scale-105"; 
                       } else if (status?.isSubmitted) {
                          btnClass = status.isCorrect 
                            ? "bg-green-900/40 border-green-500/50 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.1)]" 
                            : (status.isCorrect === false ? "bg-red-900/40 border-red-500/50 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : "bg-blue-900/40 border-blue-500/50 text-blue-300"); 
                       }

                       return (
                          <button 
                             key={q.id}
                             onClick={() => handleJumpToQuestion(idx)}
                             className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-200 ${btnClass}`}
                          >
                             <span className="text-lg font-mono font-bold">{idx + 1}</span>
                             <span className="text-[10px] opacity-60 truncate w-full text-center px-1">
                                {q.type === 'single' ? '单选' : q.type === 'multiple' ? '多选' : '问答'}
                             </span>
                          </button>
                       );
                    })}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header Module (Resizable) */}
      <div 
         style={{ height: headerHeight }} 
         className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-red-950/90 to-red-900/90 px-6 py-2 rounded-b-xl backdrop-blur-md border-b border-amber-500/30 shadow-lg shrink-0 relative z-20 overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-2 md:mb-0 w-full md:w-auto overflow-hidden">
          <Button onClick={onExit} variant="ghost" className="text-sm border border-amber-500/30 rounded-full w-10 h-10 p-0 flex items-center justify-center hover:bg-amber-500 hover:text-red-900 shrink-0 transition-transform hover:rotate-90">
             <Home size={18} />
          </Button>
          <div className="flex flex-col min-w-0">
            <h1 
              className="font-song font-bold text-amber-400 tracking-wide truncate leading-tight transition-all duration-200 origin-left drop-shadow-md"
              style={{ fontSize: `${1.8 * titleScale}rem` }}
            >
              {title}
            </h1>
            <h2 
              className="text-amber-200/60 font-medium transition-all duration-200 origin-left tracking-widest mt-0.5"
              style={{ fontSize: `${1.0 * subtitleScale}rem` }}
            >
              {subtitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto shrink-0">
             <Button 
                onClick={() => setShowSelector(true)}
                variant="secondary"
                className="px-4 py-2 text-sm flex items-center gap-2 border-amber-500/30 bg-black/20 hover:bg-black/40 hover:text-amber-300 transition-all rounded-lg"
             >
                <LayoutGrid size={18} />
                <span className="">题目列表</span>
             </Button>
        </div>
      </div>

      {/* Drag Handle for Header */}
      <div 
         onMouseDown={handleHeaderMouseDown}
         className={`h-4 -mt-2 relative z-30 cursor-row-resize flex items-center justify-center group ${isDraggingHeader ? 'pointer-events-none' : ''}`}
      >
         <div className={`w-24 h-4 bg-red-950/90 rounded-b-lg border-x border-b border-amber-500/30 flex items-center justify-center shadow-md transition-colors ${isDraggingHeader ? 'bg-amber-500/20 border-amber-400' : 'group-hover:bg-red-900 group-hover:border-amber-500/60'}`}>
            <GripHorizontal size={12} className={`text-amber-500/50 ${isDraggingHeader ? 'text-amber-400' : 'group-hover:text-amber-400'}`} />
         </div>
      </div>

      {/* Middle Content Area - Flex Center */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 w-full overflow-hidden p-4 z-10">
          
          {/* THE RESIZABLE WHITE CARD */}
          <div 
            style={{ width: cardSize.width, height: cardSize.height }}
            className="bg-gradient-to-b from-slate-50 to-red-50 rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] flex flex-col relative transition-all duration-75 border border-red-900/10"
          >
              {/* Card Texture */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-2xl" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")` }}></div>

              {/* Inner Layout of the Card */}
              <div className="flex-1 flex flex-col overflow-hidden p-2">
                 
                 {/* Question Tag - Centered Top */}
                 <div className="flex justify-center shrink-0 pt-4 pb-2">
                    <div className={`pl-4 pr-6 py-1.5 rounded-full text-base font-bold shadow-sm flex items-center gap-2 border relative overflow-hidden group ${
                        currentQuestion.type === 'single' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        currentQuestion.type === 'multiple' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                        'bg-orange-50 text-orange-800 border-orange-200'
                    }`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        currentQuestion.type === 'single' ? 'bg-blue-600' :
                        currentQuestion.type === 'multiple' ? 'bg-purple-600' :
                        'bg-orange-600'
                        }`}></div>
                        
                        <span>{getQuestionTypeLabel(currentQuestion.type)}</span>
                        <span className="w-px h-4 bg-current opacity-30"></span>
                        <span className="font-mono tracking-widest text-lg">{currentTypeIndex} <span className="text-xs opacity-60">/ {totalTypeCount}</span></span>
                    </div>
                 </div>

                 {/* Question Text Area */}
                 <div className="w-full px-6 py-2 text-center shrink-0 animate-fade-in key={currentIndex}">
                    <h2 className="text-2xl md:text-3xl font-bold text-red-900 leading-snug font-song drop-shadow-sm">
                      {currentQuestion.text}
                    </h2>
                 </div>

                 {/* Scrollable Content Area */}
                 <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide px-6 pb-6">
                      {/* Choices */}
                      {(currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && currentQuestion.options && (
                        <div className="grid grid-cols-1 gap-3 w-full pt-2">
                          {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedOptions.includes(idx);
                            
                            let stateClass = "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"; 
                            let circleClass = "border-slate-300 text-slate-500 bg-slate-100";

                            if (isSubmitted) {
                              const isCorrectIndex = Array.isArray(currentQuestion.answer) 
                                  ? (currentQuestion.answer as number[]).includes(idx)
                                  : currentQuestion.answer === idx;
                              
                              if (isSelected) {
                                  if (isCorrectIndex) {
                                      stateClass = "border border-green-500 bg-green-50 text-green-900 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
                                      circleClass = "border-green-500 bg-green-600 text-white";
                                  } else {
                                      stateClass = "border border-red-500 bg-red-50 text-red-900 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
                                      circleClass = "border-red-500 bg-red-600 text-white";
                                  }
                              } else if (isCorrectIndex) {
                                  stateClass = "border border-slate-300 bg-slate-100 text-slate-500 opacity-80"; 
                                  circleClass = "border-slate-400 bg-slate-400 text-white";
                              } else {
                                  stateClass = "border border-slate-100 bg-slate-50 text-slate-300 opacity-50";
                                  circleClass = "border-slate-200 text-slate-300";
                              }

                            } else if (isSelected) {
                              stateClass = "border border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-md shadow-amber-500/10 transform scale-[1.01] ring-1 ring-amber-400/50";
                              circleClass = "border-amber-500 bg-amber-500 text-white shadow-sm";
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => handleOptionClick(idx)}
                                disabled={isSubmitted}
                                className={`relative p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 group ${stateClass}`}
                              >
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base font-bold border transition-colors duration-200 ${circleClass}`}>
                                  {getLetter(idx)}
                                </span>
                                <span className="text-lg leading-relaxed">{option}</span>
                                
                                {isSubmitted && isSelected && (
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-pop">
                                    {stateClass.includes('green') ? 
                                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border border-green-300"><Check className="text-green-700 w-5 h-5" /></div> : 
                                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border border-red-300"><X className="text-red-600 w-5 h-5" /></div>
                                    }
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Text Answer Area */}
                      {currentQuestion.type === 'text' && !isSubmitted && (
                        <div className="w-full h-full flex flex-col justify-center items-center py-4">
                              <div className="w-full p-8 border-2 border-dashed border-red-200/60 rounded-2xl bg-red-50/40 text-red-400/80 flex flex-col items-center gap-4 group hover:bg-red-50/70 transition-colors cursor-default">
                                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                    <HelpCircle size={32} className="text-red-400" />
                                  </div>
                                  <div className="text-center">
                                     <p className="text-xl font-medium font-song mb-1 text-red-800">请选手口头作答</p>
                                     <p className="text-base opacity-70">作答完毕后点击下方“揭晓答案”</p>
                                  </div>
                              </div>
                        </div>
                      )}

                      {/* Answer Reveal Section */}
                      {isSubmitted && (
                          <div className="w-full animate-slide-up pb-2 mt-4">
                              <div className={`p-6 rounded-2xl border-l-[6px] shadow-md relative overflow-hidden ${isCorrect === false ? 'bg-red-50 border-l-red-500 border-y border-r border-red-200' : 'bg-amber-50 border-l-amber-500 border-y border-r border-amber-200'}`}>
                                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    {isCorrect === false ? <XCircle size={80} className="text-red-500"/> : <CheckCircle2 size={80} className="text-amber-500"/>}
                                  </div>

                                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.1em] mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    正确答案
                                  </h3>
                                  <div className={`font-song text-red-900 leading-relaxed ${currentQuestion.type === 'text' ? 'text-xl font-medium text-left' : 'text-3xl font-bold'}`}>
                                    {getCorrectAnswerText()}
                                  </div>
                                  {currentQuestion.type !== 'text' && (
                                    <div className="text-lg text-red-800/80 mt-2 font-medium">
                                        {getCorrectAnswerContent()}
                                    </div>
                                  )}
                                  {currentQuestion.explanation && (
                                    <div className="mt-4 pt-4 border-t border-black/5 text-slate-600 text-base leading-relaxed">
                                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-xs mr-2 mb-1 align-middle">解析</span>
                                        {currentQuestion.explanation}
                                    </div>
                                  )}
                              </div>
                          </div>
                      )}
                 </div>
              </div>

              {/* Resize Handle - Bottom Right of the Card */}
              <div 
                  onMouseDown={handleCardMouseDown}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-tl-2xl rounded-br-2xl cursor-nwse-resize flex items-center justify-center shadow-md hover:bg-amber-400 transition-colors z-20 group/handle"
                  title="拖动调整卡片大小"
              >
                  <MoveDiagonal size={16} className="text-red-900 group-hover/handle:scale-110 transition-transform" />
              </div>
          </div>

           {/* Feedback Banner - Independent Layer */}
           {showFeedback && isCorrect !== null && (
            <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-8 py-4 rounded-xl flex items-center justify-center gap-4 animate-slide-up z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md border border-white/20 min-w-[300px] ${
              isCorrect ? 'bg-green-600/95 text-white' : 'bg-red-600/95 text-white'
            }`}>
              <div className="p-2 bg-white/20 rounded-full">
                 {isCorrect ? <CheckCircle2 size={24} className="animate-pop" /> : <XCircle size={24} className="animate-shake" />}
              </div>
              <span className="text-2xl font-bold tracking-wide font-song">{isCorrect ? '回答正确！' : '回答错误！'}</span>
            </div>
          )}
      </div>

      {/* Footer Controls - Fixed Bottom */}
      <div className="shrink-0 relative z-20 h-20 w-full flex items-center justify-center gap-6 pb-4 px-6 bg-gradient-to-t from-red-950/80 to-transparent">
          <Button 
            onClick={handlePrev} 
            variant="secondary"
            className="w-12 h-12 rounded-xl p-0 flex items-center justify-center bg-black/20 hover:bg-black/40 border border-amber-500/30 hover:scale-105 transition-all shadow-md backdrop-blur-md"
            title={currentIndex === 0 ? "返回主页" : "上一题"}
          >
             <ChevronLeft size={24} />
          </Button>

          <div className="flex-1 max-w-lg flex justify-center">
              {!isSubmitted ? (
                 currentQuestion.type === 'text' ? (
                    <Button 
                       onClick={() => updateCurrentState({ isSubmitted: true })} 
                       variant="gold"
                       className="w-full h-12 text-lg rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 font-song font-bold tracking-widest border border-amber-300"
                    >
                       揭晓答案
                    </Button>
                 ) : (
                    <Button 
                       onClick={handleSubmit} 
                       variant="gold"
                       disabled={selectedOptions.length === 0}
                       className="w-full h-12 text-lg rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 font-song font-bold tracking-widest border border-amber-300"
                    >
                       提交答案
                    </Button>
                 )
              ) : (
                 <div className="flex gap-4 w-full justify-center">
                    <Button 
                         onClick={handleNext} 
                         variant="primary"
                         className="w-full h-12 text-lg animate-pop rounded-xl shadow-lg shadow-red-900/30 hover:-translate-y-0.5 font-song font-bold tracking-widest border border-red-400"
                         icon={<ChevronRight size={24}/>}
                       >
                         {currentIndex < questions.length - 1 ? '下一题' : '完成比赛'}
                    </Button>
                 </div>
              )}
          </div>
          
           {/* Spacer to balance the Left Button */}
           <div className="w-12"></div>
      </div>
    </div>
  );
};