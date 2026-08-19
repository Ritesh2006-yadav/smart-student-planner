import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { PermanentTaskProvider } from './context/PermanentTaskContext';
import { PomodoroProvider } from './context/PomodoroContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><BrowserRouter><ThemeProvider><ToastProvider><AuthProvider><TaskProvider><PermanentTaskProvider><PomodoroProvider><App /></PomodoroProvider></PermanentTaskProvider></TaskProvider></AuthProvider></ToastProvider></ThemeProvider></BrowserRouter></React.StrictMode>
);
