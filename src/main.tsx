import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initInputOptimizer } from './utils/inputOptimizer';

// Activa la optimización de escritura fluida sin predicción ni traductores
initInputOptimizer();

createRoot(document.getElementById('root')!).render(<App />);
