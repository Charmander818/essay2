import React, { useMemo } from 'react';
import { Question, SyllabusTopic, QuestionState } from '../types.ts';

interface SidebarProps {
  questions: Question[];
  onSelectQuestion: (q: Question) => void;
  selectedQuestionId: string | null;
  onAddQuestionClick: () => void;
  onDeleteQuestion: (id: string) => void;
  onEditQuestion: (q: Question) => void;
  questionStates: Record<string, QuestionState>;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  questions, 
  onSelectQuestion, 
  selectedQuestionId, 
  onAddQuestionClick,
  onDeleteQuestion,
  onEditQuestion,
  questionStates
}) => {
  // Group questions by topic, then by chapter
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, Record<string, Question[]>> = {};
    
    // Initialize topics in order
    Object.values(SyllabusTopic).forEach(topic => {
      groups[topic] = {};
    });

    questions.forEach(q => {
      if (!groups[q.topic]) groups[q.topic] = {};
      if (!groups[q.topic][q.chapter]) groups[q.topic][q.chapter] = [];
      groups[q.topic][q.chapter].push(q);
    });
    
    return groups;
  }, [questions]);

  return (
    <div className="w-80 bg-white border-r border-slate-200 h-screen overflow-y-auto custom-scroll flex-shrink-0 flex flex-col">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
        <div>
          <h1 className="text-xl font-bold text-slate-800">CIE Econ Master</h1>
          <p className="text-xs text-slate-500 mt-1">AS Level (9708) 2023-24</p>
        </div>
        <button 
          onClick={onAddQuestionClick}
          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          title="Add Custom Question"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      
      <div className="flex-1 py-4">
        {Object.entries(groupedQuestions).map(([topic, chapters]) => {
           // Only render topics that have questions
           const hasQuestions = Object.values(chapters).some(arr => arr.length > 0);
           if (!hasQuestions) return null;

           return (
            <div key={topic} className="mb-8 px-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pl-1 border-b border-slate-100 pb-2">
                {topic}
              </h2>
              
              {Object.entries(chapters).map(([chapter, topicQuestions]) => (
                 topicQuestions.length > 0 && (
                  <div key={chapter} className="mb-4 pl-2">
                    <h3 className="text-xs font-semibold text-slate-500 mb-2 truncate" title={chapter}>
                      {chapter}
                    </h3>
                    <div className="space-y-1">
                      {topicQuestions.map((q) => {
                        const hasSavedWork = questionStates[q.id] && (
                          questionStates[q.id].generatorEssay || 
                          questionStates[q.id].graderEssay || 
                          questionStates[q.id].realTimeEssay
                        );

                        return (
                          <div key={q.id} className="relative group">
                            <button
                              onClick={() => onSelectQuestion(q)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 border ${
                                selectedQuestionId === q.id
                                  ? "bg-blue-50 border-blue-200 text-blue-700 font-medium shadow-sm"
                                  : "bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 flex items-center gap-1">
                                  {q.variant.split('/')[0]} '{q.year.slice(2)}
                                  {hasSavedWork && (
                                    <span title="Work saved" className="text-emerald-500">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                    </span>
                                  )}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${q.maxMarks === 12 ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {q.maxMarks}m
                                </span>
                              </div>
                              <p className="line-clamp-2 leading-snug text-xs pr-6">{q.questionText}</p>
                            </button>

                            {/* Edit/Delete Actions - visible on hover */}
                            <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-md p-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onEditQuestion(q); }}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteQuestion(q.id); }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                 )
              ))}
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default Sidebar;