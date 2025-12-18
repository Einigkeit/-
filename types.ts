export type QuestionType = 'single' | 'multiple' | 'text';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  answer: string | number | number[];
  explanation?: string;
  score?: number;
}

export enum AppState {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface FontScales {
  global: number;
  question: number;
  option: number;
  ui: number;
  tag: number;
  answer: number;
  detail: number;
}

export interface GameConfig {
  title: string;
  subtitle: string;
  questions: Question[];
  titleScale?: number;
  subtitleScale?: number;
}