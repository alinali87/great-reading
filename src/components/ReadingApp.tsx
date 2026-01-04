import { useState } from 'react';
import { Book, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timer } from './Timer';
import { ReadingModeToggle } from './ReadingModeToggle';
import { ReadingView } from './ReadingView';
import { DictionarySidebar } from './DictionarySidebar';
import { useTimer } from '@/hooks/useTimer';
import { useDictionary } from '@/hooks/useDictionary';
import { ReadingMode, BookData } from '@/types/reading';
import { toast } from '@/hooks/use-toast';

interface ReadingAppProps {
  book: BookData;
  onClose: () => void;
}

export function ReadingApp({ book, onClose }: ReadingAppProps) {
  const [mode, setMode] = useState<ReadingMode>('page');
  const [currentPage, setCurrentPage] = useState(0);
  const [showDictionary, setShowDictionary] = useState(true);

  const timer = useTimer({
    initialMinutes: 5,
    onComplete: () => {
      toast({
        title: "Time's up!",
        description: "Great reading session! Take a break or continue.",
      });
    },
  });

  const dictionary = useDictionary();

  const handleAddWord = (word: string, definition: string, context?: string) => {
    const added = dictionary.addWord(word, definition, context);
    if (added) {
      toast({
        title: "Word added!",
        description: `"${word}" has been added to your dictionary.`,
      });
    }
    return added;
  };

  return (
    <div className="flex h-screen">
      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              <h1 className="font-medium text-foreground">{book.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ReadingModeToggle mode={mode} onModeChange={setMode} />
            <Timer
              minutes={timer.minutes}
              seconds={timer.seconds}
              isRunning={timer.isRunning}
              timerState={timer.timerState}
              progress={timer.progress}
              onToggle={timer.toggle}
              onReset={timer.reset}
            />
            <Button
              variant={showDictionary ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowDictionary(!showDictionary)}
              className="gap-2"
            >
              <Book className="h-4 w-4" />
              Dictionary
              {dictionary.wordCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                  {dictionary.wordCount}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Reading area */}
        <main className="flex-1 overflow-hidden p-6">
          <ReadingView
            content={book.content}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            mode={mode}
            hasWord={dictionary.hasWord}
            onAddWord={handleAddWord}
          />
        </main>
      </div>

      {/* Dictionary sidebar */}
      <DictionarySidebar
        words={dictionary.words}
        onRemoveWord={dictionary.removeWord}
        isOpen={showDictionary}
      />
    </div>
  );
}
