import type {
  AdminUserSummary,
  ChatMessage,
  ExamResult,
  ExamStartResponse,
  FreeResponseGrade,
  ModuleFull,
  ModuleSummary,
  QuizAnswer,
  QuizResult,
  Role,
  RoleplayGrade,
  TraineeActivityEvent,
  TraineeConversation,
  TraineeDetail,
  TraineeQuizAttempt,
  TraineeScenarioAttempt,
  User,
} from '../types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method,
    credentials: 'include',
    headers: {},
  };
  if (body !== undefined) {
    (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetch(path, init);
  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && (data.error || data.message)) ||
      (typeof data === 'string' && data) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export const auth = {
  login: (username: string, password: string) =>
    apiClient.post<{ user: User }>('/api/auth/login', { username, password }),
  logout: () => apiClient.post<{ ok: true }>('/api/auth/logout'),
  me: () => apiClient.get<{ user: User }>('/api/auth/me'),
};

export const modules = {
  list: () => apiClient.get<ModuleSummary[]>('/api/modules'),
  get: (id: string) => apiClient.get<ModuleFull>(`/api/modules/${encodeURIComponent(id)}`),
};

export const progress = {
  start: (moduleId: string) =>
    apiClient.post<{ ok: true }>(`/api/progress/${encodeURIComponent(moduleId)}/start`),
  complete: (moduleId: string) =>
    apiClient.post<{ ok: true }>(`/api/progress/${encodeURIComponent(moduleId)}/complete`),
  all: () => apiClient.get<Record<string, { status: string; quiz_score: number | null }>>('/api/progress'),
};

export const quiz = {
  submit: (moduleId: string, answers: QuizAnswer[]) =>
    apiClient.post<QuizResult>(`/api/quiz/${encodeURIComponent(moduleId)}/submit`, { answers }),
};

export const ai = {
  tutor: (moduleId: string, message: string, history: ChatMessage[]) =>
    apiClient.post<{ message: string; history: ChatMessage[] }>('/api/ai/tutor', {
      moduleId,
      message,
      history,
    }),
  roleplay: (moduleId: string, scenarioId: string, message: string, history: ChatMessage[]) =>
    apiClient.post<{ message: string; history: ChatMessage[] }>('/api/ai/roleplay', {
      moduleId,
      scenarioId,
      message,
      history,
    }),
  gradeResponse: (moduleId: string, scenarioId: string, response: string) =>
    apiClient.post<FreeResponseGrade>('/api/ai/grade-response', {
      moduleId,
      scenarioId,
      response,
    }),
  gradeRoleplay: (moduleId: string, scenarioId: string, transcript: ChatMessage[]) =>
    apiClient.post<RoleplayGrade>('/api/ai/grade-roleplay', {
      moduleId,
      scenarioId,
      transcript,
    }),
};

export const exam = {
  start: () => apiClient.post<ExamStartResponse>('/api/exam/start'),
  submit: (examId: string, answers: QuizAnswer[]) =>
    apiClient.post<ExamResult>('/api/exam/submit', { examId, answers }),
  results: () => apiClient.get<ExamResult>('/api/exam/results'),
};

export const admin = {
  users: {
    list: () => apiClient.get<AdminUserSummary[]>('/api/admin/users'),
    create: (payload: { username: string; password: string; name: string; role: Role }) =>
      apiClient.post<AdminUserSummary>('/api/admin/users', payload),
    reset: (id: number) => apiClient.post<{ ok: true }>(`/api/admin/users/${id}/reset`),
    delete: (id: number) => apiClient.delete<{ ok: true }>(`/api/admin/users/${id}`),
  },
  getTrainee: (id: number) => apiClient.get<TraineeDetail>(`/api/admin/users/${id}`),
  getTraineeActivity: (id: number) =>
    apiClient.get<TraineeActivityEvent[]>(`/api/admin/users/${id}/activity`),
  getTraineeConversations: (id: number) =>
    apiClient.get<TraineeConversation[]>(`/api/admin/users/${id}/conversations`),
  getTraineeScenarios: (id: number) =>
    apiClient.get<TraineeScenarioAttempt[]>(`/api/admin/users/${id}/scenario-attempts`),
  getTraineeQuizzes: (id: number) =>
    apiClient.get<TraineeQuizAttempt[]>(`/api/admin/users/${id}/quiz-attempts`),
};

export const sections = {
  recordView: (moduleId: string, sectionId: string, durationSeconds: number) =>
    apiClient.post<{ ok: true; duration_seconds: number }>('/api/sections/view', {
      moduleId,
      sectionId,
      durationSeconds,
    }),
};
