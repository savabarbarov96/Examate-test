import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, BookOpen, Clock, CheckCircle2, FileEdit, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Exam {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  questionCount: number;
  duration: number; // in minutes
  createdAt: string;
  scheduledFor?: string;
  completedAt?: string;
  score?: number;
}

// Mock data - Replace with API call
const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Advanced Calculus Final Exam',
    description: 'Comprehensive assessment covering derivatives, integrals, and series',
    status: 'active',
    questionCount: 45,
    duration: 120,
    createdAt: '2025-01-10',
    scheduledFor: '2025-01-20',
  },
  {
    id: '2',
    title: 'Modern Philosophy Midterm',
    description: 'Existentialism, phenomenology, and contemporary ethical theories',
    status: 'draft',
    questionCount: 30,
    duration: 90,
    createdAt: '2025-01-12',
  },
  {
    id: '3',
    title: 'Organic Chemistry Quiz',
    description: 'Focus on reaction mechanisms and molecular structures',
    status: 'completed',
    questionCount: 20,
    duration: 60,
    createdAt: '2025-01-05',
    completedAt: '2025-01-08',
    score: 92,
  },
  {
    id: '4',
    title: 'Renaissance Art History',
    description: 'Italian and Northern Renaissance masterworks and techniques',
    status: 'active',
    questionCount: 35,
    duration: 90,
    createdAt: '2025-01-08',
    scheduledFor: '2025-01-18',
  },
  {
    id: '5',
    title: 'Quantum Mechanics Fundamentals',
    description: 'Wave functions, operators, and quantum harmonic oscillator',
    status: 'draft',
    questionCount: 25,
    duration: 75,
    createdAt: '2025-01-14',
  },
];

export default function ExamListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'completed'>('all');

  const filteredExams = mockExams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Exam['status']) => {
    const styles = {
      draft: 'bg-[oklch(var(--exam-draft))] text-[oklch(0.3_0.05_25)]',
      active: 'bg-[oklch(var(--exam-active))] text-white',
      completed: 'bg-[oklch(var(--exam-completed))] text-white',
    };
    return (
      <Badge className={styles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status: Exam['status']) => {
    switch (status) {
      case 'draft':
        return <FileEdit className="w-5 h-5" />;
      case 'active':
        return <Clock className="w-5 h-5" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-scholarly-gradient p-6 md:p-8">
      {/* Header with animation */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-5xl md:text-6xl font-display text-primary mb-2">
              Examinations
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse, create, and manage your assessments
            </p>
          </div>
          <Link to="/exams/create">
            <Button size="lg" className="hover-glow">
              <Plus className="w-5 h-5 mr-2" />
              Create New Exam
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search exams by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className="h-12"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('draft')}
              className="h-12"
            >
              <Filter className="w-4 h-4 mr-2" />
              Drafts
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              className="h-12"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              className="h-12"
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up delay-200">
          <Card className="glass-effect border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">
                Total Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                <span className="text-4xl font-display">{mockExams.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-effect border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">
                Active Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-[oklch(var(--exam-active))]" />
                <span className="text-4xl font-display">
                  {mockExams.filter((e) => e.status === 'active').length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-effect border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-body font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-[oklch(var(--exam-completed))]" />
                <span className="text-4xl font-display">
                  {Math.round((mockExams.filter((e) => e.status === 'completed').length / mockExams.length) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exam List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam, index) => (
            <Card
              key={exam.id}
              className={`hover-glow transition-all duration-300 hover:scale-105 cursor-pointer border-2 animate-scale-in delay-${Math.min((index + 3) * 100, 600)}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getStatusIcon(exam.status)}
                  </div>
                  {getStatusBadge(exam.status)}
                </div>
                <CardTitle className="text-2xl font-display leading-tight">
                  {exam.title}
                </CardTitle>
                <CardDescription className="text-base line-clamp-2">
                  {exam.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{exam.questionCount} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{exam.duration} min</span>
                  </div>
                </div>

                {exam.status === 'completed' && exam.score !== undefined && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className="text-2xl font-display text-primary">{exam.score}%</span>
                    </div>
                  </div>
                )}

                {exam.status === 'active' && exam.scheduledFor && (
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Scheduled: {new Date(exam.scheduledFor).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  {exam.status === 'draft' && (
                    <Link to={`/exams/${exam.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Continue Editing
                      </Button>
                    </Link>
                  )}
                  {exam.status === 'active' && (
                    <Link to={`/exams/${exam.id}/take`} className="flex-1">
                      <Button className="w-full">
                        Start Exam
                      </Button>
                    </Link>
                  )}
                  {exam.status === 'completed' && (
                    <Link to={`/exams/${exam.id}/results`} className="flex-1">
                      <Button variant="secondary" className="w-full">
                        View Results
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-display text-foreground mb-2">No exams found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first exam'}
            </p>
            <Link to="/exams/create">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Exam
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
