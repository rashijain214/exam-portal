// Core Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  assignedTests?: string[];
  violations?: number;
}

export interface Question {
  _id: string;
  section: 'Physics' | 'Chemistry' | 'Math';
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Test {
  _id: string;
  title: string;
  syllabus: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  questions: Question[];
  assignedTo: string[];
  createdBy: string;
  status: 'draft' | 'published' | 'completed';
}

export interface StudentTestSession {
  _id: string;
  userId: string;
  testId: string;
  answers: { [questionId: string]: number };
  currentQuestion: number;
  remainingTime: number;
  violations: number;
  submitted: boolean;
  startedAt: string;
  submittedAt?: string;
}

export interface TestResult {
  _id: string;
  userId: string;
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  sectionWiseScore: {
    Physics: { correct: number; total: number };
    Chemistry: { correct: number; total: number };
    Math: { correct: number; total: number };
  };
  submittedAt: string;
}

export interface ClassAnalytics {
  testId: string;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scoreDistribution: { range: string; count: number }[];
  sectionWiseAnalytics: {
    Physics: { averageScore: number; difficulty: 'Easy' | 'Medium' | 'Hard' };
    Chemistry: { averageScore: number; difficulty: 'Easy' | 'Medium' | 'Hard' };
    Math: { averageScore: number; difficulty: 'Easy' | 'Medium' | 'Hard' };
  };
}