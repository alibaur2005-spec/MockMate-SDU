import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const sourcePath = path.resolve('lib/interview/transcript.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

const module = { exports: {} };
new Function('exports', 'module', compiled)(module.exports, module);

const { formatInterviewTranscript, cleanTranscriptText } = module.exports;

assert.equal(
  formatInterviewTranscript([
    { role: 'system', type: 'status', content: 'connected' },
    { role: 'ai', type: 'text', content: 'What is a closure?' },
    { role: 'user', type: 'text', content: 'A function with captured state.' },
  ]),
  'AI: What is a closure?\n\nYour answer: A function with captured state.'
);

assert.equal(
  formatInterviewTranscript([
    { role: 'model', content: 'First follow-up' },
    { role: 'assistant', content: 'Second follow-up' },
    { role: 'user', content: 'Answer with \\n escaped newline' },
  ]),
  'AI: First follow-up\n\nAI: Second follow-up\n\nYour answer: Answer with \n escaped newline'
);

assert.equal(formatInterviewTranscript([]), '');
assert.equal(cleanTranscriptText('**hello**\\nworld'), 'hello\nworld');
