import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types.ts';
import { getRealTimeCoaching } from '../services/geminiService.ts';

interface Props {
  question: Question;
  savedText: string;
  onSave: (text: string) => void;
}

const RealTimeWriter: React.FC<Props> = ({ question, savedText, onSave }) => {
  const [text, setText] = useState(savedText);
  const [scoreEstimate, setScoreEstimate] = useState("-");
  const [advice, setAdvice] = useState("Start typing to get real-time feedback based on the mark scheme.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Use a ref to manage debounce
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset or load saved text when question changes
  useEffect(() => {
    setText(savedText);
    setScoreEstimate("-");
    setAdvice("Start typing to get real-time feedback based on the mark scheme.");
  }, [question.id]);
  // Note: we don't put savedText in dependency array to avoid overwriting ongoing typing if parent re-renders

  useEffect(() => {
    if (text.length < 20) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setIsAnalyzing(true);
      const result = await getRealTimeCoaching(question, text);
      setScoreEstimate(result.scoreEstimate);
      setAdvice(result.advice);
      setIsAnalyzing(false);
    }, 2000); // 2 second debounce

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, question]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onSave(newText);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] grid grid-cols-3 gap-6">
      <div className="col-span-2 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
             <p className="text-sm font-medium text-slate-800 leading-relaxed">
              {question.questionText}
             </p>
          </div>
          <textarea
            className="flex-1 w-full p-6 resize-none focus:outline-none font-serif text-lg leading-relaxed text-slate-800"
            placeholder="Begin your answer..."
            value={text}
            onChange={handleChange}
          />
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
            <span>{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
            <span>{isAnalyzing ? "AI Analyzing..." : "AI Idle"}</span>
          </div>
        </div>
      </div>

      <div className="col-span-1 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Level</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-blue-600">{scoreEstimate}</span>
            <span className="text-slate-400 text-sm">/ {question.maxMarks} (Est.)</span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-sm border border-indigo-100 p-5 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="font-semibold text-indigo-900">Live Coach</h3>
          </div>
          <div className="prose prose-sm prose-indigo">
             <p className="text-slate-700 leading-relaxed">{advice}</p>
          </div>
          
          {question.markScheme && (
            <div className="mt-6 pt-6 border-t border-indigo-50">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Target (from Mark Scheme)</h4>
              <p className="text-xs text-slate-500 line-clamp-6">{question.markScheme}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeWriter;