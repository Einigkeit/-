import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, RefreshCcw, Home, CheckCircle2, XCircle, Trophy, HelpCircle, Check, X, LayoutGrid, GripHorizontal, MoveDiagonal, BookOpen } from 'lucide-react';
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
  const { questions, title, subtitle } = config;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  
  const [cardSize, setCardSize] = useState({ width: 1000, height: 650 });
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const [answersState, setAnswersState] = useState<Record<number, AnswerState>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  
  const currentTypeQuestions = questions.filter(q => q.type === currentQuestion.type);
  const currentTypeIndex = currentTypeQuestions.findIndex(q => q.id === currentQuestion.id) + 1;
  const totalTypeCount = currentTypeQuestions.length;
  
  const currentAnswerState = answersState[currentIndex] || {
    selectedOptions: [],
    isSubmitted: false,
    isCorrect: null
  };

  const { selectedOptions, isSubmitted, isCorrect } = currentAnswerState;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showFeedback) {
      // Feedback window displays for 2 seconds
      timer = setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [showFeedback]);

  const handleCardMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCard(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingCard) {
         const centerX = window.innerWidth / 2;
         const newWidth = Math.abs(e.clientX - centerX) * 2;
         const maxWidth = window.innerWidth - 40; 
         const clampedWidth = Math.max(600, Math.min(newWidth, maxWidth)); 
         
         const availableHeight = window.innerHeight - 150;
         const areaCenterY = window.innerHeight / 2;
         const newHeight = Math.abs(e.clientY - areaCenterY) * 2;
         const clampedHeight = Math.max(400, Math.min(newHeight, availableHeight));

         setCardSize({
            width: clampedWidth,
            height: clampedHeight
         });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCard(false);
    };

    if (isDraggingCard) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCard]);

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
      case 'text': return '简答题';
      default: return '未知题型';
    }
  }

  const getLetter = (i: number) => String.fromCharCode(65 + i);

  const getCorrectAnswerCombined = () => {
    if (currentQuestion.type === 'text') {
      return currentQuestion.answer as string;
    }
    const ans = currentQuestion.answer;
    const indices = Array.isArray(ans) ? ans : [ans as number];
    const sortedIndices = [...indices].sort((a, b) => a - b);
    
    return sortedIndices.map(i => {
       const letter = getLetter(i);
       const content = currentQuestion.options?.[i] || '';
       return `${letter}、${content}`;
    }).join('； ');
  }

  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto w-full p-6 text-center animate-fade-in flex flex-col items-center justify-center h-full">
        <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-2xl p-8 shadow-2xl border-2 border-amber-500/50 relative overflow-hidden w-full">
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
      {showSelector && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={(e) => {
           if (e.target === e.currentTarget) setShowSelector(false);
        }}>
           <div className="bg-gradient-to-br from-red-950 to-red-900 border border-amber-500/30 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="p-4 border-b border-amber-500/20 flex justify-between items-center bg-black/20 rounded-t-xl shrink-0">
                 <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                    <LayoutGrid size={20}/> 题目快速跳转
                 </h3>
                 <button onClick={() => setShowSelector(false)} className="text-amber-200 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                    <X size={20}/>
                 </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-8">
                 {(['single', 'multiple', 'text'] as const).map((type) => {
                    const typeQuestions = questions
                      .map((q, originalIndex) => ({ ...q, originalIndex }))
                      .filter(q => q.type === type);
                    if (typeQuestions.length === 0) return null;
                    const typeLabel = type === 'single' ? '单项选择题' : type === 'multiple' ? '多项选择题' : '简答题';
                    return (
                       <div key={type} className="animate-fade-in">
                          <h4 className="text-amber-400 font-bold mb-4 border-l-4 border-amber-500 pl-3 flex items-center gap-2 text-sm">
                             {typeLabel}
                             <span className="text-xs text-amber-500/50 font-normal">共 {typeQuestions.length} 题</span>
                          </h4>
                          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
                             {typeQuestions.map((q, idx) => {
                                const globalIndex = q.originalIndex;
                                const status = answersState[globalIndex];
                                let btnClass = "bg-white/5 border-amber-500/20 text-amber-100/70 hover:bg-white/10 hover:border-amber-500/50"; 
                                if (globalIndex === currentIndex) {
                                   btnClass = "bg-amber-500 text-red-900 border-amber-400 font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-300 scale-105"; 
                                } else if (status?.isSubmitted) {
                                   btnClass = status.isCorrect 
                                     ? "bg-green-900/40 border-green-500/50 text-green-300" 
                                     : (status.isCorrect === false ? "bg-red-900/40 border-red-500/50 text-red-300" : "bg-blue-900/40 border-blue-500/50 text-blue-300"); 
                                }
                                return (
                                   <button 
                                      key={q.id}
                                      onClick={() => handleJumpToQuestion(globalIndex)}
                                      className={`aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-200 ${btnClass}`}
                                   >
                                      <span className="text-lg font-mono font-bold">{idx + 1}</span>
                                   </button>
                                );
                             })}
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center relative min-h-0 w-full overflow-hidden p-6 z-10">
          <div 
            style={{ width: cardSize.width, height: cardSize.height }}
            className="bg-gradient-to-b from-slate-50 to-red-50 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col relative border border-red-900/10"
          >
              <div className="flex-1 flex flex-col overflow-hidden p-4">
                 <div className="flex justify-center shrink-0 pt-6 pb-4">
                    <div className={`pl-5 pr-7 py-2 rounded-full font-bold shadow-sm flex items-center gap-3 border relative overflow-hidden group scale-tag ${
                        currentQuestion.type === 'single' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        currentQuestion.type === 'multiple' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                        'bg-orange-50 text-orange-800 border-orange-200'
                    }`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                        currentQuestion.type === 'single' ? 'bg-blue-600' :
                        currentQuestion.type === 'multiple' ? 'bg-purple-600' :
                        'bg-orange-600'
                        }`}></div>
                        <span>{getQuestionTypeLabel(currentQuestion.type)}</span>
                        <span className="w-px h-5 bg-current opacity-30"></span>
                        <span className="font-mono tracking-widest">{currentTypeIndex} <span className="opacity-60 text-[0.8em]">/ {totalTypeCount}</span></span>
                    </div>
                 </div>

                 <div className="w-full px-10 py-4 text-center shrink-0 animate-fade-in">
                    <h2 className="font-bold text-red-900 leading-tight font-song drop-shadow-sm scale-question">
                      {currentQuestion.text}
                    </h2>
                 </div>

                 <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide px-10 pb-8 mt-4">
                      {(currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && currentQuestion.options && (
                        <div className="grid grid-cols-1 gap-4 w-full">
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
                                      stateClass = "border-2 border-green-500 bg-green-50 text-green-900 shadow-lg";
                                      circleClass = "border-green-500 bg-green-600 text-white";
                                  } else {
                                      stateClass = "border-2 border-red-500 bg-red-50 text-red-900 shadow-lg";
                                      circleClass = "border-red-500 bg-red-600 text-white";
                                  }
                              } else if (isCorrectIndex) {
                                  stateClass = "border border-slate-300 bg-slate-100 opacity-80"; 
                                  circleClass = "border-slate-400 bg-slate-400 text-white";
                              } else {
                                  // Improved visibility for unselected items after submission
                                  stateClass = "border border-slate-200 bg-white text-slate-500 opacity-75 grayscale-[0.5]";
                                  circleClass = "border-slate-300 text-slate-400 bg-slate-50";
                              }
                            } else if (isSelected) {
                              stateClass = "border-2 border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xl transform scale-[1.02]";
                              circleClass = "border-amber-500 bg-amber-500 text-white shadow-sm";
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => handleOptionClick(idx)}
                                disabled={isSubmitted}
                                className={`relative p-6 rounded-2xl text-left transition-all duration-200 flex items-center gap-6 group scale-option ${stateClass}`}
                              >
                                <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border transition-colors duration-200 ${circleClass}`}>
                                  {getLetter(idx)}
                                </span>
                                <span className="leading-relaxed font-medium">{option}</span>
                                {isSubmitted && isSelected && (
                                  <div className="absolute right-6 top-1/2 -translate-y-1/2 animate-pop">
                                    {stateClass.includes('green') ? 
                                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border border-green-300 shadow-sm"><Check className="text-green-700 w-6 h-6" /></div> : 
                                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center border border-red-300 shadow-sm"><X className="text-red-600 w-6 h-6" /></div>
                                    }
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {currentQuestion.type === 'text' && !isSubmitted && (
                        <div className="w-full h-full flex flex-col justify-center items-center py-8">
                              <div className="w-full max-w-2xl p-12 border-2 border-dashed border-red-200/60 rounded-3xl bg-red-50/40 text-red-400/80 flex flex-col items-center gap-6 group hover:bg-red-50/70 transition-colors cursor-default">
                                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                    <HelpCircle size={48} className="text-red-400" />
                                  </div>
                                  <div className="text-center">
                                     <p className="text-2xl font-bold font-song mb-2 text-red-800">请选手准备好口头作答</p>
                                     <p className="text-lg opacity-70">点击下方按钮可揭晓参考答案</p>
                                  </div>
                              </div>
                        </div>
                      )}

                      {isSubmitted && (
                          <div className="w-full animate-slide-up pb-4 mt-8">
                              {currentQuestion.type !== 'text' ? (
                                <div className={`p-8 rounded-3xl border-l-[10px] shadow-xl relative overflow-hidden ${isCorrect === false ? 'bg-red-50 border-l-red-500 border-red-200' : 'bg-amber-50 border-l-amber-500 border-amber-200'} border`}>
                                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                      {isCorrect === false ? <XCircle size={100} className="text-red-500"/> : <CheckCircle2 size={100} className="text-amber-500"/>}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                                      正确答案 & 解析
                                    </h3>
                                    <div className={`font-song text-red-900 leading-relaxed mb-4 scale-answer font-bold`}>
                                      {getCorrectAnswerCombined()}
                                    </div>
                                    <div className="pt-5 border-t border-black/5 text-slate-600 text-left scale-detail leading-relaxed">
                                        <span className="inline-block px-3 py-1 rounded-lg bg-slate-200 text-slate-800 font-bold text-[0.7em] mr-3 mb-2 align-middle">详细解析</span>
                                        <div className="whitespace-pre-wrap">{currentQuestion.explanation || "该题目暂无详细解析内容。"}</div>
                                    </div>
                                </div>
                              ) : (
                                // Beautified Explanation for Text questions
                                <div className="bg-amber-50/80 rounded-3xl border border-amber-200 shadow-lg p-1 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                                  <div className="border border-dashed border-amber-300 rounded-2xl p-8 bg-white/60">
                                    <div className="flex items-center gap-3 mb-6">
                                      <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-md">
                                        <BookOpen size={24} />
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-bold text-amber-900 font-song">参考答案与解析</h3>
                                        <div className="h-1 w-16 bg-amber-500/30 rounded-full mt-1"></div>
                                      </div>
                                    </div>
                                    
                                    <div className="scale-detail text-red-950 font-song leading-[1.8] text-justify space-y-4">
                                      <div className="relative pl-4">
                                        <span className="absolute left-0 top-0 text-amber-500 font-serif text-5xl opacity-20 -translate-x-4 -translate-y-2 select-none">“</span>
                                        <div className="whitespace-pre-wrap">
                                          {currentQuestion.explanation || currentQuestion.answer || "暂无详细解析内容。"}
                                        </div>
                                        <div className="flex justify-end mt-2">
                                          <span className="text-amber-500 font-serif text-5xl opacity-20 translate-y-4 select-none">”</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-amber-100 flex justify-between items-center opacity-40">
                                      <span className="text-xs italic text-amber-900 font-song">知识竞赛参考资料</span>
                                      <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                      )}
                 </div>
              </div>

              <div 
                  onMouseDown={handleCardMouseDown}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-amber-500 rounded-tl-3xl rounded-br-3xl cursor-nwse-resize flex items-center justify-center shadow-md hover:bg-amber-400 transition-colors z-20 group/handle"
              >
                  <MoveDiagonal size={20} className="text-red-900 group-hover/handle:scale-110 transition-transform" />
              </div>
          </div>

           {showFeedback && isCorrect !== null && (
            <div className={`fixed bottom-32 left-1/2 -translate-x-1/2 px-10 py-5 rounded-2xl flex items-center justify-center gap-5 z-[150] shadow-2xl backdrop-blur-xl border border-white/20 min-w-[350px] animate-slide-up-centered ${
              isCorrect ? 'bg-green-600/95 text-white' : 'bg-red-600/95 text-white'
            }`}>
              <div className="p-2 bg-white/20 rounded-full">
                 {isCorrect ? <CheckCircle2 size={28} className="animate-pop" /> : <XCircle size={28} className="animate-shake" />}
              </div>
              <span className="text-3xl font-bold tracking-wider font-song">{isCorrect ? '回答正确！' : '回答错误！'}</span>
            </div>
          )}
      </div>

      <div className="shrink-0 relative z-20 h-28 w-full flex items-center justify-center gap-4 pb-6 px-10 bg-gradient-to-t from-red-950/90 to-transparent">
          <div className="flex items-center gap-3">
            <Button 
                onClick={onExit} 
                variant="secondary"
                className="h-14 px-5 rounded-2xl flex items-center gap-2 bg-black/40 border-amber-500/20 hover:border-amber-500/50 scale-ui transition-all"
                title="返回主页"
            >
                <Home size={20} />
                <span>主页</span>
            </Button>
            <Button 
                onClick={handlePrev} 
                variant="secondary"
                className="h-14 px-5 rounded-2xl flex items-center gap-2 bg-black/40 border-amber-500/20 hover:border-amber-500/50 scale-ui transition-all"
                title="上一题"
            >
                <ChevronLeft size={20} />
                <span>上一题</span>
            </Button>
          </div>

          <div className="flex-1 max-xl:max-w-md max-w-xl">
              {!isSubmitted ? (
                 <Button 
                    onClick={currentQuestion.type === 'text' ? () => updateCurrentState({ isSubmitted: true, isCorrect: null }) : handleSubmit} 
                    variant="gold"
                    disabled={currentQuestion.type !== 'text' && selectedOptions.length === 0}
                    className="w-full h-14 text-xl rounded-2xl shadow-xl shadow-amber-500/20 font-song font-bold tracking-[0.2em] border-2 border-amber-300 hover:scale-[1.02] transition-transform"
                 >
                    {currentQuestion.type === 'text' ? '揭晓解析' : '确认提交'}
                 </Button>
              ) : (
                <Button 
                    onClick={handleNext} 
                    variant="primary"
                    className="w-full h-14 text-xl rounded-2xl shadow-xl shadow-red-900/40 font-song font-bold tracking-[0.2em] border-2 border-red-400 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                >
                    {currentIndex < questions.length - 1 ? '下一题' : '结束竞赛'}
                    <ChevronRight size={24}/>
                </Button>
              )}
          </div>

          <Button 
            onClick={() => setShowSelector(true)}
            variant="secondary"
            className="h-14 px-5 rounded-2xl flex items-center gap-2 bg-black/40 border-amber-500/20 hover:border-amber-500/50 scale-ui transition-all"
          >
            <LayoutGrid size={20} />
            <span>题库跳转</span>
          </Button>
      </div>
    </div>
  );
};