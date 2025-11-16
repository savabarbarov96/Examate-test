import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, XCircle, Award, Clock, Target, TrendingUp, BookOpen, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuestionResult {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  points: number;
  earned: number;
  userAnswer: number | string | null;
  correctAnswer: number | string;
  options?: string[];
  feedback?: string;
}

// Mock results data
const mockResults = {
  examId: '1',
  examTitle: 'Advanced Calculus Final Exam',
  studentName: 'John Doe',
  submittedAt: '2025-01-16T14:30:00',
  totalPoints: 31,
  earnedPoints: 24,
  percentage: 77,
  timeSpent: 95, // minutes
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice' as const,
      question: 'What is the derivative of f(x) = x³ + 2x² - 5x + 1?',
      points: 5,
      earned: 5,
      userAnswer: 0,
      correctAnswer: 0,
      options: ['3x² + 4x - 5', '3x² + 2x - 5', 'x³ + 4x - 5', '3x² + 4x + 5'],
      feedback: 'Excellent! You correctly applied the power rule to each term.',
    },
    {
      id: 'q2',
      type: 'true-false' as const,
      question: 'The integral of a constant function is always zero.',
      points: 3,
      earned: 0,
      userAnswer: 'true',
      correctAnswer: 'false',
      feedback: 'Incorrect. The integral of a constant c is cx + C, where C is the constant of integration.',
    },
    {
      id: 'q3',
      type: 'short-answer' as const,
      question: 'Calculate the limit as x approaches 0 of (sin(x))/x',
      points: 8,
      earned: 8,
      userAnswer: '1',
      correctAnswer: '1',
      feedback: 'Perfect! This is a fundamental limit in calculus.',
    },
    {
      id: 'q4',
      type: 'essay' as const,
      question: 'Explain the Fundamental Theorem of Calculus and provide an example of its application.',
      points: 15,
      earned: 11,
      userAnswer: 'The Fundamental Theorem of Calculus connects differentiation and integration...',
      correctAnswer: '',
      feedback: 'Good explanation of the theorem. Your example was clear, but you could have elaborated more on the practical applications. Consider discussing how it relates to finding areas under curves.',
    },
  ] as QuestionResult[],
};

