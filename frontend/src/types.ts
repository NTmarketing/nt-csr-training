export type Role = 'trainee' | 'admin';
export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type ScenarioType = 'free_response' | 'roleplay';

export interface User {
  id: number;
  username: string;
  name: string;
  role: Role;
}

export interface ModuleSummary {
  id: string;
  number: number;
  title: string;
  description: string;
  estimated_minutes: number;
  status: ModuleStatus;
  quiz_score: number | null;
}

export interface ModuleSection {
  id: string;
  title: string;
  content_md: string;
  key_points: string[];
}

export interface ModuleScenario {
  id: string;
  type: ScenarioType;
  prompt: string;
  customer_persona?: string;
  rubric: string[];
}

export interface ModuleQuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correct_index?: number;
  explanation: string;
}

export interface ScenarioCompletion {
  attempted: boolean;
  best_score: number | null;
  attempt_count: number;
}

export interface ModuleFull extends ModuleSummary {
  learning_objectives: string[];
  sections: ModuleSection[];
  scenarios: ModuleScenario[];
  scenario_completion: Record<string, ScenarioCompletion>;
  quiz: ModuleQuizQuestion[];
  kb_references: string[];
  passing_score_percent: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | number;
}

export interface QuizFeedbackItem {
  questionId: string;
  correct: boolean;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  feedback: QuizFeedbackItem[];
}

export interface ExamQuestion {
  id: string;
  module_ref: string;
  question: string;
  type: QuestionType;
  options?: string[];
}

export interface ExamStartResponse {
  examId: string;
  questions: ExamQuestion[];
}

export interface ExamPerModuleBreakdown {
  module_ref: string;
  correct: number;
  total: number;
}

export interface ExamResult {
  score: number;
  total: number;
  passed: boolean;
  perModuleBreakdown: ExamPerModuleBreakdown[];
  completed_at?: string;
  user_name?: string;
}

export interface RoleplayGrade {
  score: number;
  feedback: string;
  perCriteria: { criterion: string; met: boolean; note?: string }[];
}

export interface FreeResponseGrade {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface AdminUserSummary {
  id: number;
  username: string;
  name: string;
  role: Role;
  modules_completed: number;
  last_activity: string | null;
}
