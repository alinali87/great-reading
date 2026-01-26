import { useState, useCallback } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PdfUploaderProps {
  onUpload: (file: File, content: string[]) => void;
}

export function PdfUploader({ onUpload }: PdfUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromPdf = async (file: File): Promise<string[]> => {
    // Mock PDF extraction - in production, use pdf.js or a backend service
    // For now, return sample content for demonstration
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sampleContent = [
      // Page 1
      `The sun was setting over the quiet village, casting long shadows across the cobblestone streets. Mary stood at her window, watching the last rays of light dance upon the rooftops. She had lived in this house for thirty years, yet each sunset seemed to bring new colors she had never noticed before.

"Time moves differently when you pay attention," her grandmother used to say. Those words echoed in Mary's mind as she observed the orange and purple hues melting into the horizon.

The village had changed little since her childhood. The same bakery stood on the corner, now run by the baker's son. The fountain in the square still bubbled with the same cheerful sound. Yet something had shifted within Mary herself, an understanding that had taken decades to develop.

She turned from the window and picked up the letter that had arrived that morning. The handwriting was unfamiliar, but the return address made her heart skip a beat. After all these years, someone from her past had reached out.`,

      // Page 2
      `The letter began simply enough: "Dear Mary, you may not remember me, but I have thought about our conversation every day for the past forty years."

Mary sank into her favorite armchair, the one with the worn velvet that had belonged to her mother. Who could this be? The signature at the bottom read "Thomas," a name that stirred something deep in her memory.

Thomas. Yes, she remembered now. He had been a young man passing through the village one summer, seeking work on the local farms. They had spoken only once, a brief exchange by the well, but apparently those few words had left a lasting impression.

The letter continued: "You told me that every person carries a story worth telling. I was young and foolish then, running from my own story. But your words planted a seed that eventually grew into something beautiful."

Mary found herself smiling. She had forgotten that conversation entirely, yet here was proof that our smallest actions can ripple through time in ways we never anticipate.`,

      // Page 3
      `Over the following weeks, Mary and Thomas exchanged several letters. She learned that he had become a teacher, dedicating his life to helping young people discover their own stories. He had traveled the world, collected memories like precious stones, and finally returned to the region of his youth.

"I would very much like to see you again," Thomas wrote in his fourth letter. "Not to recapture the past, but to properly thank you for changing my life with a few simple words."

Mary considered his request carefully. At her age, she had learned that some doors are better left closed, while others deserve one final opening. This felt like the latter.

She wrote back with her address and suggested he visit on a Sunday afternoon. The waiting began, filled with a curious mixture of anticipation and peace. Whatever came of this meeting, she knew it would add another chapter to her own story, one that she had thought was nearly complete.

Life, it seemed, had other plans.`,

      // Page 4
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
      const content = await extractTextFromPdf(file);
      onUpload(file, content);
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-reading text-4xl font-bold text-foreground">
            GreatReading
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload a book and start your focused reading session
          </p>
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

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-card p-4">
            <div className="mb-2 flex justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Page Mode</p>
            <p className="text-xs text-muted-foreground">Read full pages</p>
          </div>
          <div className="rounded-lg bg-card p-4">
            <div className="mb-2 flex justify-center">
              <span className="text-xl">⏱️</span>
            </div>
            <p className="text-sm font-medium text-foreground">5 Min Timer</p>
            <p className="text-xs text-muted-foreground">Focused sessions</p>
          </div>
          <div className="rounded-lg bg-card p-4">
            <div className="mb-2 flex justify-center">
              <span className="text-xl">📚</span>
            </div>
            <p className="text-sm font-medium text-foreground">Dictionary</p>
            <p className="text-xs text-muted-foreground">Save new words</p>
          </div>
        </div>
      </div>
    </div>
  );
}
