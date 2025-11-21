import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { mockQuestionPool } from '@/utils/mockQuestions';

interface Answer {
  questionId: string;
  answer: number | string | null;
  flagged: boolean;
}

// Generate a random exam for the take page
const generateMockExam = () => {
  const questions = mockQuestionPool.slice(0, 10); // Take first 10 for demo
  return {
    id: '1',
    title: 'Sample Generated Exam',
    description: 'This is a sample exam generated from the question pool.',
    duration: 60,
    questions: questions
  };
};

const mockExam = generateMockExam();

export default function ExamTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    mockExam.questions.map((q) => ({
      questionId: q.id,
      answer: null,
      flagged: false,
    }))
  );
  const [timeRemaining, setTimeRemaining] = useState(mockExam.duration * 60); // in seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentQuestion = mockExam.questions[currentQuestionIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id);

  const updateAnswer = (questionId: string, answer: number | string | null) => {
    setAnswers(answers.map((a) => (a.questionId === questionId ? { ...a, answer } : a)));
  };

  const toggleFlag = (questionId: string) => {
    setAnswers(
      answers.map((a) => (a.questionId === questionId ? { ...a, flagged: !a.flagged } : a))
    );
  };

  const handleSubmit = () => {
    // API call to submit answers
    console.log('Submitting exam...', answers);
    navigate(`/exams/${id}/results`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining < 300) return 'text-destructive'; // < 5 minutes
    if (timeRemaining < 600) return 'text-yellow-500'; // < 10 minutes
    return 'text-primary';
  };

  const answeredCount = answers.filter((a) => a.answer !== null).length;
  const flaggedCount = answers.filter((a) => a.flagged).length;
  const progress = (answeredCount / mockExam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-scholarly-gradient">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExitDialog(true)}
                className="hover-glow"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-display text-primary">{mockExam.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {mockExam.questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Time Remaining</p>
                <div className={`flex items-center gap-2 text-2xl font-mono font-semibold ${getTimeColor()}`}>
                  <Clock className="w-5 h-5" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <Button onClick={() => setShowSubmitDialog(true)} size="lg" className="hover-glow">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Submit Exam
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>{answeredCount} answered</span>
              <span>{flaggedCount} flagged for review</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-2 sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-display">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {mockExam.questions.map((question, index) => {
                    const answer = answers.find((a) => a.questionId === question.id);
                    const isAnswered = answer?.answer !== null;
                    const isFlagged = answer?.flagged;
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={question.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`
                          relative aspect-square rounded-lg font-mono font-semibold text-sm
                          transition-all duration-200 hover:scale-110
                          ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : ''}
                          ${!isCurrent && isAnswered ? 'bg-green-500 text-white' : ''}
                          ${!isCurrent && !isAnswered ? 'bg-muted text-muted-foreground' : ''}
                        `}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 fill-current" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted" />
                    <span>Unanswered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="glass-effect border-2 animate-fade-in">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl font-display text-primary">
                        Question {currentQuestionIndex + 1}
                      </span>
                      <Badge variant="outline" className="text-base">
                        {currentQuestion.points} points
                      </Badge>
                      <Badge variant="secondary" className="text-xs uppercase">
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xl leading-relaxed">{currentQuestion.question}</p>
                  </div>
                  <Button
                    variant={currentAnswer?.flagged ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className="flex-shrink-0"
                  >
                    <Flag className={`w-5 h-5 ${currentAnswer?.flagged ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Multiple Choice */}
                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <Label
                        key={index}
                        className={`
                          flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer
                          transition-all duration-200 hover:border-primary/50 hover:bg-primary/5
                          ${currentAnswer?.answer === index ? 'border-primary bg-primary/10' : 'border-border'}
                        `}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={currentAnswer?.answer === index}
                          onChange={() => updateAnswer(currentQuestion.id, index)}
                          className="mt-1 w-5 h-5 accent-primary flex-shrink-0"
                        />
                        <span className="text-base leading-relaxed">
                          <strong className="font-display text-lg mr-2">
                            {String.fromCharCode(65 + index)}.
                          </strong>
                          {option}
                        </span>
                      </Label>
                    ))}
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.type === 'true-false' && (
                  <div className="flex gap-4">
                    <Label
                      className={`
                        flex-1 flex items-center justify-center gap-3 p-6 rounded-lg border-2 cursor-pointer
                        transition-all duration-200 hover:border-primary/50 hover:bg-primary/5
                        ${currentAnswer?.answer === 'true' ? 'border-primary bg-primary/10' : 'border-border'}
                      `}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        checked={currentAnswer?.answer === 'true'}
                        onChange={() => updateAnswer(currentQuestion.id, 'true')}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="text-xl font-display">True</span>
                    </Label>
                    <Label
                      className={`
                        flex-1 flex items-center justify-center gap-3 p-6 rounded-lg border-2 cursor-pointer
                        transition-all duration-200 hover:border-primary/50 hover:bg-primary/5
                        ${currentAnswer?.answer === 'false' ? 'border-primary bg-primary/10' : 'border-border'}
                      `}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        checked={currentAnswer?.answer === 'false'}
                        onChange={() => updateAnswer(currentQuestion.id, 'false')}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="text-xl font-display">False</span>
                    </Label>
                  </div>
                )}

                {/* Short Answer */}
                {currentQuestion.type === 'short-answer' && (
                  <div>
                    <Textarea
                      placeholder="Enter your answer here..."
                      value={(currentAnswer?.answer as string) || ''}
                      onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                      className="min-h-24 text-base resize-none"
                    />
                  </div>
                )}

                {/* Essay */}
                {currentQuestion.type === 'essay' && (
                  <div>
                    <Textarea
                      placeholder="Write your essay response here..."
                      value={(currentAnswer?.answer as string) || ''}
                      onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                      className="min-h-64 text-base resize-y"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {((currentAnswer?.answer as string) || '').split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="hover-glow"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>
              {currentQuestionIndex === mockExam.questions.length - 1 ? (
                <Button
                  size="lg"
                  onClick={() => setShowSubmitDialog(true)}
                  className="hover-glow"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Submit Exam
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentQuestionIndex(Math.min(mockExam.questions.length - 1, currentQuestionIndex + 1))}
                  className="hover-glow"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-display">Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You have answered {answeredCount} out of {mockExam.questions.length} questions.
              </p>
              {answeredCount < mockExam.questions.length && (
                <div className="flex items-start gap-2 text-yellow-500">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>
                    {mockExam.questions.length - answeredCount} question(s) remain unanswered and will be marked as incorrect.
                  </p>
                </div>
              )}
              <p className="font-semibold">
                Once submitted, you cannot make changes to your answers.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit Exam</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-display">Exit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-3">
                Your progress has been automatically saved, but leaving now will not submit your answers.
              </p>
              <p className="font-semibold text-destructive">
                You can return to continue the exam before the time expires.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay on Exam</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/exams')}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
