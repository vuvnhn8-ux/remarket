/**
 * Re:Market - Simulation Context & State Provider
 * Controls Global Simulation Mode, Live Automation Subscriptions,
 * Background Worker status, and Live Event Monitoring.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SimulationJob,
  SimulationWorker,
  SimulationChannel,
  SimulationAiProvider,
  SimulationActivityLog,
  SimulationMetrics,
} from '../types/simulation';
import { simulationEngine } from '../services/simulationEngine';

const STORAGE_KEY = 'remarket_simulation_mode';

interface SimulationContextType {
  isSimulationMode: boolean;
  setSimulationMode: (enabled: boolean) => void;
  toggleSimulationMode: () => void;
  jobs: SimulationJob[];
  workers: SimulationWorker[];
  channels: SimulationChannel[];
  aiProviders: SimulationAiProvider[];
  activityLogs: SimulationActivityLog[];
  metrics: SimulationMetrics;
  isLiveMonitorOpen: boolean;
  setIsLiveMonitorOpen: (open: boolean) => void;
  retryJob: (jobId: string) => void;
  triggerSimulationEvent: (category: any, message: string, details?: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Simulation Mode State (Defaults to TRUE when visiting for the first time)
  const [isSimulationMode, setIsSimulationModeState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) return true; // Default ON!
      return stored === 'true';
    } catch {
      return true;
    }
  });

  const [isLiveMonitorOpen, setIsLiveMonitorOpen] = useState<boolean>(false);

  // 2. Local reactive state synced from simulationEngine
  const [engineState, setEngineState] = useState(() => simulationEngine.getSnapshot());

  useEffect(() => {
    if (isSimulationMode) {
      simulationEngine.start();
    } else {
      simulationEngine.stop();
    }

    const unsubscribe = simulationEngine.subscribe(() => {
      setEngineState(simulationEngine.getSnapshot());
    });

    return () => {
      unsubscribe();
    };
  }, [isSimulationMode]);

  const setSimulationMode = useCallback((enabled: boolean) => {
    setIsSimulationModeState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch (e) {
      console.warn('Failed to save simulation mode to localStorage:', e);
    }
  }, []);

  const toggleSimulationMode = useCallback(() => {
    setSimulationMode(!isSimulationMode);
  }, [isSimulationMode, setSimulationMode]);

  const retryJob = useCallback((jobId: string) => {
    simulationEngine.retryJob(jobId);
  }, []);

  const triggerSimulationEvent = useCallback(
    (category: any, message: string, details?: string) => {
      simulationEngine.addLog({
        category,
        level: 'info',
        message,
        details,
      });
    },
    []
  );

  return (
    <SimulationContext.Provider
      value={{
        isSimulationMode,
        setSimulationMode,
        toggleSimulationMode,
        jobs: engineState.jobs,
        workers: engineState.workers,
        channels: engineState.channels,
        aiProviders: engineState.aiProviders,
        activityLogs: engineState.activityLogs,
        metrics: engineState.metrics,
        isLiveMonitorOpen,
        setIsLiveMonitorOpen,
        retryJob,
        triggerSimulationEvent,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
