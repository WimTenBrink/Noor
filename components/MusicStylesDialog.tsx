
import React, { useState } from 'react';
import { Modal } from './Modal';
import { useGenerationContext } from '../context/GenerationContext';
import { useSettings } from '../context/SettingsContext';
import { StyleGroup, MusicStyleDefinition, Instrument, LogLevel } from '../types';
import { useLog } from '../hooks/useLog';
import { generateImage } from '../services/imagenService';
import { getCharacterDescriptions } from '../services/characterService';

interface MusicStylesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SelectedItem = 
    | { type: 'group'; data: StyleGroup }
    | { type: 'style'; data: { key: string; def: MusicStyleDefinition } }
    | { type: 'instrument'; data: Instrument };

const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export const MusicStylesDialog: React.FC<MusicStylesDialogProps> = ({ isOpen, onClose }) => {
    const { styleGroups, isStyleDataLoading } = useGenerationContext();
    const { apiKey, imagenModel } = useSettings();
    const log = useLog();

    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [expandedStyle, setExpandedStyle] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('4:3');
    
    const handleSelect = (item: SelectedItem) => {
        setSelectedItem(item);
        setGeneratedImageUrl(null);
        setError(null);
        
        if (item.type === 'group') {
            setExpandedGroup(expandedGroup === item.data.name ? null : item.data.name);
            setExpandedStyle(null);
        }
        if (item.type === 'style') {
            setExpandedStyle(expandedStyle === item.data.key ? null : item.data.key);
        }
    };

    const handleGenerateImage = async (item: Instrument) => {
        if (!apiKey) {
            setError("Please set your API Key in the settings before generating content.");
            return;
        }

        setIsGenerating(true);
        setGeneratedImageUrl(null);
        setError(null);
        
        let prompt = '';
        const itemNameLower = item.name.toLowerCase();
        const isSinger = itemNameLower.includes('(') || itemNameLower.includes('vocal');

        if (isSinger) {
            const allDescriptions = await getCharacterDescriptions();
            let singerName = '';
            let singerDescription = '';
            const singerMatch = item.name.match(/\(([^)]+)\)/);

            if (singerMatch && singerMatch[1]) {
                const singerInParen = singerMatch[1].toLowerCase();
                if (singerInParen.includes('miranda')) {
                    singerName = 'Miranda Noor';
                    singerDescription = allDescriptions.miranda;
                } else if (singerInParen.includes('annelies')) {
                    singerName = 'Annelies Brink';
                    singerDescription = allDescriptions.annelies;
                }
            }

            if (singerName) {
                prompt = `Photorealistic studio portrait of ${singerName}. Description: ${singerDescription}. She is in a music recording studio environment. The image should be a close-up or medium shot, focusing on her expression. Use cinematic lighting. Image should be sharp focus, high-detail, 8k.`;
            } else {
                prompt = `Photorealistic studio portrait of a female singer. Her expression matches the style: ${item.name}. ${item.description}. She is in a music recording studio environment. Use cinematic lighting. Image should be sharp focus, high-detail, 8k.`;
            }
        } else {
            prompt = `Photorealistic studio photograph of a single ${item.name}. Description: ${item.description}. The instrument is the sole focus, presented against a clean, neutral background to highlight its features. Use cinematic lighting to emphasize details like wood grain, metal texture, or strings. Image should be sharp focus, high-detail, 8k.`;
        }
        
        try {
            const imageUrl = await generateImage(apiKey, prompt, imagenModel, log, aspectRatio);
            setGeneratedImageUrl(imageUrl);
        } catch (err: any) {
            setError(err.message || "An error occurred during image generation.");
            log({
                level: LogLevel.ERROR,
                source: 'App',
                header: 'Music Style Image generation failed',
                details: { error: err.message, prompt }
            });
        } finally {
            setIsGenerating(false);
        }
    }
    
    const renderContent = () => {
        if (isStyleDataLoading) {
            return <div className="p-8 text-center text-[var(--text-muted)]">Loading music styles...</div>
        }

        return (
            <div className="flex h-full">
                {/* Left: Tree View */}
                <div className="w-1/3 border-r border-[var(--border-primary)] overflow-y-auto pr-2">
                    {styleGroups.map(group => (
                        <div key={group.name} className="py-1">
                            <button onClick={() => handleSelect({ type: 'group', data: group })} className="w-full text-left flex items-center justify-between p-2 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors">
                                <span className="font-semibold text-[var(--text-primary)]">{group.name}</span>
                                <ChevronRightIcon className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${expandedGroup === group.name ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedGroup === group.name && (
                                <div className="pl-4 border-l-2 border-[var(--accent-primary)] ml-2">
                                    {Object.entries(group.styles).map(([styleKey, styleDef]) => (
                                        <div key={styleKey}>
                                            <button onClick={() => handleSelect({ type: 'style', data: { key: styleKey, def: styleDef } })} className="w-full text-left flex items-center justify-between p-2 rounded-md hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                                                <span className="text-[var(--text-secondary)]">{styleKey}</span>
                                                 <ChevronRightIcon className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${expandedStyle === styleKey ? 'rotate-90' : ''}`} />
                                            </button>
                                            {expandedStyle === styleKey && (
                                                <div className="pl-4 border-l-2 border-[var(--border-secondary)] ml-2">
                                                    {styleDef.instruments.map(instrument => (
                                                        <button key={instrument.name} onClick={() => handleSelect({ type: 'instrument', data: instrument })} className="w-full text-left p-2 text-sm rounded-md hover:bg-[var(--bg-tertiary)]/30 text-[var(--text-muted)]">
                                                            - {instrument.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right: Detail View */}
                <div className="w-2/3 pl-6 overflow-y-auto">
                    {!selectedItem ? (
                        <div className="h-full flex items-center justify-center text-[var(--text-muted)]">
                            <p>Select an item from the list to see details.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedItem.type === 'group' && (
                                <>
                                    <h2 className="text-2xl font-bold text-[var(--accent-secondary)]">{selectedItem.data.name}</h2>
                                    <p className="text-[var(--text-secondary)]">{selectedItem.data.description}</p>
                                    <h3 className="text-lg font-semibold pt-4 border-t border-[var(--border-primary)]">Styles in this Group:</h3>
                                    <ul className="list-disc pl-5 text-[var(--text-secondary)]">
                                        {Object.keys(selectedItem.data.styles).map(key => <li key={key}>{key}</li>)}
                                    </ul>
                                </>
                            )}
                             {selectedItem.type === 'style' && (
                                <>
                                    <h2 className="text-2xl font-bold text-[var(--accent-secondary)]">{selectedItem.data.key}</h2>
                                    <p className="text-[var(--text-secondary)]">{selectedItem.data.def.description}</p>
                                    <h3 className="text-lg font-semibold pt-4 border-t border-[var(--border-primary)]">Instruments in this Style:</h3>
                                    <ul className="list-disc pl-5 text-[var(--text-secondary)]">
                                        {selectedItem.data.def.instruments.map(inst => <li key={inst.name}>{inst.name}</li>)}
                                    </ul>
                                </>
                            )}
                             {selectedItem.type === 'instrument' && (
                                <>
                                    <h2 className="text-2xl font-bold text-[var(--accent-secondary)]">{selectedItem.data.name}</h2>
                                    <p className="text-[var(--text-secondary)]">{selectedItem.data.description}</p>
                                     <div className="pt-4 border-t border-[var(--border-primary)] flex items-center gap-4">
                                        <button onClick={() => handleGenerateImage(selectedItem.data)} disabled={isGenerating || !apiKey} className="px-4 py-2 bg-[var(--accent-primary)] text-white font-semibold rounded-md hover:bg-[var(--accent-hover)] disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors">
                                            {isGenerating ? 'Generating...' : 'Generate Image'}
                                        </button>
                                        <div>
                                            <label htmlFor="aspect-ratio-select" className="sr-only">Aspect Ratio</label>
                                            <select 
                                                id="aspect-ratio-select"
                                                value={aspectRatio}
                                                onChange={e => setAspectRatio(e.target.value as any)}
                                                disabled={isGenerating}
                                                className="bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] text-[var(--text-primary)] text-sm rounded-md focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] block w-full p-2"
                                            >
                                                <option value="4:3">4:3 (Landscape)</option>
                                                <option value="3:4">3:4 (Portrait)</option>
                                                <option value="1:1">1:1 (Square)</option>
                                                <option value="16:9">16:9 (Widescreen)</option>
                                                <option value="9:16">9:16 (Tall)</option>
                                            </select>
                                        </div>
                                     </div>
                                     {error && <p className="mt-4 text-red-400">{error}</p>}
                                     <div className="mt-4">
                                        {isGenerating && (
                                             <div className="w-full max-w-sm bg-slate-700 rounded-md flex items-center justify-center" style={{aspectRatio: aspectRatio.replace(':', ' / ')}}>
                                                <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                             </div>
                                        )}
                                        {generatedImageUrl && (
                                            <div className="relative group max-w-sm">
                                                <img src={generatedImageUrl} alt={`Generated image of ${selectedItem.data.name}`} className="rounded-lg shadow-xl w-full" style={{aspectRatio: aspectRatio.replace(':', ' / ')}}/>
                                                 <a
                                                    href={generatedImageUrl}
                                                    download={`${selectedItem.data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`}
                                                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-[var(--color-green)] transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Download Image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                            </div>
                                        )}
                                     </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Music Styles Explorer">
            {renderContent()}
        </Modal>
    );
};
