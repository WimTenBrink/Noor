# Miranda Noor Lyric & Art Generator - User Manual

Welcome! This application is a creative partner designed to help you generate complete song concepts, from lyrical themes to final cover art, ready for use with music platforms like Suno. This app uses Google's AI models (Gemini and Imagen) to generate content.

## The Creative Workflow (10 Steps)

The application is designed as a step-by-step process. You can navigate through the pages using the "Creative Steps" menu on the left. The current step is highlighted. While you can navigate freely, following the steps in order provides the best results.

### Step 1: Topic
This is the foundation of your song.
- **What to do:** Enter a theme, a few keywords, a story idea, or a feeling. You must also select the singers for your project from the provided list.
- **Expand Topic:** Click the **"Expand Topic with AI"** button to let the AI elaborate on your initial idea into a rich, descriptive paragraph. This provides a stronger foundation for lyrics and art.

### Step 2: Language
Choose the language(s) for the lyrics.
- **What to do:** Select a primary language for the song. If you have chosen more than one singer, you can optionally select a second language for one of the singers to create a bilingual performance.

### Step 3: Qualities
Fine-tune the mood and tone of your song.
- **What to do:** Select any optional qualities to guide the AI. These will influence the lyrical tone and musical style suggestion.
- **Next Step:** When you click "Next", the AI will analyze your topic, selected languages, and qualities to suggest a suitable musical style on the next page.

### Step 4: Style
Choose the musical genre for your song.
- **What to do:** A list of styles is presented, grouped by genre. If you proceeded from the Qualities page, the AI's suggested style will be pre-selected. You can accept this suggestion or choose any other style you prefer.
- **Description:** Clicking a style shows a description and its typical instruments in the right-hand sidebar.

### Step 5: Instruments
Build the band for your track.
- **What to do:** Based on the style you chose, a list of appropriate instruments is shown. The most common ones are pre-selected. You can add or remove instruments by checking the boxes. Hover over an instrument to see its description.
- **For Suno:** Click the **"Copy Style & Instruments for Suno"** button. This copies a comma-separated list (e.g., "Pop, Synthesizer, Drum Machine, Bass Guitar") to your clipboard, which you can paste directly into Suno's "Style of Music" field.

### Step 6: Lyrics
This is where your song's story comes to life.
- **What to do:** When you first land on this page, the AI will automatically generate a song title and lyrics based on all your previous selections.
- **For Suno:** The lyrics are formatted according to Suno's specifications, including structure tags like `[Verse]` and `[Chorus]`, and indicators for the singers, e.g., `[Miranda]`.
- **Redo & Copy:** You can regenerate the title or lyrics independently using the "Redo" buttons. Use the "Copy Formatted" button to grab the lyrics for Suno, or "Copy Plain" for just the words.

### Step 7: Collection
Your completed song package, all in one place.
- **What to do:** This page provides a final summary of all your generated assets: Title, Style & Instruments, and Lyrics.
- **Exporting:** Use the "Copy" buttons for each section to easily transfer your content. Starting on this page, the **"Download All"** button will appear in the header.

### Step 8: Report
View the comprehensive story of your song.
- **What to do:** This page automatically generates and displays a full report of your creation, including a fictional origin story for the song, personal notes from the artists, the musical blueprint, and the lyrics.
- **Redo Introduction:** You can use the button on this page to have the AI regenerate the "Story Behind the Song" section.

### Step 9: Cover Image
Create the visual identity for your song.
- **What to do:** The AI first generates a detailed, artistic prompt, then uses it to create two unique 9:16 aspect ratio (tall) cover images using Imagen. You can generate more images one by one.
- **Skip:** If you prefer not to create a cover, you can use the "Karaoke / Skip" button to proceed.
- **View Prompt & Download:** Select an image to make it your active choice for the collection. You can click "View Prompt" to see what text was used to create it, or hover over any image to find its download button.

### Step 10: Karaoke
A simple, clean view for a sing-along.
- **What to do:** This page displays the lyrics in a large, easy-to-read format, with all formatting tags like `[Verse]` and `[Chorus]` removed. It's perfect for singing along to your newly created song.
- **Copy Lyrics:** A button is available to copy the plain text of the lyrics to your clipboard.

## Dialogs & Modals

- **Settings:** Contains three tabs:
    1.  **API Key:** For entering and saving your Google AI API key.
    2.  **Gemini:** For choosing the Gemini model used for all text-based tasks.
    3.  **Imagen:** For choosing the Imagen model used for all image generation.
- **Reset Confirmation:** When you click the Reset button, a panel will appear asking you to confirm. This prevents accidental loss of your work.
- **Console:** A log viewer for debugging Gemini and Imagen API calls. Allows filtering and saving logs.
- **ToS:** Renders `tos.md`.
- **About:** Renders markdown files about the creators with a tabbed interface.
- **Manual:** Renders this guide.
- **Music Styles Explorer:** A detailed browser for all music styles and instruments from the JSON file.
    - **AI Feature:** Allows generating an image of a selected instrument.
- **Language:** A searchable dialog for selecting from a large list of languages.

## Sidebars & Header

- **Left Sidebar:** Primary navigation for the 10-step workflow.
- **Right Sidebar:** A contextual summary pane showing the current state of the song being created (topic, singers, style, etc.).
- **Header Buttons:**
  - **Reset (Trash Can):** Opens a confirmation panel to start a new session. This will clear all your current progress.
  - **Theme (Sun/Moon):** Switch between light and dark mode.
  - **Settings (Gear):** Opens the Settings dialog.
  - **Console (Terminal):** View a detailed log of all API requests and responses.
  - **Manual (Book):** Opens this guide.
  - **Music Styles Explorer (Music Note):** A dialog to browse all available music styles and their instruments.
  - **Terms of Service (Document):** View the application's ToS.
  - **About (Info):** Learn more about the creators, Miranda Noor and Annelies Brink.
  - **Download All (Download Icon):** Appears on the Collection page and subsequent steps. Downloads a ZIP file containing all your song's assets.