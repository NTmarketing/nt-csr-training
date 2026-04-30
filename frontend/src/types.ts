export type Role = 'trainee' | 'admin';
export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type ScenarioType = 'free_response' | 'roleplay';
export type ScenarioTone = 'casual' | 'professional' | 'escalated';

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

export interface MediaImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface MediaGalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface MediaComparisonSide {
  src: string;
  alt: string;
  label: string;
}

export type MediaBlock =
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'gallery'; columns: 2 | 3 | 4; images: MediaGalleryImage[] }
  | { type: 'comparison'; left: MediaComparisonSide; right: MediaComparisonSide }
  | { type: 'svg'; svg: string; caption?: string };

export interface ModuleSection {
  id: string;
  title: string;
  content_md: string;
  key_points: string[];
  media?: MediaBlock[];
}

export interface ModuleScenario {
  id: string;
  type: ScenarioType;
  tone?: ScenarioTone;
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
  sections_viewed: string[];
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

export interface TutorConversationResponse {
  id: number;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface TraineeDetail {
  user: {
    id: number;
    username: string;
    name: string;
    role: Role;
    created_at: string;
  };
  stats: {
    modules_completed: number;
    modules_in_progress: number;
    total_time_seconds: number;
    quiz_attempts_total: number;
    scenario_attempts_total: number;
    final_exam_passed: boolean | null;
    last_activity_at: string | null;
  };
  module_progress: {
    module_id: string;
    module_title: string;
    module_number: number;
    status: ModuleStatus | 'available';
    quiz_score: number | null;
    started_at: string | null;
    completed_at: string | null;
    time_seconds: number;
  }[];
}

export type TraineeActivityEvent =
  | {
      type: 'section_view';
      module_id: string;
      module_title: string;
      section_id: string;
      duration_seconds: number;
      viewed_at: string;
      timestamp: string;
    }
  | {
      type: 'quiz_attempt';
      id: number;
      module_id: string;
      module_title: string;
      score: number;
      total: number;
      passed: boolean;
      answers: QuizAnswer[];
      created_at: string;
      timestamp: string;
    }
  | {
      type: 'scenario_attempt';
      id: number;
      module_id: string;
      module_title: string;
      scenario_id: string;
      score: number | null;
      transcript: ChatMessage[];
      grade: RoleplayGrade | FreeResponseGrade | null;
      created_at: string;
      timestamp: string;
    }
  | {
      type: 'ai_conversation';
      id: number;
      module_id: string | null;
      module_title: string | null;
      mode: string;
      message_count: number;
      last_message_preview: string;
      updated_at: string;
      timestamp: string;
    }
  | {
      type: 'final_exam';
      id: number;
      score: number;
      total: number;
      passed: boolean;
      created_at: string;
      timestamp: string;
    };

export interface TraineeConversation {
  id: number;
  module_id: string | null;
  module_title: string | null;
  mode: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface TraineeScenarioAttempt {
  id: number;
  module_id: string;
  module_title: string;
  scenario_id: string;
  scenario_type: ScenarioType | null;
  scenario_prompt: string | null;
  transcript: ChatMessage[];
  grade: RoleplayGrade | FreeResponseGrade | null;
  score: number | null;
  created_at: string;
}

export interface TraineeQuizAttempt {
  id: number;
  module_id: string;
  module_title: string;
  score: number;
  total: number;
  passed: boolean;
  created_at: string;
  questions: {
    question_id: string;
    question: string;
    type: QuestionType;
    options: string[] | null;
    correct_index: number | null;
    correct_answer_text: string | null;
    explanation: string;
    trainee_answer: string | number | null;
    correct: boolean;
  }[];
}
