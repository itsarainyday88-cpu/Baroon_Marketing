'use client';

import { LogOut, Settings, MessageSquare, Menu, FileText, Share2, Instagram, ShieldAlert, Search, Code, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgentProvider, useAgent } from '@/context/AgentContext';

// Sidebar separate component to consume context
function Sidebar() {
    const { activeAgent, setActiveAgent, mode, setMode } = useAgent();
    // ... imports etc
    const router = useRouter();

    const handleLogout = async () => {
        // ... (rest of logic)
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const agents = [
        { id: 'Manager', name: 'Project Manager', role: '워크플로우 총괄', icon: Users, desc: '전체 마케팅 업무 조율 및 멀티 에이전트 지휘' },
        { id: 'Marketer', name: 'Marketer', role: '글로벌 전략가', icon: TrendingUp, desc: '마케팅 전략 기획 및 예산/톤앤매너 설정' },
        { id: 'Blog', name: 'Blog', role: '테크니컬 라이터', icon: FileText, desc: '블로그 규격에 맞는 컨텐츠 제작' },
        { id: 'Insta', name: 'Insta', role: '비주얼 디렉터', icon: Instagram, desc: '비주얼 중심의 카드뉴스 기획 및 이미지 프롬프트 생성' },
        { id: 'Dang', name: 'Dang', role: '커뮤니티 매니저', icon: Share2, desc: '지역 주민과 소통하는 당근마켓 홍보' },
        { id: 'Supporter', name: 'Supporter', role: '컨설턴트', icon: MessageSquare, desc: '카카오톡/네이버 톡톡 등 고객 문의 응대 스크립트 작성' },
        { id: 'Reputation', name: 'Reputation', role: '위기 관리자', icon: ShieldAlert, desc: '네이버 리뷰 댓글 붙여넣으면 적절한 답변 생성하는 에이전트' },
        { id: 'Enemy', name: 'Enemy', role: '시장 분석가', icon: Search, desc: '근처 치과 모두 검색하여 트렌드 및 경쟁사 조사해주는 에이전트' },
        { id: 'Analyst', name: 'Analyst', role: '데이터 분석가', icon: Users, desc: '마케팅 성과(ROI, CTR) 분석 및 수치 기반 데이터 해석' },
        { id: 'Web_D', name: 'Web_D', role: '개발자', icon: Code, desc: '웹사이트 UI/UX 수정 및 깃허브 코드 배포 관리' },
    ];

    return (
        <aside className="w-[40%] flex flex-col border-r border-sand/30 bg-white/50 backdrop-blur-sm">
            <div className="p-6 border-b border-sand/30 flex justify-between items-center">
                <button
                    onClick={() => window.location.href = '/'}
                    className="text-left group hover:opacity-70 transition-opacity"
                    title="새로고침 (초기화)"
                >
                    <h1 className="text-2xl font-serif font-bold text-secondary">바른 마케팅 OS</h1>
                    <p className="text-xs text-secondary/60 tracking-wider">인텔리전스 유닛</p>
                </button>

                {/* Mode Toggle (Replaces Settings Icon) */}
                <div className="flex bg-sand/20 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setMode('efficiency')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1
                            ${mode === 'efficiency' ? 'bg-white shadow text-secondary' : 'text-gray-500 hover:text-secondary'}`}
                    >
                        ⚡ 효율성
                    </button>
                    <button
                        onClick={() => setMode('deep')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1
                            ${mode === 'deep' ? 'bg-white shadow text-secondary' : 'text-gray-500 hover:text-secondary'}`}
                    >
                        🧠 딥러닝
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map((agent) => (
                        <button
                            key={agent.id}
                            onClick={() => setActiveAgent(agent.id as any)}
                            className={`p-4 rounded-xl border transition-all text-left group relative flex flex-col gap-3
                                ${activeAgent === agent.id
                                    ? 'bg-secondary text-primary border-secondary shadow-lg scale-[1.02]'
                                    : 'bg-white border-sand/40 hover:border-secondary/50 hover:shadow-md text-secondary'
                                }
                            `}
                        >
                            <div className={`p-2 rounded-lg w-fit ${activeAgent === agent.id ? 'bg-white/10' : 'bg-sand/20'}`}>
                                <agent.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{agent.name}</h3>
                                <p className={`text-xs mt-1 ${activeAgent === agent.id ? 'text-primary/70' : 'text-secondary/60'}`}>
                                    {agent.role}
                                </p>
                            </div>

                            {/* Hover Tooltip */}
                            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-lg w-full text-center leading-tight">
                                {agent.desc}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 border-t border-sand/30 bg-white/30">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition-colors font-medium text-sm"
                >
                    <LogOut className="w-4 h-4" /> 로그아웃
                </button>
            </div>
        </aside>
    );
}

function Header() {
    const { activeAgent } = useAgent();
    return (
        <div className="absolute top-0 inset-x-0 z-10 p-4 bg-white/80 backdrop-blur border-b border-sand/30 flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-mono text-sm font-semibold text-secondary uppercase">
                    활성: {activeAgent} 에이전트
                </span>
            </div>
            <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-sand/30 text-[10px] font-bold text-secondary tracking-wide border border-sand/50">GEMINI 3.0 PRO</span>
                <span className="px-2 py-1 rounded bg-blue-50 text-[10px] font-bold text-blue-700 tracking-wide border border-blue-100">MCP ENABLED</span>
            </div>
        </div>
    );
}


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AgentProvider>
            <div className="flex h-screen bg-primary overflow-hidden">
                <Sidebar />

                {/* Main Content (Right Panel - 60%) */}
                <main className="flex-1 flex flex-col relative bg-primary overflow-hidden">
                    <Header />
                    {/* Chat Area - Added min-h-0 to allow scrolling within children */}
                    <div className="flex-1 flex flex-col pt-16 min-h-0 overflow-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </AgentProvider>
    );
}
