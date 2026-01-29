import React, { Suspense } from 'react';
import { useStore } from './store';
import { ControlPanel } from './components/ControlPanel';
import { Visualizer } from './components/Visualizer';
import { HandController } from './components/HandController';
import { PolarPlotPanel } from './components/PolarPlotPanel';
import { SParameterPanel } from './components/SParameterPanel';
import { LinkBudgetPanel } from './components/LinkBudgetPanel';
import { SmithChartPanel } from './ui/panels/SmithChartPanel';
import { MimoPanel } from './ui/panels/MimoPanel';
import { EnvironmentPanel } from './ui/panels/EnvironmentPanel';
import { TimeDomainPanel } from './ui/panels/TimeDomainPanel';
import { MaterialEditorPanel } from './ui/panels/MaterialEditorPanel';
import { GeometryEditorPanel } from './ui/panels/GeometryEditorPanel';
import { AntennaMetricsPanel } from './ui/panels/AntennaMetricsPanel';
import { FormulaLabPanel } from './ui/panels/FormulaLabPanel';
import { NearFieldPanel } from './ui/panels/NearFieldPanel';
import { VisionBuilderPanel } from './ui/panels/VisionBuilderPanel';
import { MaxwellSolverPanel } from './ui/panels/MaxwellSolverPanel';
import { VersionHistoryPanel } from './ui/panels/VersionHistoryPanel';

const App: React.FC = () => {
  const { activeRightPanel } = useStore();

  const renderRightPanel = () => {
    switch(activeRightPanel) {
      case 'polar': return <PolarPlotPanel />;
      case 'sparam': return <SParameterPanel />;
      case 'linkBudget': return <LinkBudgetPanel />;
      case 'smith': return <SmithChartPanel />;
      case 'mimo': return <MimoPanel />;
      case 'environment': return <EnvironmentPanel />;
      case 'timeDomain': return <TimeDomainPanel />;
      case 'materials': return <MaterialEditorPanel />;
      case 'geometryEditor': return <GeometryEditorPanel />;
      case 'metrics': return <AntennaMetricsPanel />;
      case 'formulaLab': return <FormulaLabPanel />;
      case 'nearField': return <NearFieldPanel />;
      case 'visionBuilder': return <VisionBuilderPanel />;
      case 'maxwellSolver': return <MaxwellSolverPanel />;
      case 'versionHistory': return <VersionHistoryPanel />;
      default: return <PolarPlotPanel />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b1220] overflow-hidden text-slate-200">
      {/* Left Panel */}
      <ControlPanel />
      
      {/* Main Viewport */}
      <div className="flex-1 relative h-full flex">
        <div className="flex-1 relative h-full border-x border-slate-800">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center text-blue-500 font-mono bg-[#0b1220]">
                INITIALIZING PHYSICS ENGINE...
              </div>
            }>
              <Visualizer />
            </Suspense>

            {/* Hand Overlay */}
            <HandController />
        </div>
        
        {/* Right Panel (Charts/Tools) */}
        {renderRightPanel()}
      </div>
    </div>
  );
};

export default App;