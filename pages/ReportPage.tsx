
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import saveAs from 'file-saver';
import { Page, LogLevel } from '../types';
import { useGenerationContext } from '../context/GenerationContext';
import { useSettings } from '../context/SettingsContext';
import { useLog } from '../hooks/useLog';
import { generateReportIntroduction, translateLyricsToEnglish } from '../services/geminiService';
import { playBeep } from '../utils/audio';
import { NavigationButtons } from '../components/common/NavigationButtons';

interface ReportPageProps {
  setPage: (page: Page) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ setPage }) => {
    const { state, styleData, qualityGroups, setReportIntroduction, setReportLyricsSnapshot, setTranslatedLyrics, isLoading, setIsLoading } = useGenerationContext();
    const { apiKey, geminiModel } = useSettings();
    const log = useLog();

    const [aboutContent, setAboutContent] = useState('');
    const [error, setError] = useState('');

    const plainLyrics = useMemo(() => {
        if (!state.lyrics) return '';
        return state.lyrics
            .replace(/\[.*?\]/g, '')
            .replace(/\(.*?\)/g, '')
            .replace(/\*.*?\*/g, '')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }, [state.lyrics]);

    const markdownToHtml = (text: string): string => {
        let html = text
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/^> \*(.*)\*/gim, '<blockquote class="border-l-4 border-[var(--border-secondary)] pl-4 italic text-[var(--text-muted)] my-2">$1</blockquote>')
            .replace(/^---$/gim, '<hr class="my-8 border-[var(--border-primary)]" />')
            .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/```([\s\S]*?)```/g, (match, content) => `<pre class="bg-[var(--bg-inset)] p-4 rounded-md whitespace-pre-wrap font-sans text-[var(--text-secondary)] overflow-x-auto">${content.trim()}</pre>`);
    
        html = html.replace(/^\s*[-*] (.*)/gm, '<li>$1</li>');
        html = html.replace(/(<li>[\s\S]*?<\/li>)/gs, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\s*<ul>/g, '');
        
        html = html.split('\n\n').map(p => {
            const trimmed = p.trim();
            if (!trimmed) return '';
            if (trimmed.startsWith('<div')) return trimmed;
            if (trimmed.startsWith('<h') || trimmed.startsWith('<ul>') || trimmed.startsWith('<hr') || trimmed.startsWith('<pre') || trimmed.startsWith('<blockquote')) return trimmed;
            return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
        }).join('');
    
        return html;
    };

    const finalMarkdown = useMemo(() => {
        const styleInfo = state.style ? styleData[state.style] : null;
        
        const allQualitiesList = qualityGroups.flatMap(g => g.qualities.map(q => ({...q, groupKey: g.key, groupName: g.groupName})));
        const selectedQualitiesDescriptions = Object.entries(state)
            .map(([key, value]) => {
                if (!value) return null;
                const quality = allQualitiesList.find(q => q.groupKey === key && q.name === value);
                if (quality) {
                    return `- **${quality.groupName}: ${quality.name}** - *${quality.description}*`;
                }
                return null;
            })
            .filter(Boolean)
            .join('\n');

        const instrumentDescriptions = state.instruments.map(instName => {
            const instrument = styleInfo?.instruments.find(i => i.name === instName);
            return `- **${instName}:** ${instrument?.description || 'No description available.'}`;
        }).join('\n');

        const karaokeLyricsHtml = `<div style="font-size: 1.25rem; line-height: 1.75rem; white-space: pre-wrap; font-family: sans-serif; background-color: var(--bg-inset); padding: 1rem; border-radius: 0.375rem;">${plainLyrics.replace(/\n/g, '<br />')}</div>`;

        const isBilingual = state.language.toLowerCase() !== state.language2.toLowerCase();
        const primaryIsEnglish = state.language.toLowerCase() === 'english';
        const secondaryIsEnglish = state.language2.toLowerCase() === 'english';
        const songHasNonEnglish = !primaryIsEnglish || (isBilingual && !secondaryIsEnglish);
        const hasTranslation = songHasNonEnglish && state.translatedLyrics;
        
        let chapterCount = 5;

        const translationChapter = hasTranslation ? `
---

## Chapter ${chapterCount++}: English Translation
**Original Language(s):** ${isBilingual ? `${state.language}, ${state.language2}` : state.language}
### Translated Lyrics
\`\`\`
${state.translatedLyrics}
\`\`\`
` : '';

        const aboutChapter = `
---

## Chapter ${chapterCount}: About the Artists
${aboutContent || 'Artist information not available.'}
`;

        return `
# Song Report: ${state.title || 'Untitled'}

## Chapter 1: The Story Behind the Song
${state.reportIntroduction || 'No introduction available.'}

---

## Chapter 2: Musical Blueprint
**Style: ${state.style || 'N/A'}**
${styleInfo ? `> *${styleInfo.description}*` : ''}
### Chosen Qualities
${selectedQualitiesDescriptions || 'No specific qualities selected.'}
### Instruments
${instrumentDescriptions || 'No instruments selected.'}

---

## Chapter 3: The Libretto
**Title:** ${state.title || 'Untitled'}
### Formatted Lyrics
\`\`\`
${state.lyrics || 'No lyrics generated.'}
\`\`\`

---

## Chapter 4: The Karaoke Session
### Karaoke Lyrics
<div class="karaoke-lyrics">${plainLyrics}</div>
${translationChapter}
${aboutChapter}
        `.trim().replace(/^\s+/gm, '');
    }, [state, styleData, qualityGroups, plainLyrics, aboutContent]);
    
    const finalHtml = useMemo(() => markdownToHtml(finalMarkdown).replace('<div class="karaoke-lyrics">', '<div class="text-xl leading-relaxed whitespace-pre-wrap font-sans bg-[var(--bg-inset)] p-4 rounded-md">').replace(/\n/g, '<br />'), [finalMarkdown]);

    const handleGenerate = useCallback(async (force = false) => {
        if (!aboutContent) {
            try {
                const aboutRes = await fetch('/Noor-Brink.md');
                if (!aboutRes.ok) throw new Error('Failed to load artist information.');
                let aboutText = await aboutRes.text();
                const currentYear = new Date().getFullYear();
                aboutText = aboutText.replace(/{year}/g, currentYear.toString());
                setAboutContent(aboutText);
            } catch(e: any) {
                log({ level: LogLevel.ERROR, source: 'App', header: 'Failed to load about content for report', details: { error: e.message }});
                setAboutContent('Artist information could not be loaded.');
            }
        }

        const lyricsHaveChanged = state.lyrics !== state.reportLyricsSnapshot;
        const needsIntroGeneration = force || (state.title && (!state.reportIntroduction || lyricsHaveChanged));
        
        const isBilingual = state.language.toLowerCase() !== state.language2.toLowerCase();
        const primaryIsEnglish = state.language.toLowerCase() === 'english';
        const secondaryIsEnglish = state.language2.toLowerCase() === 'english';
        const songHasNonEnglish = !primaryIsEnglish || (isBilingual && !secondaryIsEnglish);
        const needsTranslation = songHasNonEnglish && (!state.translatedLyrics || lyricsHaveChanged);

        if (!needsIntroGeneration && !needsTranslation) return;

        setIsLoading(true, 'Generating report content...');
        setError('');
        
        try {
            if (!apiKey) {
                setError("An API key is required to generate report content.");
                setIsLoading(false);
                return;
            }

            let somethingGenerated = false;
            if (needsTranslation) {
                const translation = await translateLyricsToEnglish(apiKey, geminiModel, state.lyrics, log);
                setTranslatedLyrics(translation);
                somethingGenerated = true;
            }

            if (needsIntroGeneration) {
                const introText = await generateReportIntroduction(apiKey, geminiModel, {
                    title: state.title,
                    topic: state.topic,
                    lyrics: state.lyrics,
                    singers: state.singers
                }, log);
                setReportIntroduction(introText);
                somethingGenerated = true;
            }
            
            setReportLyricsSnapshot(state.lyrics);
            if (somethingGenerated) playBeep();
        
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, aboutContent, geminiModel, state, log, setIsLoading, setReportIntroduction, setReportLyricsSnapshot, setTranslatedLyrics]);

    useEffect(() => {
        handleGenerate(false);
    }, []);

    const handleDownload = () => {
        if (!finalMarkdown) return;
        const blob = new Blob([finalMarkdown], { type: 'text/markdown;charset=utf-8' });
        const filename = `${state.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'song_report'}.md`;
        saveAs(blob, filename);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-hidden flex flex-col">
                <div className="flex-shrink-0">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Song Report</h1>
                    <p className="mt-2 text-[var(--text-muted)]">A complete breakdown of your creation. The introduction is AI-generated and can be redone.</p>
                </div>
                {error && (
                    <div className="flex-shrink-0 my-4 bg-[var(--color-red)]/10 text-[var(--color-red)] p-3 rounded-md text-sm">
                        <p>{error}</p>
                    </div>
                )}
                <div 
                    className="prose max-w-none text-[var(--text-secondary)] h-full overflow-y-auto pr-4 flex-grow mt-6 border-t border-[var(--border-primary)] pt-6"
                    dangerouslySetInnerHTML={{ __html: finalHtml }}
                />
                <div className="flex justify-between items-center gap-4 pt-4 mt-auto border-t border-[var(--border-primary)] flex-shrink-0">
                    <div>
                        <button
                            onClick={() => handleGenerate(true)}
                            disabled={isLoading || !apiKey}
                            className="px-6 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Redoing...' : 'Redo Introduction'}
                        </button>
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={isLoading || !!error || !finalMarkdown}
                        className="px-6 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Download (.md)
                    </button>
                </div>
            </div>
            <div className="flex-shrink-0">
                <NavigationButtons
                    onPrev={() => setPage('collection')}
                    onNext={() => setPage('cover')}
                    nextLabel="Create Cover Art"
                />
            </div>
        </div>
    );
};
