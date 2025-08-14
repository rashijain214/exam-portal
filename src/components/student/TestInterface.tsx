import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flag, AlertTriangle, CheckCircle } from 'lucide-react';
import Timer from '../common/Timer';
import { Question, StudentTestSession } from '../../types';
import { useTabSwitching } from '../../hooks/useTabSwitching';
import { useAutoSave } from '../../hooks/useAutoSave';

interface TestInterfaceProps {
  testId: string;
  questions: Question[];
  session: StudentTestSession;
  onSubmit: () => void;
}

const TestInterface: React.FC<TestInterfaceProps> = ({ 
  testId, 
  questions, 
  session, 
  onSubmit 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(session.currentQuestion);
  const [answers, setAnswers] = useState<{ [key: string]: number }>(session.answers);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<'Physics' | 'Chemistry' | 'Math'>('Physics');
  const [violations, setViolations] = useState(session.violations);
  const [showViolationWarning, setShowViolationWarning] = useState(false);

  // Security: Disable context menu, copy, paste
  useEffect(() => {
    const preventActions = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const preventKeyActions = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+C, Ctrl+V, Ctrl+A
      if (
        e.key === 'F12' ||
        (e.ctrlKey && (e.shiftKey && e.key === 'I')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'v') ||
        (e.ctrlKey && e.key === 'a')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', preventActions);
    document.addEventListener('selectstart', preventActions);
    document.addEventListener('keydown', preventKeyActions);

    return () => {
      document.removeEventListener('contextmenu', preventActions);
      document.removeEventListener('selectstart', preventActions);
      document.removeEventListener('keydown', preventKeyActions);
    };
  }, []);

  // Tab switching detection
  useTabSwitching({
    onViolation: () => {
      setViolations(prev => prev + 1);
      setShowViolationWarning(true);
      setTimeout(() => setShowViolationWarning(false), 3000);
    },
    maxViolations: 3,
    onMaxViolations: () => {
      alert('Maximum violations reached. Test will be auto-submitted.');
      onSubmit();
    }
  });

  // Auto-save functionality
  const { saveNow } = useAutoSave(
    { answers, currentQuestion, violations },
    (data) => {
      // In production, save to backend
      console.log('Auto-saving:', data);
    }
  );

  const sectionQuestions = questions.filter(q => q.section === activeSection);
  const currentQuestionData = sectionQuestions[currentQuestion] || questions[0];
  
  const handleAnswerSelect = (optionIndex: number) => {
    if (!currentQuestionData) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestionData._id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < sectionQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const toggleMarkForReview = () => {
    if (!currentQuestionData) return;
    
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionData._id)) {
        newSet.delete(currentQuestionData._id);
      } else {
        newSet.add(currentQuestionData._id);
      }
      return newSet;
    });
  };

  const getQuestionStatus = (questionId: string) => {
    if (answers[questionId] !== undefined) {
      return markedForReview.has(questionId) ? 'answered-marked' : 'answered';
    }
    return markedForReview.has(questionId) ? 'marked' : 'not-attempted';
  };

  const getSectionStats = (section: 'Physics' | 'Chemistry' | 'Math') => {
    const sectionQs = questions.filter(q => q.section === section);
    const answered = sectionQs.filter(q => answers[q._id] !== undefined).length;
    return { total: sectionQs.length, answered };
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Violation Warning */}
      {showViolationWarning && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Warning: Tab switching detected! ({violations}/3)</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-semibold text-gray-900">Physics Test - JEE Mains</h1>
          <div className="flex space-x-1">
            {(['Physics', 'Chemistry', 'Math'] as const).map((section) => {
              const stats = getSectionStats(section);
              return (
                <button
                  key={section}
                  onClick={() => {
                    setActiveSection(section);
                    setCurrentQuestion(0);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === section
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {section} ({stats.answered}/{stats.total})
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Timer 
            initialTime={session.remainingTime}
            onTimeUp={onSubmit}
          />
          <button
            onClick={onSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold transition-colors"
          >
            Submit Test
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Question Panel */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{activeSection} Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {sectionQuestions.map((question, index) => {
              const status = getQuestionStatus(question._id);
              return (
                <button
                  key={question._id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-md text-sm font-semibold transition-colors ${
                    currentQuestion === index
                      ? 'bg-purple-600 text-white'
                      : status === 'answered'
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : status === 'answered-marked'
                      ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                      : status === 'marked'
                      ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm text-gray-600">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span className="text-sm text-gray-600">Not Attempted</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
              <span className="text-sm text-gray-600">Marked for Review</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
              <span className="text-sm text-gray-600">Answered & Marked</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {currentQuestionData && (
            <>
              {/* Question Content */}
              <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Question {currentQuestion + 1} of {sectionQuestions.length}
                      </h2>
                      <button
                        onClick={toggleMarkForReview}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                          markedForReview.has(currentQuestionData._id)
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Flag className="h-4 w-4" />
                        <span>Mark for Review</span>
                      </button>
                    </div>

                    <div className="prose prose-lg max-w-none mb-8">
                      <p className="text-gray-800 leading-relaxed">{currentQuestionData.text}</p>
                    </div>

                    <div className="space-y-4">
                      {currentQuestionData.options.map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                            answers[currentQuestionData._id] === index
                              ? 'border-purple-300 bg-purple-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestionData._id}`}
                            value={index}
                            checked={answers[currentQuestionData._id] === index}
                            onChange={() => handleAnswerSelect(index)}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-800 flex-1">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white border-t border-gray-200 p-6">
                <div className="max-w-4xl mx-auto flex justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex space-x-4">
                    <button
                      onClick={saveNow}
                      className="px-6 py-3 bg-blue-100 text-blue-700 rounded-md font-semibold hover:bg-blue-200 transition-colors"
                    >
                      Save Answer
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentQuestion === sectionQuestions.length - 1}
                      className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestInterface;