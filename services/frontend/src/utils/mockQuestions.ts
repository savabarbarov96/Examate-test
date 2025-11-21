export interface Question {
    id: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    question: string;
    points: number;
    options?: string[];
    correctAnswer?: number | string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
}

const categories = ['Calculus', 'Algebra', 'Geometry', 'Statistics', 'Physics'];
const difficulties = ['easy', 'medium', 'hard'] as const;

const generateQuestions = (): Question[] => {
    const questions: Question[] = [];

    // Helper to generate random integer
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 1; i <= 120; i++) {
        const category = categories[randomInt(0, categories.length - 1)];
        const difficulty = difficulties[randomInt(0, difficulties.length - 1)];
        const type = i % 10 === 0 ? 'essay' : i % 5 === 0 ? 'short-answer' : i % 3 === 0 ? 'true-false' : 'multiple-choice';

        let question: Question = {
            id: `pool_q_${i}`,
            type,
            question: '',
            points: difficulty === 'hard' ? 5 : difficulty === 'medium' ? 3 : 1,
            difficulty,
            category
        };

        switch (type) {
            case 'multiple-choice':
                question.question = `[${category}] [${difficulty}] Question ${i}: What is the result of operation X?`;
                question.options = [
                    `Option A for Q${i}`,
                    `Option B for Q${i}`,
                    `Option C for Q${i}`,
                    `Option D for Q${i}`
                ];
                question.correctAnswer = randomInt(0, 3);
                break;
            case 'true-false':
                question.question = `[${category}] [${difficulty}] Question ${i}: Is statement Y true?`;
                question.correctAnswer = randomInt(0, 1) === 0 ? 'true' : 'false';
                break;
            case 'short-answer':
                question.question = `[${category}] [${difficulty}] Question ${i}: Calculate the value of Z.`;
                question.correctAnswer = '42';
                break;
            case 'essay':
                question.question = `[${category}] [${difficulty}] Question ${i}: Explain the concept of W in detail.`;
                question.correctAnswer = '';
                break;
        }
        questions.push(question);
    }
    return questions;
};

export const mockQuestionPool = generateQuestions();
