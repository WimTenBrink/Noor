
import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Modal } from './Modal';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'api' | 'gemini' | 'imagen';

const GEMINI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and cost-effective for most tasks.', disabled: false },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable model for complex reasoning, but with higher latency and cost.', disabled: false },
];

const IMAGEN_MODELS = [
    // Imagen 4 (Preview)
    { id: 'imagen-4.0-ultra-generate-preview-06-06', name: 'Imagen 4 Ultra (Preview)', description: 'Highest quality preview model for demanding tasks.', disabled: false },
    { id: 'imagen-4.0-generate-preview-06-06', name: 'Imagen 4 Standard (Preview)', description: 'Standard preview model with improved text rendering.', disabled: false },
    { id: 'imagen-4.0-fast-generate-preview-06-06', name: 'Imagen 4 Fast (Preview)', description: 'Lower latency preview model for quicker results.', disabled: false },

    // Imagen 3 (GA)
    { id: 'imagen-3.0-generate-002', name: 'Imagen 3 Standard', description: 'Current-generation model for high-quality images.', disabled: false },
    { id: 'imagen-3.0-fast-generate-001', name: 'Imagen 3 Fast', description: 'Faster version of the current-generation model.', disabled: false },
    { id: 'imagen-3.0-generate-001', name: 'Imagen 3 Legacy Standard', description: 'Previous standard model, still available.', disabled: false },
    
    // Imagen 2 (Legacy)
    { id: 'imagegeneration@006', name: 'Imagen 2 (v006)', description: 'Latest stable legacy model.', disabled: false },
    { id: 'imagegeneration@005', name: 'Imagen 2 (v005)', description: 'Previous stable legacy model.', disabled: false },
    { id: 'imagegeneration@002', name: 'Imagen 2 (v002)', description: 'Original legacy model for generation and editing.', disabled: false },
];


export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey, geminiModel, setGeminiModel, imagenModel, setImagenModel } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('api');

  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [localGeminiModel, setLocalGeminiModel] = useState(geminiModel);
  const [localImagenModel, setLocalImagenModel] = useState(imagenModel);
  
  useEffect(() => {
    if (isOpen) {
        setLocalApiKey(apiKey || '');
        setLocalGeminiModel(geminiModel);
        setLocalImagenModel(imagenModel);
    }
  }, [apiKey, geminiModel, imagenModel, isOpen]);

  const handleSave = () => {
    setApiKey(localApiKey);
    setGeminiModel(localGeminiModel);
    setImagenModel(localImagenModel);
    onClose();
  };
  
  const TabButton: React.FC<{ tabId: SettingsTab, children: React.ReactNode }> = ({ tabId, children }) => (
    <button
        onClick={() => setActiveTab(tabId)}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            activeTab === tabId
                ? 'border-[var(--accent-primary)] text-[var(--accent-secondary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-secondary)]'
        }`}
    >
        {children}
    </button>
);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="flex flex-col h-full">
        <div className="border-b border-[var(--border-primary)] flex-shrink-0">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <TabButton tabId="api">API Key</TabButton>
                <TabButton tabId="gemini">Gemini</TabButton>
                <TabButton tabId="imagen">Imagen</TabButton>
            </nav>
        </div>
        
        <div className="py-6 overflow-y-auto flex-grow pr-4">
            {activeTab === 'api' && (
                <div className="space-y-6">
                    <p className="text-[var(--text-secondary)]">
                    Enter your Google AI API key below. Your key is saved only in your browser's local storage and is never sent to our servers. You can get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-secondary)] hover:underline">Google AI Studio</a>.
                    </p>
                    <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                        Google AI API Key
                    </label>
                    <input
                        type="text"
                        id="apiKey"
                        name="apiKey"
                        autoComplete="on"
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                        placeholder="Enter your API key here"
                    />
                    </div>
                </div>
            )}
            {activeTab === 'gemini' && (
                 <div className="space-y-6">
                    <p className="text-[var(--text-secondary)]">
                        Choose the Gemini model to use for all text generation tasks like creating lyrics, expanding topics, and generating prompts.
                    </p>
                    <fieldset className="space-y-4">
                        <legend className="block text-sm font-medium text-[var(--text-muted)] mb-1">Available Gemini Models</legend>
                        {GEMINI_MODELS.map(model => (
                            <label key={model.id} htmlFor={model.id} className={`flex items-start p-3 rounded-md transition-colors border ${localGeminiModel === model.id ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-secondary)]' : 'bg-[var(--bg-tertiary)] border-transparent'} ${model.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--bg-tertiary)]/50'}`}>
                                <input
                                    type="radio"
                                    id={model.id}
                                    name="gemini-model"
                                    value={model.id}
                                    checked={localGeminiModel === model.id}
                                    onChange={(e) => setLocalGeminiModel(e.target.value)}
                                    disabled={model.disabled}
                                    className="h-4 w-4 mt-1 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] shrink-0"
                                />
                                <div className="ml-3 text-sm">
                                    <span className={`font-medium ${localGeminiModel === model.id ? 'text-[var(--accent-subtle-text)]' : 'text-[var(--text-primary)]'}`}>{model.name}</span>
                                    <p className={`text-[var(--text-muted)]`}>{model.description}</p>
                                </div>
                            </label>
                        ))}
                    </fieldset>
                 </div>
            )}
             {activeTab === 'imagen' && (
                 <div className="space-y-6">
                    <p className="text-[var(--text-secondary)]">
                        Choose the Imagen model to use for generating cover art images.
                    </p>
                    <fieldset className="space-y-4">
                        <legend className="block text-sm font-medium text-[var(--text-muted)] mb-1">Available Imagen Models</legend>
                        {IMAGEN_MODELS.map(model => (
                             <label key={model.id} htmlFor={model.id} className={`flex items-start p-3 rounded-md transition-colors border ${localImagenModel === model.id ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-secondary)]' : 'bg-[var(--bg-tertiary)] border-transparent'} ${model.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--bg-tertiary)]/50'}`}>
                                <input
                                    type="radio"
                                    id={model.id}
                                    name="imagen-model"
                                    value={model.id}
                                    checked={localImagenModel === model.id}
                                    onChange={(e) => setLocalImagenModel(e.target.value)}
                                    disabled={model.disabled}
                                    className="h-4 w-4 mt-1 bg-[var(--bg-tertiary)] border-[var(--border-secondary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] shrink-0"
                                />
                                <div className="ml-3 text-sm">
                                    <span className={`font-medium ${localImagenModel === model.id ? 'text-[var(--accent-subtle-text)]' : 'text-[var(--text-primary)]'}`}>{model.name}</span>
                                    <p className={`text-[var(--text-muted)]`}>{model.description}</p>
                                </div>
                            </label>
                        ))}
                    </fieldset>
                 </div>
            )}
        </div>

        <div className="flex justify-end items-center gap-4 pt-4 flex-shrink-0 border-t border-[var(--border-primary)]">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-secondary)]"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="px-6 py-2 bg-[var(--accent-primary)] text-[var(--text-on-accent)] rounded-md hover:bg-[var(--accent-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--accent-primary)]"
            >
                Save & Close
            </button>
        </div>
      </div>
    </Modal>
  );
};