export default function ExamResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-[oklch(0.6_0.15_145)]'; // A
    if (percentage >= 80) return 'text-[oklch(0.68_0.14_75)]'; // B
    if (percentage >= 70) return 'text-[oklch(0.65_0.16_50)]'; // C
    if (percentage >= 60) return 'text-[oklch(0.65_0.16_50)]'; // D
    return 'text-destructive'; // F
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const correctAnswers = mockResults.questions.filter((q) => q.earned === q.points).length;
  const partialAnswers = mockResults.questions.filter((q) => q.earned > 0 && q.earned < q.points).length;
  const incorrectAnswers = mockResults.questions.filter((q) => q.earned === 0).length;

  return (
    <div className="min-h-screen bg-scholarly-gradient p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/exams')}
              className="hover-glow"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl md:text-5xl font-display text-primary">
                Exam Results
              </h1>
              <p className="text-muted-foreground mt-1">{mockResults.examTitle}</p>
            </div>
          </div>
          <Button variant="outline" className="hover-glow">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Score Overview */}
        <Card className="glass-effect border-2 border-primary/20 animate-fade-in-up delay-100">
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score Circle */}
              <div className="flex flex-col items-center justify-center p-8">
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-muted"
                      opacity="0.2"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeLinecap="round"
                      className={getGradeColor(mockResults.percentage)}
                      strokeDasharray={`${(mockResults.percentage / 100) * 553} 553`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-6xl font-display ${getGradeColor(mockResults.percentage)}`}>
                      {mockResults.percentage}%
                    </span>
                    <span className={`text-4xl font-display ${getGradeColor(mockResults.percentage)}`}>
                      {getGradeLetter(mockResults.percentage)}
                    </span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-2xl font-display">
                    {mockResults.earnedPoints} / {mockResults.totalPoints} points
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted {new Date(mockResults.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[oklch(var(--exam-active))]/20">
                      <CheckCircle2 className="w-6 h-6 text-[oklch(var(--exam-active))]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Correct Answers</p>
                      <p className="text-2xl font-display">{correctAnswers}</p>
                    </div>
                  </div>
                  <Badge className="bg-[oklch(var(--exam-active))] text-white">
                    {Math.round((correctAnswers / mockResults.questions.length) * 100)}%
                  </Badge>
                </div>

                {partialAnswers > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[oklch(0.68_0.14_75)]/20">
                        <Target className="w-6 h-6 text-[oklch(0.68_0.14_75)]" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Partial Credit</p>
                        <p className="text-2xl font-display">{partialAnswers}</p>
                      </div>
                    </div>
                    <Badge className="bg-[oklch(0.68_0.14_75)] text-[oklch(0.3_0.05_25)]">
                      {Math.round((partialAnswers / mockResults.questions.length) * 100)}%
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/20">
                      <XCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Incorrect Answers</p>
                      <p className="text-2xl font-display">{incorrectAnswers}</p>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {Math.round((incorrectAnswers / mockResults.questions.length) * 100)}%
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Spent</p>
                      <p className="text-2xl font-display">{mockResults.timeSpent} min</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className="glass-effect border-2 animate-fade-in-up delay-200">
          <CardHeader>
            <CardTitle className="text-2xl font-display flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Performance Insights
            </CardTitle>
            <CardDescription>Areas of strength and opportunities for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border-2 border-[oklch(var(--exam-active))]/30 bg-[oklch(var(--exam-active))]/5">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-[oklch(var(--exam-active))] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display text-lg mb-2">Strengths</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Strong understanding of derivatives and limits</li>
                      <li>• Excellent application of fundamental theorems</li>
                      <li>• Clear mathematical reasoning</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border-2 border-[oklch(0.65_0.16_50)]/30 bg-[oklch(0.65_0.16_50)]/5">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-[oklch(0.65_0.16_50)] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display text-lg mb-2">Areas to Review</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Review integral properties and theorems</li>
                      <li>• Practice more essay-style explanations</li>
                      <li>• Explore real-world applications in detail</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card className="glass-effect border-2 animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Question-by-Question Review</CardTitle>
            <CardDescription>Review your answers and feedback for each question</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockResults.questions.map((question, index) => {
              const isCorrect = question.earned === question.points;
              const isPartial = question.earned > 0 && question.earned < question.points;
              const isExpanded = expandedQuestion === question.id;

              return (
                <Card
                  key={question.id}
                  className={`border-2 transition-all duration-200 ${
                    isCorrect ? 'border-[oklch(var(--exam-active))]/50' : ''
                  } ${isPartial ? 'border-[oklch(0.68_0.14_75)]/50' : ''} ${
                    !isCorrect && !isPartial ? 'border-destructive/50' : ''
                  }`}
                >
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-background">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-[oklch(var(--exam-active))]" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl font-display text-primary">
                              Question {index + 1}
                            </span>
                            <Badge variant="outline">
                              {question.earned} / {question.points} pts
                            </Badge>
                          </div>
                          <p className="text-base leading-relaxed">{question.question}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 space-y-4 animate-fade-in">
                      {/* Multiple Choice Review */}
                      {question.type === 'multiple-choice' && question.options && (
                        <div className="space-y-2 pl-10">
                          {question.options.map((option, optIndex) => {
                            const isUserAnswer = question.userAnswer === optIndex;
                            const isCorrectOption = question.correctAnswer === optIndex;

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectOption
                                    ? 'border-[oklch(var(--exam-active))] bg-[oklch(var(--exam-active))]/10'
                                    : isUserAnswer
                                    ? 'border-destructive bg-destructive/10'
                                    : 'border-border'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectOption && (
                                    <CheckCircle2 className="w-4 h-4 text-[oklch(var(--exam-active))]" />
                                  )}
                                  {isUserAnswer && !isCorrectOption && (
                                    <XCircle className="w-4 h-4 text-destructive" />
                                  )}
                                  <span>
                                    <strong className="font-display mr-2">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </strong>
                                    {option}
                                    {isCorrectOption && (
                                      <Badge className="ml-2 bg-[oklch(var(--exam-active))] text-white">
                                        Correct
                                      </Badge>
                                    )}
                                    {isUserAnswer && !isCorrectOption && (
                                      <Badge variant="destructive" className="ml-2">
                                        Your Answer
                                      </Badge>
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* True/False Review */}
                      {question.type === 'true-false' && (
                        <div className="pl-10 flex gap-3">
                          <div
                            className={`flex-1 p-3 rounded-lg border-2 ${
                              question.correctAnswer === 'true'
                                ? 'border-[oklch(var(--exam-active))] bg-[oklch(var(--exam-active))]/10'
                                : question.userAnswer === 'true'
                                ? 'border-destructive bg-destructive/10'
                                : 'border-border'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {question.correctAnswer === 'true' && (
                                <CheckCircle2 className="w-4 h-4 text-[oklch(var(--exam-active))]" />
                              )}
                              {question.userAnswer === 'true' && question.correctAnswer !== 'true' && (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                              <span className="font-display">True</span>
                            </div>
                          </div>
                          <div
                            className={`flex-1 p-3 rounded-lg border-2 ${
                              question.correctAnswer === 'false'
                                ? 'border-[oklch(var(--exam-active))] bg-[oklch(var(--exam-active))]/10'
                                : question.userAnswer === 'false'
                                ? 'border-destructive bg-destructive/10'
                                : 'border-border'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {question.correctAnswer === 'false' && (
                                <CheckCircle2 className="w-4 h-4 text-[oklch(var(--exam-active))]" />
                              )}
                              {question.userAnswer === 'false' && question.correctAnswer !== 'false' && (
                                <XCircle className="w-4 h-4 text-destructive" />
                              )}
                              <span className="font-display">False</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Written Answers */}
                      {(question.type === 'short-answer' || question.type === 'essay') && (
                        <div className="pl-10 space-y-3">
                          <div>
                            <Label className="text-sm text-muted-foreground mb-2">Your Answer:</Label>
                            <div className="p-4 bg-muted rounded-lg">
                              <p className="whitespace-pre-wrap">{question.userAnswer}</p>
                            </div>
                          </div>
                          {question.correctAnswer && (
                            <div>
                              <Label className="text-sm text-muted-foreground mb-2">Model Answer:</Label>
                              <div className="p-4 bg-[oklch(var(--exam-active))]/10 rounded-lg border-2 border-[oklch(var(--exam-active))]/30">
                                <p className="whitespace-pre-wrap">{question.correctAnswer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feedback */}
                      {question.feedback && (
                        <div className="pl-10">
                          <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                            <div className="flex items-start gap-3">
                              <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-display text-sm mb-1">Instructor Feedback:</p>
                                <p className="text-sm leading-relaxed">{question.feedback}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center animate-fade-in-up delay-400">
          <Button variant="outline" size="lg" onClick={() => navigate('/exams')} className="hover-glow">
            Back to Exams
          </Button>
          <Button size="lg" className="hover-glow">
            <Download className="w-4 h-4 mr-2" />
            Download Results
          </Button>
        </div>
      </div>
    </div>
  );
}
