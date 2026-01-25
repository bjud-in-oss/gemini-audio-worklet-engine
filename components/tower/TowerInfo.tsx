
import React from 'react';
import { KNOWLEDGE_BASE } from './TowerKnowledge';
import SystemMap from './knowledge/SystemMap';
import { LiveText } from './ui/LiveText'; 

interface TowerInfoProps {
    selectedKey: string | null;
    onClose: () => void;
    onSelectRelation: (key: string) => void;
}

const TowerInfo: React.FC<TowerInfoProps> = ({ selectedKey, onClose, onSelectRelation }) => {
    if (!selectedKey || !KNOWLEDGE_BASE[selectedKey]) return null;
    
    const info = KNOWLEDGE_BASE[selectedKey];

    const getTagColor = (tag: string) => {
        if (tag.includes('FAS 1')) return 'text-green-300 border-green-500/30';
        if (tag.includes('FAS 2')) return 'text-yellow-300 border-yellow-500/30';
        if (tag.includes('FAS 3')) return 'text-red-300 border-red-500/30';
        if (tag.includes('FAS 4')) return 'text-blue-300 border-blue-500/30';
        if (tag === 'PRED') return 'text-purple-300 border-purple-500/30';
        return 'text-slate-400 border-slate-700';
    };

    return (
        <div className="w-full flex flex-col font-sans mb-8">
            
            {/* HEADER - Minimalist */}
            <div className="flex items-baseline gap-3 mb-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">{info.title}</h2>
                <span className="text-xs font-mono text-indigo-400">ID: {selectedKey}</span>
            </div>

            {/* CONTENT */}
            <div className="flex flex-col gap-6">
                
                {/* EMBEDDED SYSTEM MAP - No Border */}
                <div className="w-full overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                    <SystemMap 
                        focusOnNode={selectedKey} 
                        minimal={true} 
                        interactive={false}
                        onNodeClick={(id) => onSelectRelation(id)}
                    />
                </div>

                {/* DESCRIPTION - Large readable text */}
                <div className="text-base text-slate-200 leading-relaxed pl-4 border-l-4 border-indigo-500/50">
                    <LiveText text={info.text} />
                </div>

                {/* TAGS & METADATA */}
                <div className="flex flex-wrap gap-3 items-center">
                    {info.tags && info.tags.map(tag => (
                        <span key={tag} className={`text-xs font-bold px-2 py-1 rounded border bg-slate-900/50 ${getTagColor(tag)}`}>
                            {tag}
                        </span>
                    ))}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-slate-500 uppercase font-bold">Målvärde:</span>
                        <span className="text-sm text-green-400 font-mono font-bold bg-green-900/20 px-2 py-0.5 rounded">{info.good}</span>
                    </div>
                </div>

            </div>
            
            {/* SEPARATOR */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent mt-8"></div>
        </div>
    );
};

export default TowerInfo;
