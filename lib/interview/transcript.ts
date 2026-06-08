export interface InterviewTranscriptLog {
    role: string;
    type?: string;
    content: string;
}

export function cleanTranscriptText(text: string) {
    return text.replace(/\*/g, '').replace(/\\n/g, '\n').trim();
}

function getSpeakerLabel(role: string) {
    const normalizedRole = role.toLowerCase();

    if (['ai', 'assistant', 'model'].includes(normalizedRole)) {
        return 'AI';
    }

    if (normalizedRole === 'user') {
        return 'Your answer';
    }

    return null;
}

export function formatInterviewTranscript(logs: InterviewTranscriptLog[]) {
    return logs
        .map((log) => {
            const label = getSpeakerLabel(log.role);
            const content = cleanTranscriptText(log.content);

            if (!label || !content) {
                return null;
            }

            return `${label}: ${content}`;
        })
        .filter((entry): entry is string => Boolean(entry))
        .join('\n\n');
}
