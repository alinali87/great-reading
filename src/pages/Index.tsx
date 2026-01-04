import { useState } from 'react';
import { PdfUploader } from '@/components/PdfUploader';
import { ReadingApp } from '@/components/ReadingApp';
import { BookData } from '@/types/reading';

const Index = () => {
  const [book, setBook] = useState<BookData | null>(null);

  const handleUpload = (file: File, content: string[]) => {
    setBook({
      name: file.name.replace('.pdf', ''),
      content,
      currentPage: 0,
    });
  };

  const handleClose = () => {
    setBook(null);
  };

  if (book) {
    return <ReadingApp book={book} onClose={handleClose} />;
  }

  return <PdfUploader onUpload={handleUpload} />;
};

export default Index;
