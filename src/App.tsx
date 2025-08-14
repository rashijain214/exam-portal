import React, { useState } from 'react';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import Header from './components/common/Header';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './components/teacher/Dashboard';
import CreateTest from './components/teacher/CreateTest';
import ResultsAnalytics from './components/teacher/ResultsAnalytics';
import TestInterface from './components/student/TestInterface';
import TestSummary from './components/student/TestSummary';
import { Test, Question, StudentTestSession, TestResult, ClassAnalytics } from './types';

// Mock data
const mockQuestions: Question[] = [
  {
    _id: '1',
    section: 'Physics',
    text: 'A ball is thrown vertically upward with an initial velocity of 20 m/s. What is the maximum height reached by the ball? (g = 10 m/s²)',
    options: ['10 m', '20 m', '30 m', '40 m'],
    correctIndex: 1,
    explanation: 'Using the equation v² = u² + 2as, where final velocity v = 0 at maximum height, u = 20 m/s, a = -g = -10 m/s². Solving: 0 = 400 - 20h, h = 20 m.'
  },
  {
    _id: '2',
    section: 'Chemistry',
    text: 'Which of the following is the molecular formula of benzene?',
    options: ['C₆H₆', 'C₆H₁₂', 'C₈H₈', 'C₅H₁₀'],
    correctIndex: 0,
    explanation: 'Benzene is an aromatic hydrocarbon with the molecular formula C₆H₆, consisting of a ring of six carbon atoms with alternating double bonds.'
  },
  {
    _id: '3',
    section: 'Math',
    text: 'Find the derivative of f(x) = x³ + 2x² - 5x + 3',
    options: ['3x² + 4x - 5', '3x² + 2x - 5', 'x³ + 4x - 5', '3x + 4x - 5'],
    correctIndex: 0,
    explanation: 'Using the power rule: d/dx(x³) = 3x², d/dx(2x²) = 4x, d/dx(-5x) = -5, d/dx(3) = 0. Therefore, f\'(x) = 3x² + 4x - 5.'
  }
];

const mockTests: Test[] = [
  {
    _id: '1',
    title: 'JEE Mains Mock Test 2024',
    syllabus: 'Physics: Mechanics, Thermodynamics | Chemistry: Organic Chemistry | Math: Calculus',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '12:00',
    duration: 180,
    questions: mockQuestions,
    assignedTo: ['student1', 'student2', 'student3'],
    createdBy: 'teacher1',
    status: 'completed'
  },
  {
    _id: '2',
    title: 'NEET Practice Test',
    syllabus: 'Biology: Cell Biology | Chemistry: Inorganic Chemistry | Physics: Optics',
    date: '2024-01-20',
    startTime: '10:00',
    endTime: '13:00',
    duration: 180,
    questions: mockQuestions,
    assignedTo: ['student1', 'student4'],
    createdBy: 'teacher1',
    status: 'published'
  }
];

const mockSession: StudentTestSession = {
  _id: 'session1',
  userId: 'student1',
  testId: '1',
  answers: { '1': 1, '2': 0 },
  currentQuestion: 0,
  remainingTime: 10800, // 3 hours in seconds
  violations: 0,
  submitted: false,
  startedAt: new Date().toISOString()
};

const mockResult: TestResult = {
  _id: 'result1',
  userId: 'student1',
  testId: '1',
  score: 85,
  totalQuestions: 90,
  correctAnswers: 77,
  timeSpent: 160,
  sectionWiseScore: {
    Physics: { correct: 25, total: 30 },
    Chemistry: { correct: 26, total: 30 },
    Math: { correct: 26, total: 30 }
  },
  submittedAt: new Date().toISOString()
};

const mockAnalytics: ClassAnalytics = {
  testId: '1',
  totalStudents: 45,
  averageScore: 72,
  highestScore: 95,
  lowestScore: 45,
  scoreDistribution: [
    { range: '90-100', count: 8 },
    { range: '80-89', count: 12 },
    { range: '70-79', count: 15 },
    { range: '60-69', count: 7 },
    { range: '50-59', count: 2 },
    { range: '40-49', count: 1 }
  ],
  sectionWiseAnalytics: {
    Physics: { averageScore: 68, difficulty: 'Hard' },
    Chemistry: { averageScore: 75, difficulty: 'Medium' },
    Math: { averageScore: 73, difficulty: 'Medium' }
  }
};

type AppView = 'dashboard' | 'create-test' | 'test-interface' | 'test-summary' | 'results-analytics';

function App() {
  const authData = useAuthProvider();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [tests, setTests] = useState(mockTests);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  if (authData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authData.user) {
    return (
      <AuthContext.Provider value={authData}>
        <LoginForm onSuccess={() => {}} />
      </AuthContext.Provider>
    );
  }

  const handleCreateTest = (testData: Partial<Test>) => {
    const newTest: Test = {
      _id: Date.now().toString(),
      title: testData.title || '',
      syllabus: testData.syllabus || '',
      date: testData.date || '',
      startTime: testData.startTime || '',
      endTime: testData.endTime || '',
      duration: testData.duration || 180,
      questions: testData.questions || [],
      assignedTo: testData.assignedTo || [],
      createdBy: authData.user!._id,
      status: testData.status || 'draft'
    };
    
    setTests([...tests, newTest]);
    setCurrentView('dashboard');
  };

  const handleViewResults = (testId: string) => {
    const test = tests.find(t => t._id === testId);
    if (test) {
      setSelectedTest(test);
      setCurrentView('results-analytics');
    }
  };

  const handleSubmitTest = () => {
    setCurrentView('test-summary');
  };

  const renderContent = () => {
    if (authData.user?.role === 'teacher') {
      switch (currentView) {
        case 'create-test':
          return (
            <CreateTest
              onSave={handleCreateTest}
              onCancel={() => setCurrentView('dashboard')}
            />
          );
        case 'results-analytics':
          return selectedTest ? (
            <ResultsAnalytics
              test={selectedTest}
              results={[mockResult]}
              analytics={mockAnalytics}
              onBack={() => setCurrentView('dashboard')}
            />
          ) : null;
        default:
          return (
            <Dashboard
              tests={tests}
              onCreateTest={() => setCurrentView('create-test')}
              onViewResults={handleViewResults}
            />
          );
      }
    } else {
      // Student views
      switch (currentView) {
        case 'test-interface':
          return (
            <TestInterface
              testId="1"
              questions={mockQuestions}
              session={mockSession}
              onSubmit={handleSubmitTest}
            />
          );
        case 'test-summary':
          return (
            <TestSummary
              result={mockResult}
              questions={mockQuestions}
              answers={mockSession.answers}
            />
          );
        default:
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Tests</h1>
                <div className="grid gap-6">
                  {tests.filter(test => test.status === 'published').map((test) => (
                    <div key={test._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{test.title}</h3>
                      <p className="text-gray-600 mb-4">{test.syllabus}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {test.date} • {test.startTime} - {test.endTime}
                        </div>
                        <button
                          onClick={() => setCurrentView('test-interface')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Start Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
      }
    }
  };

  return (
    <AuthContext.Provider value={authData}>
      <div className="min-h-screen bg-gray-50">
        {currentView !== 'test-interface' && <Header />}
        {renderContent()}
      </div>
    </AuthContext.Provider>
  );
}

export default App;