import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, RefreshCcw, Home, CheckCircle2, XCircle, Trophy, HelpCircle, Check, X } from 'lucide-react';
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
  
  // Persistent State for all questions
  const [answersState, setAnswersState] = useState<Record<number, AnswerState>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  
  // Derive current view state from persistent state
  const currentAnswerState = answersState[currentIndex] || {
    selectedOptions: [],
    isSubmitted: false,
    isCorrect: null
  };

  const { selectedOptions, isSubmitted, isCorrect } = currentAnswerState;

  // Auto-dismiss feedback logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showFeedback) {
      timer = setTimeout(() => {
        setShowFeedback(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showFeedback]);

  // Helpers to update persistent state
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

    // Judgment Logic
    if (currentQuestion.type === 'single') {
      correct = currentQuestion.answer === selectedOptions[0];
    } else if (currentQuestion.type === 'multiple') {
      // Assuming answer is array of indices for multiple choice
      const correctIndices = Array.isArray(currentQuestion.answer) 
        ? (currentQuestion.answer as number[]).sort().toString()
        : [currentQuestion.answer].toString();
      const selectedIndices = [...selectedOptions].sort().toString();
      correct = correctIndices === selectedIndices;
    } else {
      // Text questions wait for manual judgment
    }

    updateCurrentState({ isSubmitted: true, isCorrect: correct });
    setShowFeedback(true);
  };

  // Manual judgment for text questions
  const handleManualJudge = (result: boolean) => {
      updateCurrentState({ isCorrect: result });
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
      setCurrentIndex(prev => prev - 1);
      setIsCompleted(false);
    }
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

  // Helper to get letter for index
  const getLetter = (i: number) => String.fromCharCode(65 + i);

  // Helper to render answer text
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
  
  // Helper to get text content of correct options for display
  const getCorrectAnswerContent = () => {
    if (currentQuestion.type === 'text') return null;
    const ans = currentQuestion.answer;
    const indices = Array.isArray(ans) ? ans : [ans as number];
    return indices.map(i => currentQuestion.options?.[i]).filter(Boolean).join('； ');
  }

  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto w-full p-8 text-center animate-fade-in">
        <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-3xl p-12 shadow-2xl border-4 border-amber-500/50 relative overflow-hidden">
           {/* Confetti effect placeholder */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-yellow-400"></div>
              <div className="absolute top-20 right-20 w-6 h-6 rounded-full bg-red-400"></div>
              <div className="absolute bottom-10 left-1/2 w-5 h-5 rounded-full bg-blue-400"></div>
           </div>

          <div className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-amber-500/50 animate-pop">
            <Trophy size={64} className="text-red-900" />
          </div>
          <h2 className="text-5xl font-song font-bold text-white mb-6">竞赛圆满结束</h2>
          <p className="text-amber-100/80 text-xl mb-12">以赛促学，学以致用。感谢您的参与！</p>
          
          <div className="flex gap-6 justify-center">
            <Button onClick={handleRestart} variant="secondary" className="px-8" icon={<RefreshCcw size={20} />}>
              重新开始
            </Button>
            <Button onClick={onExit} variant="gold" className="px-8" icon={<Home size={20} />}>
              返回主页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 flex flex-col h-[95vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-red-950/40 p-6 rounded-2xl backdrop-blur-md border border-amber-500/20 shadow-lg shrink-0">
        <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
          <Button onClick={onExit} variant="ghost" className="text-sm border border-amber-500/30 rounded-full w-10 h-10 p-0 flex items-center justify-center hover:bg-amber-500 hover:text-red-900 shrink-0">
             <Home size={18} />
          </Button>
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg md:text-xl font-song font-bold text-amber-400 tracking-wide truncate">{title}</h1>
            <h2 className="text-sm md:text-base text-amber-200/60 font-medium">{subtitle}</h2>
          </div>
        </div>

        <div className="flex items-center gap-6 ml-auto">
             <div className="bg-black/40 px-6 py-2 rounded-full border border-amber-500/20 flex items-center gap-2 shadow-inner">
               <span className="text-3xl font-bold text-amber-400 font-mono tracking-wider">{currentIndex + 1}</span>
               <span className="text-amber-500/40 text-2xl font-light">/</span>
               <span className="text-amber-100/60 text-xl font-mono">{questions.length}</span>
             </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex flex-col relative perspective-1000 min-h-0">
        <div className="bg-gradient-to-b from-white to-red-50 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex-1 flex flex-col p-6 md:p-10 relative overflow-hidden transition-all duration-300 border-8 border-red-900/10 min-h-0">
          
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/20 to-transparent pointer-events-none rounded-bl-full"></div>

          {/* Question Tag */}
          <div className="mb-6 flex justify-center shrink-0">
             <span className={`px-8 py-2 rounded-full text-lg font-bold shadow-sm ${
                currentQuestion.type === 'single' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                currentQuestion.type === 'multiple' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                'bg-orange-100 text-orange-800 border border-orange-200'
             }`}>
                {getQuestionTypeLabel(currentQuestion.type)}
             </span>
          </div>

          {/* Question Text */}
          <div className="w-full max-w-5xl mx-auto text-center mb-8 animate-fade-in key={currentIndex} shrink-0">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-red-900 leading-snug font-song">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Content Area (Options or Text Answer) - Scrollable */}
          <div className="flex-1 flex flex-col items-center w-full max-w-4xl mx-auto overflow-y-auto min-h-0 px-4 scrollbar-hide">
            
            {/* Choices */}
            {(currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && currentQuestion.options && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pb-6">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOptions.includes(idx);
                  
                  // Style Calculation
                  let stateClass = "border-2 border-slate-100 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"; // Default
                  
                  if (isSubmitted) {
                    const isCorrectIndex = Array.isArray(currentQuestion.answer) 
                        ? (currentQuestion.answer as number[]).includes(idx)
                        : currentQuestion.answer === idx;
                    
                    if (isSelected) {
                        if (isCorrectIndex) {
                            // User selected CORRECT option
                            stateClass = "border-2 border-green-500 bg-green-50 text-green-800 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                        } else {
                            // User selected WRONG option
                            stateClass = "border-2 border-red-500 bg-red-50 text-red-800 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
                        }
                    } else if (isCorrectIndex) {
                        // Unselected but CORRECT option (neutral highlight)
                        stateClass = "border-2 border-slate-200 bg-slate-50 text-slate-400 opacity-75"; 
                    } else {
                        stateClass = "border-2 border-slate-100 bg-slate-50 text-slate-300 opacity-50";
                    }

                  } else if (isSelected) {
                    // Selected state before submit
                    stateClass = "border-2 border-amber-400 bg-amber-50 text-amber-900 font-bold shadow-md transform scale-[1.01]";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isSubmitted}
                      className={`relative p-5 rounded-xl text-left text-lg transition-all duration-200 flex items-start gap-4 group ${stateClass}`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                         isSelected || (isSubmitted && (stateClass.includes('green') || stateClass.includes('red'))) ? 'border-current bg-current text-white' : 'border-slate-300 text-slate-400'
                      }`}>
                        {getLetter(idx)}
                      </span>
                      <span className="mt-0.5">{option}</span>
                      
                      {/* Status Icon on Far Right */}
                      {isSubmitted && isSelected && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {stateClass.includes('green') ? 
                             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center border border-green-200"><Check className="text-green-600 w-5 h-5" /></div> : 
                             <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border border-red-200"><X className="text-red-500 w-5 h-5" /></div>
                          }
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Text Answer Display */}
            {currentQuestion.type === 'text' && (
               <div className="w-full text-center pb-6">
                  {!isSubmitted ? (
                     <div className="p-12 border-2 border-dashed border-red-200 rounded-xl bg-red-50/50 text-red-400">
                        <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl">请选手作答，作答完毕后点击下方按钮揭晓答案</p>
                     </div>
                  ) : null}
               </div>
            )}

            {/* Answer Reveal Section (Always show if submitted) */}
             {isSubmitted && (
                 <div className="w-full animate-slide-up mb-24">
                    <div className={`p-6 rounded-xl border ${isCorrect === false ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'} shadow-sm`}>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">正确答案</h3>
                        <div className={`font-song text-red-900 ${currentQuestion.type === 'text' ? 'text-xl font-medium text-left leading-relaxed' : 'text-2xl font-bold'}`}>
                           {getCorrectAnswerText()}
                        </div>
                        {currentQuestion.type !== 'text' && (
                           <div className="text-lg text-red-800/80 mt-2">
                              {getCorrectAnswerContent()}
                           </div>
                        )}
                        {currentQuestion.explanation && (
                           <div className="mt-4 pt-4 border-t border-black/5 text-slate-600 text-sm">
                              <span className="font-bold mr-2">解析:</span>
                              {currentQuestion.explanation}
                           </div>
                        )}
                    </div>
                 </div>
             )}

          </div>

          {/* Feedback Banner (Auto Dismiss 3s) */}
          {showFeedback && isCorrect !== null && (
            <div className={`absolute bottom-4 left-6 right-6 p-4 rounded-xl flex items-center justify-center gap-3 animate-slide-up z-20 shadow-2xl ${
              isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {isCorrect ? <CheckCircle2 size={32} className="animate-pop" /> : <XCircle size={32} className="animate-shake" />}
              <span className="text-2xl font-bold">{isCorrect ? '回答正确！' : '回答错误！'}</span>
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <div className="mt-6 flex items-center justify-center gap-4 pb-4 shrink-0">
          <Button 
            onClick={handlePrev} 
            variant="secondary"
            disabled={currentIndex === 0}
            className="w-16 h-16 rounded-full p-0 flex items-center justify-center bg-white/10 hover:bg-white/20 border border-amber-500/30"
            title="上一题"
          >
             <ChevronLeft size={32} />
          </Button>

          <div className="flex-1 max-w-md flex justify-center">
              {!isSubmitted ? (
                 currentQuestion.type === 'text' ? (
                    <Button 
                       onClick={() => updateCurrentState({ isSubmitted: true })} 
                       variant="gold"
                       className="w-full py-4 text-xl"
                    >
                       揭晓答案
                    </Button>
                 ) : (
                    <Button 
                       onClick={handleSubmit} 
                       variant="gold"
                       disabled={selectedOptions.length === 0}
                       className="w-full py-4 text-xl shadow-amber-500/20"
                    >
                       提交答案
                    </Button>
                 )
              ) : (
                 <div className="flex gap-4 w-full justify-center">
                   {/* Manual Scoring for Text */}
                   {currentQuestion.type === 'text' && isCorrect === null && (
                     <>
                       <Button onClick={() => handleManualJudge(true)} className="flex-1 bg-green-600 hover:bg-green-500 border-green-500 text-white shadow-lg" icon={<CheckCircle2/>}>回答正确</Button>
                       <Button onClick={() => handleManualJudge(false)} className="flex-1 bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-lg" icon={<XCircle/>}>回答错误</Button>
                     </>
                   )}
                   
                   {/* Next Button only appears if logic is settled (Choice submitted OR Text judged) */}
                   {(currentQuestion.type !== 'text' || isCorrect !== null) && (isCorrect !== null || currentQuestion.type !== 'text') && (
                       <Button 
                         onClick={handleNext} 
                         variant="primary"
                         className="flex-1 py-4 text-xl animate-pop"
                         icon={<ChevronRight size={24}/>}
                       >
                         {currentIndex < questions.length - 1 ? '下一题' : '完成比赛'}
                       </Button>
                   )}
                 </div>
              )}
          </div>
          
           {/* Spacer for balance */}
           <div className="w-16"></div>
        </div>
      </div>
    </div>
  );
};