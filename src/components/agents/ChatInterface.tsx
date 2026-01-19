'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, Cpu, Bot, User, Save } from 'lucide-react';
import { useAgent } from '@/context/AgentContext';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export default function ChatInterface() {
    const { activeAgent, mode } = useAgent(); // Use global mode
    const [input, setInput] = useState('');
    // const [mode, setMode] = useState... // Removed local state
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ...

    // Load welcome message when agent changes
    useEffect(() => {
        setMessages([
            {
                role: 'model',
                content: `**[${activeAgent}]** 에이전트 준비 완료.\n\n${activeAgent === 'Marketer' ? '전략 기획' : '업무 수행'}을 시작할 준비가 되었습니다.\n현재 모드: **${mode === 'efficiency' ? '⚡ 효율성 모드' : '🧠 딥 리서치 모드'}**`
            }
        ]);
    }, [activeAgent, mode]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);

        setLoading(true);

        try {
            setMessages(prev => [...prev, { role: 'model', content: '' }]);

            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: activeAgent,
                    message: userMessage,
                    history: messages,
                    mode: mode
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to connect');
            }

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedResponse += chunk;

                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.role === 'model') {
                        lastMsg.content = accumulatedResponse;
                    }
                    return newMessages;
                });
            }
        } catch (error: any) {
            console.error(error);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg?.role === 'model') {
                    lastMsg.content += '\n\n⚠️ 오류: 응답 중단됨.';
                    return newMessages;
                }
                return [...prev, { role: 'model', content: `⚠️오류: ${error.message || '통신 실패'}` }];
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (messages.length === 0) return;

        const date = new Date().toISOString().split('T')[0];
        const fileName = `Baroon_Chat_${date}.md`;

        let content = `# Baroon Marketing OS Chat Log\nDate: ${date}\nAgent: ${activeAgent}\n\n---\n\n`;

        messages.forEach(msg => {
            const role = msg.role === 'user' ? 'User' : activeAgent;
            content += `## [${role}]\n${msg.content}\n\n---\n\n`;
        });

        // Use File System Access API if available
        try {
            // @ts-ignore
            if (window.showSaveFilePicker) {
                // @ts-ignore
                const handle = await window.showSaveFilePicker({
                    suggestedName: fileName,
                    types: [{
                        description: 'Markdown File',
                        accept: { 'text/markdown': ['.md'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
            } else {
                // Fallback
                const blob = new Blob([content], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Failed to save file:', err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('File upload failed');

            const data = await res.json();
            const text = data.text;

            setInput(prev => prev + `\n\n[참고 파일: ${file.name}]\n${text}\n\n`);
        } catch (error) {
            console.error('Upload error:', error);
            alert('파일 분석에 실패했습니다.');
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                ref={(ref) => {
                    // Ref logic if needed
                }}
            >
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 
                    ${msg.role === 'model' ? 'bg-secondary text-primary' : 'bg-sand text-secondary'}`}>
                            {msg.role === 'model' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className={`space-y-2 max-w-[80%]`}>
                            <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed prose prose-sm max-w-none
                        ${msg.role === 'model'
                                    ? 'bg-white rounded-tl-none border border-sand/30 text-secondary'
                                    : 'bg-secondary rounded-tr-none text-primary'}`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-4 max-w-3xl animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                            <Cpu className="w-4 h-4 text-white animate-spin" />
                        </div>
                        <div className="bg-white/50 p-4 rounded-2xl rounded-tl-none border border-sand/20 text-secondary text-sm">
                            생각 중...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/50 backdrop-blur border-t border-sand/30">
                <div className="relative flex items-end gap-2 bg-white border border-sand/40 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary transition-all">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.txt,.md,.pptx,.docx,.xlsx,.png,.jpg,.jpeg,.webp"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-secondary transition-colors rounded-xl hover:bg-gray-50"
                        title="파일 업로드 (PDF/Text)"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`${activeAgent}에게 명령 입력...`}
                        className="flex-1 max-h-32 min-h-[50px] py-3 bg-transparent border-none outline-none text-sm text-secondary placeholder:text-gray-400 resize-none"
                    />
                    <div className="flex flex-col gap-2 pb-1">
                        <button
                            onClick={handleSave}
                            disabled={loading || messages.length === 0}
                            className="flex items-center gap-2 p-2 text-secondary hover:bg-sand/30 rounded-xl transition-all font-bold text-xs"
                            title="대화 내용 저장 (.md)"
                        >
                            <Save className="w-4 h-4" />
                            <span>대화 저장</span>
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="p-3 bg-secondary text-primary rounded-xl hover:bg-secondary/90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4 translate-x-0.5" />
                        </button>
                    </div>
                </div>

                {/* REMOVED BOTTOM BUTTONS - Now in Sidebar Header */}
                <div className="mt-2 flex justify-center text-[10px] text-gray-400 uppercase tracking-widest gap-4">
                    <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {mode === 'efficiency' ? '효율성 모드 대기중' : '딥 리서치 대기중'}</span>
                    <span className="flex items-center gap-1">•</span>
                    <span>{activeAgent} 연결됨</span>
                </div>
            </div>
        </div>
    );
}
