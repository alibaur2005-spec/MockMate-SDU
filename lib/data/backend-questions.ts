// Backend interview questions for trial interviews

export interface Question {
    id: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    question: string;
    hints?: string[];
}

export const backendQuestions: Question[] = [
    // Easy Questions
    {
        id: '1',
        category: 'APIs',
        difficulty: 'easy',
        question: 'What is the difference between GET and POST HTTP methods?',
        hints: ['Think about data visibility', 'Consider caching behavior'],
    },
    {
        id: '2',
        category: 'Database',
        difficulty: 'easy',
        question: 'Explain what SQL injection is and how to prevent it.',
        hints: ['Consider prepared statements', 'Think about user input validation'],
    },
    {
        id: '3',
        category: 'General',
        difficulty: 'easy',
        question: 'What is REST API? Name its key principles.',
        hints: ['Statelessness', 'Resource-based', 'HTTP methods'],
    },

    // Medium Questions
    {
        id: '4',
        category: 'System Design',
        difficulty: 'medium',
        question: 'How would you design a rate limiting system for an API?',
        hints: ['Token bucket algorithm', 'Sliding window', 'Redis for distributed systems'],
    },
    {
        id: '5',
        category: 'Database',
        difficulty: 'medium',
        question: 'Explain database indexing and when you should use it.',
        hints: ['B-tree structure', 'Trade-offs', 'Query performance'],
    },
    {
        id: '6',
        category: 'Concurrency',
        difficulty: 'medium',
        question: 'What are the differences between synchronous and asynchronous programming?',
        hints: ['Blocking vs non-blocking', 'Use cases', 'Performance implications'],
    },

    // Hard Questions
    {
        id: '7',
        category: 'System Design',
        difficulty: 'hard',
        question: 'Design a distributed caching system like Redis. Explain data consistency, availability, and partition tolerance.',
        hints: ['CAP theorem', 'Consistent hashing', 'Replication strategies'],
    },
    {
        id: '8',
        category: 'Algorithms',
        difficulty: 'hard',
        question: 'Implement a Load Balancer algorithm. Explain different strategies (Round Robin, Least Connections, IP Hash).',
        hints: ['Health checks', 'Session persistence', 'Weighted distribution'],
    },
    {
        id: '9',
        category: 'Database',
        difficulty: 'hard',
        question: 'Explain database sharding and partitioning. When would you use each?',
        hints: ['Horizontal vs vertical partitioning', 'Shard keys', 'Trade-offs'],
    },
];

export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Question[] {
    return backendQuestions.filter(q => q.difficulty === difficulty);
}

export function getRandomQuestions(count: number, difficulty?: 'easy' | 'medium' | 'hard'): Question[] {
    const pool = difficulty ? getQuestionsByDifficulty(difficulty) : backendQuestions;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
