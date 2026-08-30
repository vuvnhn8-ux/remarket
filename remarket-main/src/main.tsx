import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';
import { SimulationProvider } from './context/SimulationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <SimulationProvider>
        <App />
      </SimulationProvider>
    </LanguageProvider>
  </StrictMode>,
);

