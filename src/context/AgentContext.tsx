'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type AgentId = 'Manager' | 'Marketer' | 'Blog' | 'Insta' | 'Dang' | 'Supporter' | 'Reputation' | 'Enemy' | 'Analyst' | 'Web_D';
type AgentMode = 'efficiency' | 'deep';

interface AgentContextType {
    activeAgent: AgentId;
    setActiveAgent: (id: AgentId) => void;
    mode: AgentMode;
    setMode: (mode: AgentMode) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
    const [activeAgent, setActiveAgent] = useState<AgentId>('Manager');
    const [mode, setMode] = useState<AgentMode>('efficiency');

    return (
        <AgentContext.Provider value={{ activeAgent, setActiveAgent, mode, setMode }}>
            {children}
        </AgentContext.Provider>
    );
}

export function useAgent() {
    const context = useContext(AgentContext);
    if (context === undefined) {
        throw new Error('useAgent must be used within an AgentProvider');
    }
    return context;
}
