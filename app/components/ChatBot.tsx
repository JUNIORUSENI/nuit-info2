'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!response.ok) throw new Error('Erreur API');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
            };

            setMessages(prev => [...prev, assistantMessage]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    assistantMessage.content += chunk;

                    setMessages(prev =>
                        prev.map(m =>
                            m.id === assistantMessage.id
                                ? { ...m, content: assistantMessage.content }
                                : m
                        )
                    );
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '❌ Désolé, une erreur est survenue. Vérifie ta connexion et réessaie.',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const askQuestion = (question: string) => {
        setInput(question);
        setTimeout(() => {
            const form = document.getElementById('chat-form') as HTMLFormElement;
            form?.requestSubmit();
        }, 100);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full 
                    bg-[#00ff88] hover:bg-[#00cc6a] 
                    flex items-center justify-center
                    shadow-[0_0_30px_rgba(0,255,136,0.4)]
                    hover:shadow-[0_0_40px_rgba(0,255,136,0.6)]
                    transition-all duration-300 hover:scale-110
                    ${isOpen ? 'rotate-0' : 'animate-bounce'}`}
                aria-label="Ouvrir le chat"
            >
                {isOpen ? (
                    <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-6 z-50 
                w-[380px] max-w-[calc(100vw-48px)] 
                h-[550px] max-h-[calc(100vh-120px)]
                bg-[#0d0d0d] rounded-3xl 
                border border-[#2a2a2a]
                shadow-[0_0_60px_rgba(0,0,0,0.5),0_0_30px_rgba(0,255,136,0.1)]
                flex flex-col overflow-hidden
                transition-all duration-300 origin-bottom-right
                ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="bg-[#1a1a1a] p-4 border-b border-[#2a2a2a] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00ff88] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,255,136,0.4)]">
                        🤖
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">NiRDy</h3>
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
                            Assistant NIRD • En ligne
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-white transition-colors p-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    {/* Welcome message */}
                    {messages.length === 0 && (
                        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
                            <p className="text-gray-300 text-sm mb-3">
                                👋 Salut ! Je suis <span className="text-[#00ff88] font-bold">NiRDy</span>, ton guide vers un numérique plus responsable !
                            </p>
                            <p className="text-gray-400 text-sm mb-4">
                                Pose-moi tes questions sur Linux, les logiciels libres, ou comment économiser tout en préservant la planète 🌱
                            </p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => askQuestion("C'est quoi la démarche NIRD ?")}
                                    className="w-full text-left px-4 py-2 rounded-xl bg-[#0d0d0d] border border-[#2a2a2a] 
                                        text-gray-300 text-sm hover:border-[#00ff88] hover:text-[#00ff88] transition-colors"
                                >
                                    💡 C&apos;est quoi la démarche NIRD ?
                                </button>
                                <button
                                    onClick={() => askQuestion("Pourquoi passer à Linux ?")}
                                    className="w-full text-left px-4 py-2 rounded-xl bg-[#0d0d0d] border border-[#2a2a2a] 
                                        text-gray-300 text-sm hover:border-[#00ff88] hover:text-[#00ff88] transition-colors"
                                >
                                    🐧 Pourquoi passer à Linux ?
                                </button>
                                <button
                                    onClick={() => askQuestion("Comment économiser avec les logiciels libres ?")}
                                    className="w-full text-left px-4 py-2 rounded-xl bg-[#0d0d0d] border border-[#2a2a2a] 
                                        text-gray-300 text-sm hover:border-[#00ff88] hover:text-[#00ff88] transition-colors"
                                >
                                    💰 Comment économiser avec les logiciels libres ?
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-[#00ff88] text-black rounded-br-md'
                                    : 'bg-[#1a1a1a] text-gray-200 border border-[#2a2a2a] rounded-bl-md'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3 border border-[#2a2a2a] rounded-bl-md">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                    id="chat-form"
                    onSubmit={handleSubmit}
                    className="p-4 border-t border-[#2a2a2a] bg-[#1a1a1a]"
                >
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Pose ta question..."
                            className="flex-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-4 py-3
                                text-white placeholder-gray-500 text-sm
                                focus:outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]
                                transition-colors"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="w-12 h-12 rounded-xl bg-[#00ff88] hover:bg-[#00cc6a] 
                                flex items-center justify-center
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]"
                        >
                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
