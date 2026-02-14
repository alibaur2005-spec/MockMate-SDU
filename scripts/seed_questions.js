const { Client } = require('pg');

// Database connection string
const connectionString = process.env.POSTGRES_URL_NON_POOLING || 'postgres://postgres.sqnlefnxlqgzilfnlzlb:FxBbQA4CqfqyVBzB@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase in this environment
});

// List of questions to seed
const questionsPool = [
    { content: "Reverse a linked list.", topic: "Data Structures", difficulty: "Easy" },
    { content: "Explain the difference between REST and GraphQL.", topic: "System Design", difficulty: "Medium" },
    { content: "What is the difference between TCP and UDP?", topic: "Networking", difficulty: "Medium" },
    { content: "Implement a binary search algorithm.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Design a URL shortener like bit.ly.", topic: "System Design", difficulty: "Hard" },
    { content: "What are ACID properties in databases?", topic: "Databases", difficulty: "Medium" },
    { content: "Explain the concept of closure in JavaScript.", topic: "JavaScript", difficulty: "Medium" },
    { content: "Find the longest substring without repeating characters.", topic: "Algorithms", difficulty: "Medium" },
    { content: "What is the difference between a process and a thread?", topic: "OS", difficulty: "Medium" },
    { content: "Implement a LRU Cache.", topic: "Data Structures", difficulty: "Hard" },
    { content: "How does DNS work?", topic: "Networking", difficulty: "Medium" },
    { content: "Explain the concept of sharding in databases.", topic: "Databases", difficulty: "Hard" },
    { content: "What is a deadlock and how can it be prevented?", topic: "OS", difficulty: "Hard" },
    { content: "Implement a queue using stacks.", topic: "Data Structures", difficulty: "Medium" },
    { content: "Check if a binary tree is balanced.", topic: "Data Structures", difficulty: "Easy" },
    { content: "Explain the difference between SQL and NoSQL.", topic: "Databases", difficulty: "Easy" },
    { content: "What is dependency injection?", topic: "Software Engineering", difficulty: "Medium" },
    { content: "Design a chat application like WhatsApp.", topic: "System Design", difficulty: "Hard" },
    { content: "Find the missing number in an array of 1 to N.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Explain the concept of virtualization.", topic: "OS", difficulty: "Medium" },
    { content: "What is the CAP theorem?", topic: "System Design", difficulty: "Hard" },
    { content: "Implement merge sort.", topic: "Algorithms", difficulty: "Medium" },
    { content: "Invert a binary tree.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Explain the difference between horizontal and vertical scaling.", topic: "System Design", difficulty: "Medium" },
    { content: "What is a foreign key?", topic: "Databases", difficulty: "Easy" },
    { content: "Describe the HTTP request lifecycle.", topic: "Web Development", difficulty: "Medium" },
    { content: "How does HTTPS work?", topic: "Security", difficulty: "Medium" },
    { content: "What is SQL injection and how to prevent it?", topic: "Security", difficulty: "Medium" },
    { content: "Design a notification system.", topic: "System Design", difficulty: "Hard" },
    { content: "Implement a trie (prefix tree).", topic: "Data Structures", difficulty: "Hard" },
    { content: "Find the intersection of two linked lists.", topic: "Data Structures", difficulty: "Medium" },
    { content: "What is the difference between optimistic and pessimistic locking?", topic: "Databases", difficulty: "Hard" },
    { content: "Explain the concept of microservices architecture.", topic: "System Design", difficulty: "Medium" },
    { content: "Check if a string is a palindrome.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Valid Parentheses problem.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Merge two sorted lists.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Best time to buy and sell stock.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Maximum Subarray (Kadane's Algorithm).", topic: "Algorithms", difficulty: "Medium" },
    { content: "Climbing Stairs problem.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Symmetric Tree.", topic: "Data Structures", difficulty: "Easy" },
    { content: "Binary Tree Level Order Traversal.", topic: "Data Structures", difficulty: "Medium" },
    { content: "Convert Sorted Array to Binary Search Tree.", topic: "Data Structures", difficulty: "Easy" },
    { content: "Balanced Binary Tree.", topic: "Data Structures", difficulty: "Easy" },
    { content: "Path Sum.", topic: "Data Structures", difficulty: "Easy" },
    { content: "Pascal's Triangle.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Single Number.", topic: "Algorithms", difficulty: "Easy" },
    { content: "Linked List Cycle.", topic: "Data Structures", difficulty: "Easy" },
    { content: "Min Stack.", topic: "Data Structures", difficulty: "Medium" },
    { content: "Intersection of Two Linked Lists.", topic: "Data Structures", difficulty: "Easy" },
    { content: "Majority Element.", topic: "Algorithms", difficulty: "Easy" },
];

async function seedQuestions() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Fetch all companies
        const res = await client.query('SELECT id, name FROM public.companies');
        const companies = res.rows;

        if (companies.length === 0) {
            console.log('No companies found. Please seed companies first.');
            return;
        }

        console.log(`Found ${companies.length} companies. Seeding questions...`);

        for (const company of companies) {
            console.log(`Seeding questions for ${company.name}...`);

            // Delete existing questions for this company to avoid duplicates/overflow if run multiple times
            // Optional: remove this if you want to add to existing
            // await client.query('DELETE FROM public.questions WHERE company_id = $1', [company.id]);

            // Select 25 random questions from the pool
            // Since pool is small (50), we might just pick 25 random indices
            const selectedQuestions = [];
            const poolSize = questionsPool.length;
            const seenIndices = new Set();

            while (selectedQuestions.length < 25 && selectedQuestions.length < poolSize) {
                const randomIndex = Math.floor(Math.random() * poolSize);
                if (!seenIndices.has(randomIndex)) {
                    seenIndices.add(randomIndex);
                    selectedQuestions.push(questionsPool[randomIndex]);
                }
            }

            // Insert questions
            for (const q of selectedQuestions) {
                const queryText = `
                    INSERT INTO public.questions (company_id, content, topic, difficulty)
                    VALUES ($1, $2, $3, $4)
                `;
                await client.query(queryText, [company.id, q.content, q.topic, q.difficulty]);
            }

            console.log(`Added ${selectedQuestions.length} questions for ${company.name}`);
        }

        console.log('Seeding completed successfully!');
    } catch (err) {
        console.error('Error seeding questions:', err);
    } finally {
        await client.end();
    }
}

seedQuestions();
