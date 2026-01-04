import { useEffect, useRef } from 'react';
import { BookOpen, Volume2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WordContextMenuProps {
  word: string;
  definition: string;
  position: { x: number; y: number };
  isInDictionary: boolean;
  onAddToDictionary: () => void;
  onPronounce: () => void;
  onClose: () => void;
}

export function WordContextMenu({
  word,
  definition,
  position,
  isInDictionary,
  onAddToDictionary,
  onPronounce,
  onClose,
}: WordContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Calculate position to keep menu in viewport
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y + 10, window.innerHeight - 200),
    zIndex: 50,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="w-72 animate-scale-in rounded-lg border border-border bg-popover p-4 shadow-lg"
    >
      {/* Word header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-reading text-lg font-semibold capitalize text-foreground">
            {word}
          </span>
        </div>
        {isInDictionary && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            <Check className="h-3 w-3" />
            Saved
          </span>
        )}
      </div>

      {/* Definition */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {definition}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPronounce}
          className="flex-1 gap-2"
        >
          <Volume2 className="h-4 w-4" />
          Pronounce
        </Button>
        <Button
          variant={isInDictionary ? 'secondary' : 'default'}
          size="sm"
          onClick={onAddToDictionary}
          disabled={isInDictionary}
          className={cn('flex-1 gap-2', isInDictionary && 'opacity-50')}
        >
          {isInDictionary ? (
            <>
              <Check className="h-4 w-4" />
              Added
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
