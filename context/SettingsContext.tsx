
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface SettingsContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  geminiModel: string;
  setGeminiModel: (model: string) => void;
  imagenModel: string;
  setImagenModel: (model: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [geminiModel, setGeminiModelState] = useState<string>('gemini-2.5-flash');
  const [imagenModel, setImagenModelState] = useState<string>('imagen-4.0-ultra-generate-preview-06-06');

  useEffect(() => {
    const storedKey = localStorage.getItem('userApiKey');
    if (storedKey) {
      setApiKeyState(storedKey);
    }
    const storedGeminiModel = localStorage.getItem('geminiModel');
    if (storedGeminiModel) {
      setGeminiModelState(storedGeminiModel);
    }
    const storedImagenModel = localStorage.getItem('imagenModel');
    if (storedImagenModel) {
      setImagenModelState(storedImagenModel);
    }
  }, []);

  const setApiKey = (key: string) => {
    localStorage.setItem('userApiKey', key);
    setApiKeyState(key);
  };
  
  const setGeminiModel = (model: string) => {
    localStorage.setItem('geminiModel', model);
    setGeminiModelState(model);
  };

  const setImagenModel = (model: string) => {
    localStorage.setItem('imagenModel', model);
    setImagenModelState(model);
  };

  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey, geminiModel, setGeminiModel, imagenModel, setImagenModel }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};