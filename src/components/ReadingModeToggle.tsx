import { FileText, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReadingMode } from '@/types/reading';
import { cn } from '@/lib/utils';

interface ReadingModeToggleProps {
  mode: ReadingMode;
  onModeChange: (mode: ReadingMode) => void;
}

export function ReadingModeToggle({ mode, onModeChange }: ReadingModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-border bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('page')}
        className={cn(
          'gap-2 rounded-md px-3 transition-all',
          mode === 'page' 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FileText className="h-4 w-4" />
        Page
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('sentence')}
        className={cn(
          'gap-2 rounded-md px-3 transition-all',
          mode === 'sentence' 
            ? 'bg-background text-foreground shadow-sm' 
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <AlignLeft className="h-4 w-4" />
        Sentence
      </Button>
    </div>
  );
}
