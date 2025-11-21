import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Trash2, GripVertical, Save, Eye, ArrowLeft, Clock, BookOpen, Shuffle, BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockQuestionPool, Question } from '@/utils/mockQuestions';

export default function ExamCreatePage() {
  const navigate = useNavigate();
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Generation State
  const [questionCount, setQuestionCount] = useState(40);
  const [poolStats, setPoolStats] = useState({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    // Calculate pool stats
    const stats = mockQuestionPool.reduce((acc, q) => {
      acc[q.difficulty]++;
      return acc;
    }, { easy: 0, medium: 0, hard: 0 });
    setPoolStats(stats);
  }, []);

  const generateRandomExam = () => {
    // 1. Shuffle Pool
    const shuffledPool = [...mockQuestionPool].sort(() => 0.5 - Math.random());

    // 2. Select N questions
    const selectedQuestions = shuffledPool.slice(0, questionCount);

    // 3. Randomize Options for Multiple Choice
    const processedQuestions = selectedQuestions.map(q => {
      if (q.type === 'multiple-choice' && q.options) {
        const optionsWithIndex = q.options.map((opt, idx) => ({ opt, originalIndex: idx }));
        // Shuffle options
        const shuffledOptions = optionsWithIndex.sort(() => 0.5 - Math.random());

        // Find new correct answer index
        let newCorrectAnswer = q.correctAnswer;
        if (typeof q.correctAnswer === 'number') {
          const oldCorrectOption = q.options[q.correctAnswer];
          newCorrectAnswer = shuffledOptions.findIndex(o => o.opt === oldCorrectOption);
        }

        return {
          ...q,
          options: shuffledOptions.map(o => o.opt),
          correctAnswer: newCorrectAnswer
        };
      }
      return q;
    });

    setQuestions(processedQuestions);
  };

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      question: '',
      points: 1,
      options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
      correctAnswer: undefined,
      difficulty: 'medium',
      category: 'General'
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

  const difficultyStats = questions.reduce((acc, q) => {
    acc[q.difficulty]++;
    return acc;
  }, { easy: 0, medium: 0, hard: 0 });

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
      'multiple-choice': 'bg-primary/10 text-primary border-primary/20',
      'true-false': 'bg-secondary/50 text-secondary-foreground border-secondary',
      'short-answer': 'bg-accent/20 text-accent-foreground border-accent/30',
      'essay': 'bg-muted text-muted-foreground border-border',
    };
    return (
      <Badge variant="outline" className={styles[type]}>
        {getQuestionTypeLabel(type)}
      </Badge>
    );
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
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

        {/* Question Management */}
        <Tabs defaultValue="manual" className="animate-fade-in-up delay-200">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manual">Manual Creation</TabsTrigger>
            <TabsTrigger value="pool">Generate from Pool</TabsTrigger>
          </TabsList>

          <TabsContent value="pool">
            <Card className="glass-effect border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shuffle className="w-5 h-5 text-primary" />
                  Randomized Exam Generation
                </CardTitle>
                <CardDescription>
                  Automatically generate an exam from the question bank.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Pool Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-background rounded-md shadow-sm">
                      <div className="text-2xl font-bold text-green-500">{poolStats.easy}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Easy</div>
                    </div>
                    <div className="p-3 bg-background rounded-md shadow-sm">
                      <div className="text-2xl font-bold text-yellow-500">{poolStats.medium}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Medium</div>
                    </div>
                    <div className="p-3 bg-background rounded-md shadow-sm">
                      <div className="text-2xl font-bold text-red-500">{poolStats.hard}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Hard</div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    Total Questions Available: {mockQuestionPool.length}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Number of Questions: {questionCount}</Label>
                    <span className="text-sm text-muted-foreground">Max: {mockQuestionPool.length}</span>
                  </div>
                  <Slider
                    value={[questionCount]}
                    onValueChange={(vals) => setQuestionCount(vals[0])}
                    max={mockQuestionPool.length}
                    step={1}
                    min={1}
                  />
                </div>

                <Button onClick={generateRandomExam} className="w-full" size="lg">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Exam ({questionCount} Questions)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <Card className="glass-effect border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display">Questions</CardTitle>
                    <CardDescription>
                      {questions.length} question{questions.length !== 1 ? 's' : ''} added
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => addQuestion('multiple-choice')}>
                      <Plus className="w-4 h-4 mr-1" /> MC
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addQuestion('true-false')}>
                      <Plus className="w-4 h-4 mr-1" /> T/F
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addQuestion('short-answer')}>
                      <Plus className="w-4 h-4 mr-1" /> Short
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addQuestion('essay')}>
                      <Plus className="w-4 h-4 mr-1" /> Essay
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Manual creation content (simplified for brevity as focus is on pool) */}
                <div className="text-center py-8 text-muted-foreground">
                  Use the buttons above to add questions manually, or switch to "Generate from Pool".
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Questions List (Shared) */}
        {questions.length > 0 && (
          <Card className="glass-effect border-2 animate-fade-in-up delay-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Exam Preview</CardTitle>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Easy: {difficultyStats.easy}</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Medium: {difficultyStats.medium}</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Hard: {difficultyStats.hard}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <Card
                  key={question.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`border-2 transition-all duration-200 ${draggedItem === index ? 'opacity-50' : ''
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
                            <Badge variant="secondary" className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
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
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
