


import React, { useMemo, useState } from 'react';
import { Page } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface KaraokePageProps {
  setPage: (page: Page) => void;
}

export const KaraokePage: React.FC<KaraokePageProps> = ({ setPage }) => {
    const { state } = useGenerationContext();
    const [copied, setCopied] = useState(false);

    const plainLyrics = useMemo(() => {
        if (!state.lyrics) return '';
        // Removes [Singer], [Verse], (oohs), *sound effect* etc. and cleans up empty lines
        return state.lyrics
            .replace(/\[.*?\]/g, '')
            .replace(/\(.*?\)/g, '')
            .replace(/\*.*?\*/g, '')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }, [state.lyrics]);
    
    const handleCopy = () => {
        if (!plainLyrics) return;
        navigator.clipboard.writeText(plainLyrics);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow flex flex-col overflow-hidden">
                <div className='flex-shrink-0 flex justify-between items-start'>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Karaoke</h1>
                        {state.lyrics && (
                           <p className="mt-2 text-[var(--text-muted)]">Sing your heart out! Here are the plain lyrics for your new song, "{state.title || 'Untitled'}".</p>
                        )}
                    </div>
                     <button
                        onClick={handleCopy}
                        disabled={!plainLyrics}
                        className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity text-sm font-semibold disabled:opacity-50"
                    >
                        {copied ? 'Copied!' : 'Copy Lyrics'}
                    </button>
                </div>
                
                <div className="mt-6 flex-grow bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-primary)] overflow-y-auto">
                    <pre className="text-center whitespace-pre-wrap font-sans text-4xl leading-relaxed text-[var(--text-primary)]">
                        {plainLyrics || 'No lyrics available to display.'}
                    </pre>
                </div>
            </div>

            <div className="flex-shrink-0">
                 <NavigationButtons
                    onPrev={() => setPage('cover')}
                />
            </div>
        </div>
    );
};