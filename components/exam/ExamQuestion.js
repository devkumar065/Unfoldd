'use client'

import { useState } from 'react'
import Editor from '@monaco-editor/react'

export function ExamQuestion({ question, questionNumber, totalQuestions, selectedAnswer, onAnswer, isLocked }) {
  const [code, setCode] = useState(selectedAnswer || '')

  const handleCodeChange = (val) => {
    setCode(val)
  }

  const handleRunCode = () => {
    onAnswer(code)
  }

  if (question.question_type === 'coding') {
    const defaultCode = question.question_text.includes('python') ? '# Write your solution here\ndef solution():\n    pass' : '// Write your solution here\nfunction solution() {\n  \n}'
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white leading-relaxed">{question.question_text}</h3>
        <div className="rounded-2xl overflow-hidden border border-border bg-[#1E1E2E] shadow-xl">
          <Editor
            height="400px"
            language={question.question_text.includes('python') ? 'python' : 'javascript'}
            theme="vs-dark"
            value={selectedAnswer || code || defaultCode}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false }, fontSize: 14, lineNumbers: 'on', roundedSelection: true,
              scrollBeyondLastLine: false, automaticLayout: true, contextmenu: false,
              quickSuggestions: false, parameterHints: { enabled: false }, suggestOnTriggerCharacters: false,
              readOnly: isLocked
            }}
          />
        </div>
        <div className="flex justify-end">
          <button onClick={handleRunCode} disabled={isLocked} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${isLocked ? 'bg-green/20 text-green border border-green/30' : 'bg-white text-black hover:bg-gray-200'}`}>
            {isLocked ? 'Code Saved ✓' : 'Save Code'}
          </button>
        </div>
      </div>
    )
  }

  const colors = ['border-blue-500', 'border-green', 'border-orange-500', 'border-purple']
  const bgColors = ['bg-blue-500/20 text-white', 'bg-green/20 text-white', 'bg-orange-500/20 text-white', 'bg-purple/20 text-white']

  return (
    <div className="space-y-6">
      <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">{question.question_text}</h3>
      <div className="grid gap-4">
        {question.options && question.options.map((opt, i) => {
          const isSelected = selectedAnswer === opt
          return (
            <button
              key={i}
              disabled={isLocked}
              onClick={() => onAnswer(opt)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 glass relative flex items-start gap-4 ${isSelected ? `${colors[i]} ${bgColors[i]} shadow-[0_0_20px_rgba(255,255,255,0.1)]` : isLocked ? 'bg-background/30 border-border text-text-muted opacity-50' : 'bg-card border-border text-text-primary hover:border-text-muted'}`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 font-bold ${isSelected ? 'border-white text-white' : 'border-border text-text-muted'}`}>
                {['A','B','C','D'][i]}
              </div>
              <span className="text-[15px] leading-relaxed pt-1">{opt.replace(/^[A-D]\.\s*/, '')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
