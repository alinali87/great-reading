import { useState, useCallback } from "react";
import {
  Upload,
  BookOpen,
  Clock,
  BookMarked,
  Loader2,
  Trash2,
  Volume2,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BookData, DictionaryWord } from "@/types/reading";
import { pronounceWord } from "@/lib/mockDictionary";

interface MainPageProps {
  onOpenBook: (book: BookData) => void;
  books: BookData[];
  onAddBook: (book: BookData) => void;
  onUploadFile?: (file: File) => Promise<void>;
  onDeleteBook: (bookId: string) => void;
  dictionary: DictionaryWord[];
  onRemoveWord: (id: string) => void;
  timerDuration: number;
  onTimerDurationChange: (minutes: number) => void;
}

export function MainPage({
  onOpenBook,
  books,
  onAddBook,
  onUploadFile,
  onDeleteBook,
  dictionary,
  onRemoveWord,
  timerDuration,
  onTimerDurationChange,
}: MainPageProps) {
  const { user, logout } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBooks, setShowBooks] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);

  const extractTextFromPdf = async (file: File): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sampleContent = [
      `The sun was setting over the quiet village, casting long shadows across the cobblestone streets. Mary stood at her window, watching the last rays of light dance upon the rooftops. She had lived in this house for thirty years, yet each sunset seemed to bring new colors she had never noticed before.

"Time moves differently when you pay attention," her grandmother used to say. Those words echoed in Mary's mind as she observed the orange and purple hues melting into the horizon.

The village had changed little since her childhood. The same bakery stood on the corner, now run by the baker's son. The fountain in the square still bubbled with the same cheerful sound. Yet something had shifted within Mary herself, an understanding that had taken decades to develop.

She turned from the window and picked up the letter that had arrived that morning. The handwriting was unfamiliar, but the return address made her heart skip a beat. After all these years, someone from her past had reached out.`,

      `The letter began simply enough: "Dear Mary, you may not remember me, but I have thought about our conversation every day for the past forty years."

Mary sank into her favorite armchair, the one with the worn velvet that had belonged to her mother. Who could this be? The signature at the bottom read "Thomas," a name that stirred something deep in her memory.

Thomas. Yes, she remembered now. He had been a young man passing through the village one summer, seeking work on the local farms. They had spoken only once, a brief exchange by the well, but apparently those few words had left a lasting impression.

The letter continued: "You told me that every person carries a story worth telling. I was young and foolish then, running from my own story. But your words planted a seed that eventually grew into something beautiful."

Mary found herself smiling. She had forgotten that conversation entirely, yet here was proof that our smallest actions can ripple through time in ways we never anticipate.`,

      `Over the following weeks, Mary and Thomas exchanged several letters. She learned that he had become a teacher, dedicating his life to helping young people discover their own stories. He had traveled the world, collected memories like precious stones, and finally returned to the region of his youth.

"I would very much like to see you again," Thomas wrote in his fourth letter. "Not to recapture the past, but to properly thank you for changing my life with a few simple words."

Mary considered his request carefully. At her age, she had learned that some doors are better left closed, while others deserve one final opening. This felt like the latter.

She wrote back with her address and suggested he visit on a Sunday afternoon. The waiting began, filled with a curious mixture of anticipation and peace. Whatever came of this meeting, she knew it would add another chapter to her own story, one that she had thought was nearly complete.

Life, it seemed, had other plans.`,

      `Sunday arrived with perfect autumn weather. Mary had prepared tea and arranged flowers from her garden on the small table by the window. She wore the blue dress her daughter had given her last birthday, feeling slightly foolish for caring about such things at her age.

The knock came precisely at three o'clock. Opening the door, Mary found herself facing a tall man with silver hair and kind eyes that crinkled at the corners when he smiled. Time had changed his face, but those eyes were the same ones that had looked at her with such intensity forty years ago.

"You were right, you know," Thomas said before she could speak. "Everyone does carry a story worth telling. I just needed someone to help me believe in mine."

Mary stepped aside to let him enter, feeling as though the years were folding in on themselves, connecting past and present in an invisible thread. This was what her grandmother meant about time moving differently when you pay attention.

"Tea?" she asked, and with that simple word, a new conversation began.`,
    ];

    return sampleContent;
  };

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setIsProcessing(true);
    try {
      if (onUploadFile) {
        // Use backend API to upload
        await onUploadFile(file);
      } else {
        // Fallback to local processing (for backward compatibility)
        const content = await extractTextFromPdf(file);
        const newBook: BookData = {
          name: file.name.replace(".pdf", ""),
          content,
          currentPage: 0,
        };
        onAddBook(newBook);
        onOpenBook(newBook);
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const timerOptions = [5, 10, 15];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        {/* Header with logout */}
        <div className="mb-8">
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-center">
            <h1 className="mb-2 font-reading text-4xl font-bold text-foreground">
              ReadFlow
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload a book and start your focused reading session
            </p>
          </div>
        </div>

        {/* Upload area */}
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            isProcessing && "pointer-events-none opacity-70",
          )}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="hidden"
            disabled={isProcessing}
          />

          <div
            className={cn(
              "mb-4 rounded-full p-4 transition-colors",
              isDragging
                ? "bg-primary/10"
                : "bg-muted group-hover:bg-primary/10",
            )}
          >
            {isProcessing ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <Upload
                className={cn(
                  "h-10 w-10 transition-colors",
                  isDragging
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-primary",
                )}
              />
            )}
          </div>

          <p className="mb-2 text-lg font-medium text-foreground">
            {isProcessing ? "Processing your book..." : "Drop your PDF here"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isProcessing ? "This may take a moment" : "or click to browse"}
          </p>
        </label>

        {/* Bottom navigation buttons */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="flex h-20 flex-col items-center justify-center gap-2 rounded-xl"
            onClick={() => setShowBooks(true)}
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Books</span>
            {books.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {books.length}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex h-20 flex-col items-center justify-center gap-2 rounded-xl"
            onClick={() => setShowTimer(true)}
          >
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Timer</span>
            <span className="text-xs text-muted-foreground">
              {timerDuration} min
            </span>
          </Button>
          <Button
            variant="outline"
            className="flex h-20 flex-col items-center justify-center gap-2 rounded-xl"
            onClick={() => setShowDictionary(true)}
          >
            <BookMarked className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium">Dictionary</span>
            {dictionary.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {dictionary.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Books Modal */}
      <Dialog open={showBooks} onOpenChange={setShowBooks}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              My Books
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-80">
            {books.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No books yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload a PDF to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {books.map((book) => (
                  <div
                    key={book.name}
                    className="group flex items-center justify-between rounded-lg p-3 hover:bg-muted"
                  >
                    <button
                      className="flex flex-1 items-center gap-3 text-left"
                      onClick={() => {
                        onOpenBook(book);
                        setShowBooks(false);
                      }}
                    >
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{book.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Page {book.currentPage + 1} of {book.content.length}
                        </p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={() => onDeleteBook(book.id || book.name)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Timer Settings Modal */}
      <Dialog open={showTimer} onOpenChange={setShowTimer}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Timer Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Choose your reading session duration
            </p>
            <div className="flex gap-3">
              {timerOptions.map((mins) => (
                <Button
                  key={mins}
                  variant={timerDuration === mins ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => onTimerDurationChange(mins)}
                >
                  {mins} min
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dictionary Modal */}
      <Dialog open={showDictionary} onOpenChange={setShowDictionary}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              My Dictionary
              {dictionary.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {dictionary.length}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-80">
            {dictionary.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookMarked className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No words yet</p>
                <p className="text-sm text-muted-foreground">
                  Double-click any word while reading to add it
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-1">
                {dictionary.map((word) => (
                  <div
                    key={word.id}
                    className="group rounded-lg border border-border p-3"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="font-reading text-base font-semibold capitalize text-foreground">
                        {word.word}
                      </span>
                      <div className="flex gap-1">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
