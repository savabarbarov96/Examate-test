import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, GripVertical, Save, Eye, ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  points: number;
  options?: string[];
  correctAnswer?: number | string;
}

export default function ExamCreatePage() {
  const navigate = useNavigate();
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question: '',
      points: 1,
      options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
      correctAnswer: undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: [...q.options, ''] };
        }
        return q;
      })
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedItem];
    newQuestions.splice(draggedItem, 1);
    newQuestions.splice(index, 0, draggedQuestion);

    setQuestions(newQuestions);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const getQuestionTypeLabel = (type: Question['type']) => {
    const labels = {
      'multiple-choice': 'Multiple Choice',
      'true-false': 'True/False',
      'short-answer': 'Short Answer',
      'essay': 'Essay',
    };
    return labels[type];
  };

  const getQuestionTypeBadge = (type: Question['type']) => {
    const styles = {
      'multiple-choice': 'bg-[oklch(0.55_0.12_190)] text-white',
      'true-false': 'bg-[oklch(0.65_0.16_50)] text-white',
      'short-answer': 'bg-[oklch(0.68_0.14_75)] text-[oklch(0.3_0.05_25)]',
      'essay': 'bg-[oklch(0.48_0.14_280)] text-white',
    };
    return (
      <Badge className={styles[type]}>
        {getQuestionTypeLabel(type)}
      </Badge>
    );
  };

  const handleSave = (asDraft: boolean) => {
    // API call to save exam
    console.log('Saving exam...', { examTitle, examDescription, duration, questions, asDraft });
    navigate('/exams');
  };

  return (
    <div className="min-h-screen bg-scholarly-gradient p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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
                Create Examination
              </h1>
              <p className="text-muted-foreground mt-1">
                Design a comprehensive assessment for your students
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave(true)} className="hover-glow">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => handleSave(false)} className="hover-glow">
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        {/* Exam Details */}
        <Card className="glass-effect border-2 animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Exam Details</CardTitle>
            <CardDescription>Basic information about your examination</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Exam Title</Label>
              <Input
                id="title"
                placeholder="e.g., Advanced Calculus Final Exam"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="text-lg h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of the exam content and objectives..."
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-base">Duration (minutes)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base">Total Points</Label>
                <div className="flex items-center h-12 px-4 bg-muted rounded-md">
                  <BookOpen className="w-5 h-5 mr-3 text-muted-foreground" />
                  <span className="text-2xl font-display text-primary">{totalPoints}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="glass-effect border-2 animate-fade-in-up delay-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-display">Questions</CardTitle>
                <CardDescription>
                  {questions.length} question{questions.length !== 1 ? 's' : ''} added
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion('multiple-choice')}
                  className="hover-glow"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Multiple Choice
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion('true-false')}
                  className="hover-glow"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  True/False
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion('short-answer')}
                  className="hover-glow"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Short Answer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addQuestion('essay')}
                  className="hover-glow"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Essay
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No questions yet. Click one of the buttons above to add your first question.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card
                    key={question.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`border-2 transition-all duration-200 ${
                      draggedItem === index ? 'opacity-50' : ''
                    } hover:border-primary/50 cursor-move animate-scale-in`}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <GripVertical className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-display text-primary">
                                {index + 1}.
                              </span>
                              {getQuestionTypeBadge(question.type)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={question.points}
                                onChange={(e) =>
                                  updateQuestion(question.id, {
                                    points: parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-20 text-center"
                                placeholder="pts"
                              />
                              <span className="text-sm text-muted-foreground">points</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteQuestion(question.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            placeholder="Enter your question here..."
                            value={question.question}
                            onChange={(e) =>
                              updateQuestion(question.id, { question: e.target.value })
                            }
                            className="min-h-20 resize-none text-base"
                          />

                          {/* Multiple Choice Options */}
                          {question.type === 'multiple-choice' && question.options && (
                            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                              <Label className="text-sm text-muted-foreground">Answer Options</Label>
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${question.id}`}
                                    checked={question.correctAnswer === optIndex}
                                    onChange={() =>
                                      updateQuestion(question.id, { correctAnswer: optIndex })
                                    }
                                    className="w-4 h-4 accent-primary"
                                  />
                                  <Input
                                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                    value={option}
                                    onChange={(e) =>
                                      updateOption(question.id, optIndex, e.target.value)
                                    }
                                  />
                                </div>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addOption(question.id)}
                                className="w-full border-2 border-dashed"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          )}

                          {/* True/False */}
                          {question.type === 'true-false' && (
                            <div className="flex gap-3 pl-4 border-l-2 border-primary/20">
                              <Label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === 'true'}
                                  onChange={() =>
                                    updateQuestion(question.id, { correctAnswer: 'true' })
                                  }
                                  className="w-4 h-4 accent-primary"
                                />
                                <span>True</span>
                              </Label>
                              <Label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === 'false'}
                                  onChange={() =>
                                    updateQuestion(question.id, { correctAnswer: 'false' })
                                  }
                                  className="w-4 h-4 accent-primary"
                                />
                                <span>False</span>
                              </Label>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {questions.length > 0 && (
          <Card className="glass-effect border-2 border-primary/20 animate-fade-in-up delay-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Exam Summary</p>
                  <p className="text-lg">
                    <span className="font-display text-2xl text-primary">{questions.length}</span> questions,{' '}
                    <span className="font-display text-2xl text-primary">{totalPoints}</span> total points,{' '}
                    <span className="font-display text-2xl text-primary">{duration}</span> minutes
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSave(true)} size="lg">
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button onClick={() => handleSave(false)} size="lg" className="hover-glow">
                    <Eye className="w-4 h-4 mr-2" />
                    Publish Exam
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
