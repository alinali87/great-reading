import { useState } from 'react';
import { Book, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MinimalTimer } from './MinimalTimer';
import { ReadingModeToggle } from './ReadingModeToggle';
import { ReadingView } from './ReadingView';
import { useTimer } from '@/hooks/useTimer';
import { ReadingMode, BookData } from '@/types/reading';
import { toast } from '@/hooks/use-toast';

interface ReadingAppProps {
  book: BookData;
  onClose: () => void;
  timerDuration: number;
  hasWord: (word: string) => boolean;
  onAddWord: (word: string, definition: string, context?: string) => boolean;
}

export function ReadingApp({ book, onClose, timerDuration, hasWord, onAddWord }: ReadingAppProps) {
  const [mode, setMode] = useState<ReadingMode>('page');
  const [currentPage, setCurrentPage] = useState(book.currentPage || 0);

  const timer = useTimer({
    initialMinutes: timerDuration,
    onComplete: () => {
      toast({
        title: "Time's up!",
        description: "Great reading session! Take a break or continue.",
      });
    },
  });

  const handleAddWord = (word: string, definition: string, context?: string) => {
    const added = onAddWord(word, definition, context);
    if (added) {
      toast({
        title: "Word added!",
        description: `"${word}" has been added to your dictionary.`,
      });
    }
    return added;
  };

  return (
    <div className="flex h-screen flex-col">
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
          <MinimalTimer
            isRunning={timer.isRunning}
            progress={timer.progress}
            onToggle={timer.toggle}
            onReset={timer.reset}
          />
        </div>
      </header>

      {/* Reading area - full width without sidebar */}
      <main className="flex-1 overflow-hidden p-6">
        <ReadingView
          content={book.content}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          mode={mode}
          hasWord={hasWord}
          onAddWord={handleAddWord}
        />
      </main>
    </div>
  );
}
