
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
import AudioEnginePotential from './knowledge/27_AudioEnginePotential';
import HardwareIntegration from './knowledge/28_HardwareIntegration';
import AudioMixingScenarios from './knowledge/29_AudioMixingScenarios';
import MasterWiringGuide from './knowledge/30_MasterWiringGuide';
import VirtualCableGuide from './knowledge/31_VirtualCableGuide';
import SimpleJabraGuide from './knowledge/32_SimpleJabraGuide';
import UniversalAutomation from './knowledge/33_UniversalAutomation';
import LongDurationStrategy from './knowledge/34_LongDurationStrategy';
import TotalSystemCritique from './knowledge/35_TotalSystemCritique';
import AudioDistribution from './knowledge/36_AudioDistribution';
import PuppeteerProtocol from './knowledge/37_PuppeteerProtocol';
import TheTapeRecorderProtocol from './knowledge/38_TheTapeRecorderProtocol';
import PromptSimplification from './knowledge/39_PromptSimplification';
import ShieldPunctureDeepDive from './knowledge/40_ShieldPunctureDeepDive';
import VisualDebuggingFix from './knowledge/41_VisualDebuggingFix';
import HybridSpeedControl from './knowledge/42_HybridSpeedControl';
import AdaptiveSlew from './knowledge/43_AdaptiveSlew';
import TowerUnification from './knowledge/44_TowerUnification';
import PipeliningDeepDive from './knowledge/45_PipeliningDeepDive';
import TheBlindSpotDeepDive from './knowledge/46_TheBlindSpotDeepDive';
import WakeUpProtocol from './knowledge/47_WakeUpProtocol';
import DynamicPersonaInjection from './knowledge/48_DynamicPersonaInjection';
import EcoMode from './knowledge/49_EcoMode';
import HybridVelocity from './knowledge/50_HybridVelocity';
import PromptEngineering from './knowledge/51_PromptEngineering';

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
                
                {/* FUTURE DEV */}
                <AudioEnginePotential />
                <HardwareIntegration />
                <AudioMixingScenarios />
                
                {/* THE MASTER GUIDES */}
                <MasterWiringGuide />
                <VirtualCableGuide />
                <SimpleJabraGuide />
                <UniversalAutomation />
                <LongDurationStrategy />
                
                {/* THE DISTRIBUTION & CRITIQUE */}
                <TotalSystemCritique />
                <AudioDistribution />
                
                {/* THE PUPPETEER & NEW PROTOCOLS */}
                <PuppeteerProtocol />
                <TheTapeRecorderProtocol />
                <PromptSimplification />
                
                {/* CRITICAL BUG FIXES & ENGINE UPDATES */}
                <ShieldPunctureDeepDive />
                <VisualDebuggingFix />
                <HybridSpeedControl />
                <AdaptiveSlew />
                <TowerUnification />
                <PipeliningDeepDive />
                <TheBlindSpotDeepDive />
                <WakeUpProtocol />
                <DynamicPersonaInjection />
                <EcoMode />
                <HybridVelocity />
                
                {/* PROMPT & LANGUAGE */}
                <PromptEngineering />
            </div>
            
            {/* End Marker to confirm scroll reach */}
            <div className="flex items-center justify-center pt-8 opacity-30 pb-8">
                <div className="h-1 w-20 bg-slate-700 rounded-full"></div>
            </div>
        </div>
    );
};

export default TowerOverview;
