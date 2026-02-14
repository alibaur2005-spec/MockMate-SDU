// Mock AI review generator
// TODO: Replace with real AI integration in the future

interface ReviewInput {
    questions: string[];
    answers: string[];
    difficulty: 'easy' | 'medium' | 'hard';
}

interface ReviewOutput {
    review_text: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
}

export function generateMockReview(input: ReviewInput): ReviewOutput {
    // This is a MOCK function - replace with real AI integration
    const { questions, answers, difficulty } = input;

    const answeredCount = answers.filter(a => a && a.trim().length > 0).length;
    const answerQuality = answers.reduce((sum, answer) => {
        return sum + (answer.length > 50 ? 1 : 0.5);
    }, 0) / answers.length;

    // Calculate base score
    const completionScore = (answeredCount / questions.length) * 50;
    const qualityScore = answerQuality * 50;
    const score = Math.min(100, Math.round(completionScore + qualityScore));

    // Generate feedback based on score
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (answeredCount === questions.length) {
        strengths.push('Completed all questions');
    } else {
        weaknesses.push(`Only answered ${answeredCount} out of ${questions.length} questions`);
    }

    if (answerQuality > 0.7) {
        strengths.push('Provided detailed and thoughtful answers');
    } else {
        weaknesses.push('Some answers could be more detailed');
        suggestions.push('Try to provide more comprehensive explanations');
    }

    // Difficulty-specific feedback
    if (difficulty === 'hard') {
        strengths.push('Tackled challenging questions');
        suggestions.push('Consider explaining your thought process step-by-step');
    } else if (difficulty === 'easy') {
        suggestions.push('Try medium difficulty questions to challenge yourself');
    }

    // Generic suggestions
    suggestions.push('Practice explaining concepts to others');
    suggestions.push('Review fundamental computer science concepts');

    const review_text = `
Overall Performance: ${score}/100

You demonstrated ${score > 70 ? 'strong' : score > 40 ? 'moderate' : 'developing'} understanding of backend concepts.
${answeredCount === questions.length ? 'Great job completing all questions!' : 'Try to answer all questions in future interviews.'}

${strengths.length > 0 ? 'Your strengths include ' + strengths.join(', ') + '.' : ''}
${weaknesses.length > 0 ? 'Areas for improvement: ' + weaknesses.join(', ') + '.' : ''}

Keep practicing and you'll continue to improve!
  `.trim();

    return {
        review_text,
        score,
        strengths,
        weaknesses,
        suggestions,
    };
}
