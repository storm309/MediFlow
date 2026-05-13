import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    sendChatMessage,
    fetchChatHistory,
    clearChatHistory,
    setChatOpen,
    selectChatMessages,
    selectChatLoading,
    selectChatOpen,
} from '../../redux/slices/aiSlice';

/* Simple markdown: bold, line breaks */
function renderMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
}

export default function AiChatWidget() {
    const dispatch  = useDispatch();
    const messages  = useSelector(selectChatMessages);
    const loading   = useSelector(selectChatLoading);
    const open      = useSelector(selectChatOpen);

    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    // Load chat history on first open
    useEffect(() => {
        if (open && messages.length === 0) {
            dispatch(fetchChatHistory());
        }
    }, [open]);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;
        dispatch(sendChatMessage({ message: trimmed }));
        setInput('');
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => dispatch(setChatOpen(!open))}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                title="AI Health Assistant"
                aria-label="Open AI chat"
            >
                {open ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.122l.5.268M14.25 3.104c.251.023.501.05.75.082M19.5 10.5c0 3.09-1.275 5.866-3.33 7.817M5 14.5L3.56 15.96a9.75 9.75 0 001.44 3.29" />
                    </svg>
                )}
            </button>

            {/* Chat window */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[520px] flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-600">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">MediFlow AI</p>
                                <p className="text-xs text-blue-100">Healthcare Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => dispatch(clearChatHistory())}
                            className="text-blue-100 hover:text-white text-xs underline"
                            title="Clear chat"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50">
                        {messages.length === 0 && !loading && (
                            <div className="text-center mt-8">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Hi! I'm your health assistant.</p>
                                <p className="text-xs text-slate-500 mt-1">Ask me about your vitals, appointments, or health tips.</p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-600 rounded-bl-sm'
                                }`}>
                                    <span
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-600">
                                    <div className="flex gap-1 items-center">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <div className="flex gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Ask about your health…"
                                rows={1}
                                className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
                            >
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 text-center">Not a substitute for professional medical advice</p>
                    </div>
                </div>
            )}
        </>
    );
}
