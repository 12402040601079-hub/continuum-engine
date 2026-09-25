import React from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CoreProblemSection } from './components/CoreProblemSection';
import { RealWorldImpactSection } from './components/RealWorldImpactSection';
import { ProposedSolutionSection } from './components/ProposedSolutionSection';
import { SystemPathwaySection } from './components/SystemPathwaySection';
import { ProductWalkthroughSection } from './components/ProductWalkthroughSection';
import { LiveDemoSection } from './components/LiveDemoSection';
import { UserOnboardingSection } from './components/UserOnboardingSection';
import { ObservabilitySection } from './components/ObservabilitySection';
import { OperationsSection } from './components/OperationsSection';
import { ChaosLabSection } from './components/ChaosLabSection';
import { DataArchitectureSection } from './components/DataArchitectureSection';
import { TechStackSection } from './components/TechStackSection';
import { ReliabilityTestingSection } from './components/ReliabilityTestingSection';
import { MethodologySection } from './components/MethodologySection';
import { SummaryVisionSection } from './components/SummaryVisionSection';
import { FooterResourcesSection } from './components/FooterResourcesSection';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white antialiased overflow-x-hidden">
      {/* Top Floating Glass Navigation */}
      <Navbar />

      <main>
        {/* 01 — Hero */}
        <HeroSection />

        {/* 02 — The Core Problem */}
        <CoreProblemSection />

        {/* 03 — Real-World Impact */}
        <RealWorldImpactSection />

        {/* 04 — Proposed Solution */}
        <ProposedSolutionSection />

        {/* 05 — System Pathway */}
        <SystemPathwaySection />

        {/* 06 — Product Walkthrough */}
        <ProductWalkthroughSection />

        {/* 07 — Live Demo */}
        <LiveDemoSection />

        {/* 08 — User Onboarding */}
        <UserOnboardingSection />

        {/* 09 — Observability & Crash Telemetry */}
        <ObservabilitySection />

        {/* 10 — Operations & Cluster Health */}
        <OperationsSection />

        {/* 11 — Resilience & Chaos Lab */}
        <ChaosLabSection />

        {/* 12 — Data Architecture */}
        <DataArchitectureSection />

        {/* 13 — Technology Stack */}
        <TechStackSection />

        {/* 14 — Reliability & Testing Pyramid */}
        <ReliabilityTestingSection />

        {/* 15 — Engineering Methodology Timeline */}
        <MethodologySection />

        {/* 16 — Summary & Vision */}
        <SummaryVisionSection />
      </main>

      {/* 17 — Resources & Dual CTA Footer */}
      <FooterResourcesSection />
    </div>
  );
};

export default App;
