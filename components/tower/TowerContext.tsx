
import React, { createContext, useContext } from 'react';
import { DiagnosticData } from './types';

interface TowerContextType {
    diagnosticsRef: React.MutableRefObject<DiagnosticData> | null;
}

const TowerContext = createContext<TowerContextType>({ diagnosticsRef: null });

export const useTowerDiagnostics = () => {
    const ctx = useContext(TowerContext);
    if (!ctx.diagnosticsRef) {
        // Fallback mock if used outside provider (shouldn't happen in app)
        return { current: {} as DiagnosticData }; 
    }
    return ctx.diagnosticsRef;
};

export const TowerProvider: React.FC<{ 
    diagnosticsRef: React.MutableRefObject<DiagnosticData>; 
    children: React.ReactNode 
}> = ({ diagnosticsRef, children }) => {
    return (
        <TowerContext.Provider value={{ diagnosticsRef }}>
            {children}
        </TowerContext.Provider>
    );
};
