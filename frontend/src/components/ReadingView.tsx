import { useState, useCallback, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReadingMode, WordContextMenuData } from "@/types/reading";
import { WordContextMenu } from "./WordContextMenu";
import { getWordDefinition, pronounceWord } from "@/lib/mockDictionary";
import { cn } from "@/lib/utils";

interface ReadingViewProps {
  content: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  mode: ReadingMode;
  hasWord: (word: string) => boolean;
  onAddWord: (word: string, definition: string, context?: string) => boolean;
}

export function ReadingView({
  content,
  currentPage,
  onPageChange,
  mode,
  hasWord,
  onAddWord,
}: ReadingViewProps) {
  const [contextMenu, setContextMenu] = useState<WordContextMenuData | null>(
    null,
  );
  const [currentSentence, setCurrentSentence] = useState(0);

  // Split current page content into sentences for sentence mode
  const sentences = useMemo(() => {
    const pageContent = content[currentPage] || "";
    return pageContent
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);
  }, [content, currentPage]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) return;

    const word = selection.toString().trim();
    // Only handle single words
    if (word.includes(" ")) return;

    const cleanWord = word.replace(/[^a-zA-Z'-]/g, "");
    if (cleanWord.length === 0) return;

    const definition = getWordDefinition(cleanWord);

    setContextMenu({
      word: cleanWord,
      definition,
      position: { x: e.clientX, y: e.clientY },
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleAddToDictionary = useCallback(() => {
    if (!contextMenu) return;

    const context =
      mode === "sentence" ? sentences[currentSentence] : undefined;

    onAddWord(contextMenu.word, contextMenu.definition, context);
  }, [contextMenu, onAddWord, mode, sentences, currentSentence]);

  const handlePronounce = useCallback(() => {
    if (!contextMenu) return;
    pronounceWord(contextMenu.word);
  }, [contextMenu]);

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
      setCurrentSentence(0);
    }
  };

  const goToNextPage = () => {
    if (currentPage < content.length - 1) {
      onPageChange(currentPage + 1);
      setCurrentSentence(0);
    }
  };

  const goToPreviousSentence = () => {
    if (currentSentence > 0) {
      setCurrentSentence(currentSentence - 1);
    } else if (currentPage > 0) {
      onPageChange(currentPage - 1);
      // Set to last sentence of previous page
      const prevPageContent = content[currentPage - 1] || "";
      const prevSentences = prevPageContent
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 0);
      setCurrentSentence(prevSentences.length - 1);
    }
  };

  const goToNextSentence = () => {
    if (currentSentence < sentences.length - 1) {
      setCurrentSentence(currentSentence + 1);
    } else if (currentPage < content.length - 1) {
      onPageChange(currentPage + 1);
      setCurrentSentence(0);
    }
  };

  // Pronounce selected text on mouse up (up to 10 words)
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const selectedText = selection.toString().trim();
      if (selectedText.length === 0) return;

      // Cancel any ongoing speech before starting new one
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
      }

      // Split into words and limit to 10
      const words = selectedText.split(/\s+/).slice(0, 10);
      const textToPronounce = words.join(" ");

      pronounceWord(textToPronounce);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (mode === "page") {
          goToNextPage();
        } else {
          goToNextSentence();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (mode === "page") {
          goToPreviousPage();
        } else {
          goToPreviousSentence();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, currentPage, currentSentence, content.length, sentences.length]);

  // Render word with clickable styling
  const renderWord = (word: string, index: number) => {
    const cleanWord = word.replace(/[^a-zA-Z'-]/g, "");
    const isInDict = cleanWord.length > 0 && hasWord(cleanWord);
    const punctuation = word.replace(/[a-zA-Z'-]/g, "");

    return (
      <span key={index}>
        <span
          className={cn(
            "word-clickable",
            isInDict && "bg-primary/10 text-primary",
          )}
        >
          {cleanWord}
        </span>
        {punctuation}{" "}
      </span>
    );
  };

  // Check if a paragraph looks like a heading (short, no ending punctuation, often title case)
  const isHeading = (text: string): boolean => {
    const trimmed = text.trim();
    // Headings are typically short (less than 100 chars) and don't end with sentence punctuation
    if (trimmed.length > 100) return false;
    if (/[.,;]$/.test(trimmed)) return false;
    // Check if it's mostly title case or all caps
    const words = trimmed.split(/\s+/);
    if (words.length <= 6) {
      const capitalizedWords = words.filter(
        (w) => /^[A-Z]/.test(w) || /^\d/.test(w),
      );
      return capitalizedWords.length >= words.length * 0.5;
    }
    return false;
  };

  const renderContent = () => {
    if (mode === "page") {
      const pageContent = content[currentPage] || "";
      // Split content by double newlines to get paragraphs
      const paragraphs = pageContent.split(/\n\n+/).filter((p) => p.trim());

      return (
        <div className="reading-text text-lg space-y-4">
          {paragraphs.map((paragraph, paraIndex) => {
            const heading = isHeading(paragraph);
            const words = paragraph.split(" ");

            return (
              <p
                key={paraIndex}
                className={cn(
                  heading && "text-xl font-semibold text-center mt-6 mb-4",
                )}
              >
                {words.map((word, wordIndex) =>
                  renderWord(word, paraIndex * 10000 + wordIndex),
                )}
              </p>
            );
          })}
        </div>
      );
    }

    // Sentence mode
    const currentSentenceText = sentences[currentSentence] || "";
    const words = currentSentenceText.split(" ");

    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="reading-text text-center text-2xl leading-relaxed">
          {words.map((word, index) => renderWord(word, index))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative flex h-full flex-col"
      onDoubleClick={handleDoubleClick}
    >
      {/* Content area */}
      <div className="flex-1 overflow-auto rounded-xl bg-reading-bg p-8">
        {renderContent()}
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={mode === "page" ? goToPreviousPage : goToPreviousSentence}
          disabled={
            mode === "page"
              ? currentPage === 0
              : currentPage === 0 && currentSentence === 0
          }
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Book className="h-4 w-4" />
          {mode === "page" ? (
            <span>
              Page {currentPage + 1} of {content.length}
            </span>
          ) : (
            <span>
              Sentence {currentSentence + 1}/{sentences.length} • Page{" "}
              {currentPage + 1}/{content.length}
            </span>
          )}
        </div>

        <Button
          variant="outline"
          onClick={mode === "page" ? goToNextPage : goToNextSentence}
          disabled={
            mode === "page"
              ? currentPage === content.length - 1
              : currentPage === content.length - 1 &&
                currentSentence === sentences.length - 1
          }
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <WordContextMenu
          word={contextMenu.word}
          definition={contextMenu.definition}
          position={contextMenu.position}
          isInDictionary={hasWord(contextMenu.word)}
          onAddToDictionary={handleAddToDictionary}
          onPronounce={handlePronounce}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
}
