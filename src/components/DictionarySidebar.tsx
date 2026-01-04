import { Book, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DictionaryWord } from '@/types/reading';
import { pronounceWord } from '@/lib/mockDictionary';
import { cn } from '@/lib/utils';

interface DictionarySidebarProps {
  words: DictionaryWord[];
  onRemoveWord: (id: string) => void;
  isOpen: boolean;
}

export function DictionarySidebar({ words, onRemoveWord, isOpen }: DictionarySidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="w-80 border-l border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Book className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-sidebar-foreground">My Dictionary</h2>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {words.length}
        </span>
      </div>

      {/* Word list */}
      <ScrollArea className="h-[calc(100vh-57px)]">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Book className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mb-1 font-medium text-foreground">No words yet</p>
            <p className="text-sm text-muted-foreground">
              Double-click any word while reading to add it to your dictionary
            </p>
          </div>
        ) : (
          <div className="p-2">
            {words.map((word, index) => (
              <div
                key={word.id}
                className={cn(
                  'group rounded-lg p-3 transition-colors hover:bg-sidebar-accent',
                  'animate-fade-in'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <span className="font-reading text-base font-semibold capitalize text-foreground">
                    {word.word}
                  </span>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => pronounceWord(word.word)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => onRemoveWord(word.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {word.definition}
                </p>
                {word.context && (
                  <p className="mt-2 border-l-2 border-primary/30 pl-2 text-xs italic text-muted-foreground">
                    "{word.context}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
