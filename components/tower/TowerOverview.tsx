
import React from 'react';
import OverviewPurpose from './knowledge/01_OverviewPurpose';
import OverviewProblems from './knowledge/02_OverviewProblems';
import OverviewArchitecture from './knowledge/03_OverviewArchitecture';
import BargeInDeepDive from './knowledge/04_BargeInDeepDive';
import PredictionLogicDeepDive from './knowledge/05_PredictionLogicDeepDive';
import EvaluationRealityCheck from './knowledge/06_EvaluationRealityCheck';
import FutureOptimizationPlan from './knowledge/07_FutureOptimizationPlan';
import StartupRaceConditionDeepDive from './knowledge/08_StartupRaceConditionDeepDive';
import ArchitectureDeepDiveBlob from './knowledge/09_ArchitectureDeepDiveBlob';
import FutureRisksAndPlans from './knowledge/10_FutureRisksAndPlans';
import VadHysteresisAnalysis from './knowledge/11_VadHysteresisAnalysis';
import VadArchitectureDeepDive from './knowledge/12_VadArchitectureDeepDive';
import ScenarioAnalysis from './knowledge/13_ScenarioAnalysis';
import VadDynamics from './knowledge/14_VadDynamics';
import TheSqueezeDeepDive from './knowledge/15_TheSqueezeDeepDive';
import RenderPipeline from './knowledge/16_RenderPipeline';
import BucketLogic from './knowledge/17_BucketLogic';
import TimeAnchoring from './knowledge/18_TimeAnchoring';
import TheBlinkAnalysis from './knowledge/19_TheBlinkAnalysis';
import AbstractionLayers from './knowledge/20_AbstractionLayers';
import VisualHandover from './knowledge/21_VisualHandover';
import TheAccordionEffect from './knowledge/22_TheAccordionEffect';
import CodeArchaeology from './knowledge/23_CodeArchaeology';
import TheStuckCounter from './knowledge/24_TheStuckCounter';
import CleanBreakDeepDive from './knowledge/25_CleanBreakDeepDive';
import GhostPressureDeepDive from './knowledge/26_GhostPressureDeepDive';

interface TowerOverviewProps {
    onClose: () => void;
    highlightedId?: string | null;
}

const TowerOverview: React.FC<TowerOverviewProps> = ({ onClose, highlightedId }) => {
    return (
        <div className="w-full flex flex-col font-sans space-y-12 text-base text-slate-300">
            {/* Render all modules with spacing */}
            <div className="space-y-10 [&>section>div]:border-0 [&>section>div]:bg-transparent [&>section>div]:p-0 [&>section>h3]:text-sm [&>section>h3]:mb-4">
                <OverviewPurpose />
                <OverviewProblems />
                <OverviewArchitecture />
                <BargeInDeepDive />
                <PredictionLogicDeepDive />
                <EvaluationRealityCheck />
                <FutureOptimizationPlan />
                <StartupRaceConditionDeepDive />
                <ArchitectureDeepDiveBlob />
                <FutureRisksAndPlans />
                <VadHysteresisAnalysis />
                <VadArchitectureDeepDive />
                <ScenarioAnalysis />
                <VadDynamics />
                <TheSqueezeDeepDive />
                
                {/* GRAPHICS & RENDERING DEEP DIVE */}
                <RenderPipeline />
                <BucketLogic />
                <TimeAnchoring />
                <TheBlinkAnalysis />
                <AbstractionLayers />
                <VisualHandover />
                <TheAccordionEffect />
                <CodeArchaeology />
                <TheStuckCounter />
                
                {/* PROTOCOLS */}
                <CleanBreakDeepDive />
                <GhostPressureDeepDive />
            </div>
        </div>
    );
};

export default TowerOverview;
