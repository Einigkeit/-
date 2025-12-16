export type QuestionType = 'single' | 'multiple' | 'text';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // 用于选择题
  answer: string | number | number[]; // number/number[] 代表选项索引，string 代表简答题答案
  explanation?: string; // 答案解析
  score?: number; // 分值
}

export enum AppState {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

// 扩展 Setup 传递给 Game 的配置
export interface GameConfig {
  title: string;
  subtitle: string;
  questions: Question[];
  titleScale?: number;
  subtitleScale?: number;
}