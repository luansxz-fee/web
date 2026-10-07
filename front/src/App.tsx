import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MedProvider } from './context/MedContext';
import AppRouter from './components/AppRouter';
import './index.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MedProvider>
          <AppRouter />
        </MedProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
