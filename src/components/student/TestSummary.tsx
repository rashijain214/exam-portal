import React from 'react';
import { CheckCircle, XCircle, Clock, Flag } from 'lucide-react';
import { Question, TestResult } from '../../types';

interface TestSummaryProps {
  result: TestResult;
  questions: Question[];
  answers: { [questionId: string]: number };
}

const TestSummary: React.FC<TestSummaryProps> = ({ result, questions, answers }) => {
  const getSectionQuestions = (section: string) => 
    questions.filter(q => q.section === section);

  const getSectionScore = (section: 'Physics' | 'Chemistry' | 'Math') => 
    result.sectionWiseScore[section];

  const getQuestionStatus = (question: Question) => {
    const userAnswer = answers[question._id];
    if (userAnswer === undefined) return 'not-attempted';
    return userAnswer === question.correctIndex ? 'correct' : 'incorrect';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
            <p className="text-lg text-gray-600">Here's your performance summary</p>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {result.score}%
            </div>
            <div className="text-sm text-gray-600">Overall Score</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {result.correctAnswers}
            </div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {result.totalQuestions - result.correctAnswers}
            </div>
            <div className="text-sm text-gray-600">Incorrect Answers</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {Math.floor(result.timeSpent / 60)}m
            </div>
            <div className="text-sm text-gray-600">Time Spent</div>
          </div>
        </div>

        {/* Section-wise Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Section-wise Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['Physics', 'Chemistry', 'Math'] as const).map((section) => {
              const sectionScore = getSectionScore(section);
              const percentage = Math.round((sectionScore.correct / sectionScore.total) * 100);
              
              return (
                <div key={section} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{section}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Correct: {sectionScore.correct}
                      </span>
                      <span className="text-red-600">
                        Incorrect: {sectionScore.total - sectionScore.correct}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
          
          {(['Physics', 'Chemistry', 'Math'] as const).map((section) => {
            const sectionQuestions = getSectionQuestions(section);
            
            return (
              <div key={section} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{section}</h3>
                
                <div className="space-y-4">
                  {sectionQuestions.map((question, index) => {
                    const status = getQuestionStatus(question);
                    const userAnswer = answers[question._id];
                    
                    return (
                      <div 
                        key={question._id}
                        className={`border-l-4 pl-6 py-4 ${
                          status === 'correct' 
                            ? 'border-green-500 bg-green-50' 
                            : status === 'incorrect'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {status === 'correct' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {status === 'incorrect' && <XCircle className="h-5 w-5 text-red-500" />}
                            {status === 'not-attempted' && <Clock className="h-5 w-5 text-gray-400" />}
                          </div>
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              Q{index + 1}. {question.text}
                            </p>
                            
                            <div className="space-y-2 text-sm">
                              {status !== 'not-attempted' && (
                                <p className="text-gray-600">
                                  Your answer: <span className="font-medium">
                                    {question.options[userAnswer]}
                                  </span>
                                </p>
                              )}
                              
                              <p className="text-gray-600">
                                Correct answer: <span className="font-medium text-green-700">
                                  {question.options[question.correctIndex]}
                                </span>
                              </p>
                              
                              {question.explanation && (
                                <p className="text-gray-600">
                                  <span className="font-medium">Explanation:</span> {question.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestSummary;