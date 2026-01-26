import io
import re

from pypdf import PdfReader

# Ligature mapping - PDF ligatures to normal characters
LIGATURES = {
    "ﬁ": "fi",
    "ﬂ": "fl",
    "ﬀ": "ff",
    "ﬃ": "ffi",
    "ﬄ": "ffl",
    "ﬅ": "st",
    "ﬆ": "st",
}


class PDFService:
    """Service for processing PDF files"""

    @staticmethod
    def _remove_headers_footers(text: str) -> str:
        """
        Remove common header/footer patterns from PDF text.
        These typically include:
        - Page numbers (standalone or with text)
        - Copyright notices
        - Document titles repeated on each page
        - Author names with version numbers
        """
        lines = text.split("\n")
        cleaned_lines = []

        for line in lines:
            stripped = line.strip()

            # Skip empty lines (will be handled later)
            if not stripped:
                cleaned_lines.append(line)
                continue

            # Skip lines that are just page numbers
            if re.match(r"^\d+$", stripped):
                continue

            # Skip common footer patterns like "Author Name Version X.X N"
            # e.g., "Ulrich Drepper Version 1.0 7"
            if re.match(r"^[A-Z][a-z]+ [A-Z][a-z]+ Version \d+\.\d+ \d+$", stripped):
                continue

            # Skip common footer patterns like "N Version X.X Title..."
            # e.g., "10 Version 1.0 What Every Programmer Should Know About Memory"
            if re.match(r"^\d+ Version \d+\.\d+ .+$", stripped):
                continue

            # Skip copyright lines
            if re.match(r"^[©Cc]opyright", stripped, re.IGNORECASE):
                continue
            if "All rights reserved" in stripped:
                continue

            # Skip lines that look like "Page X of Y" or "Page X"
            if re.match(r"^[Pp]age \d+( of \d+)?$", stripped):
                continue

            # Skip common document metadata patterns
            if re.match(
                r"^(Version|Rev|Revision) \d+(\.\d+)*$", stripped, re.IGNORECASE
            ):
                continue

            # Skip lines that are just dates
            if re.match(
                r"^(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$",
                stripped,
            ):
                continue

            cleaned_lines.append(line)

        return "\n".join(cleaned_lines)

    @staticmethod
    def _normalize_text(text: str) -> str:
        """
        Normalize extracted PDF text:
        - Replace ligatures with normal characters
        - Clean up line breaks
        - Create readable paragraphs
        """
        # Replace ligatures
        for ligature, replacement in LIGATURES.items():
            text = text.replace(ligature, replacement)

        # Normalize different types of whitespace
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # Handle hyphenated words at line breaks (e.g., "com-\nputer" -> "computer")
        text = re.sub(r"-\n(\S)", r"\1", text)

        # Replace all newlines with spaces (PDF line breaks are usually just layout)
        text = re.sub(r"\n+", " ", text)

        # Collapse multiple spaces
        text = re.sub(r"  +", " ", text)

        text = text.strip()

        # Now create paragraphs by splitting on sentence boundaries
        # Split into sentences (keeping the punctuation)
        sentences = re.split(r"(?<=[.!?])\s+", text)

        # Group sentences into paragraphs (roughly 3-5 sentences each)
        paragraphs = []
        current_para = []
        sentence_count = 0

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            current_para.append(sentence)
            sentence_count += 1

            # Start new paragraph after ~4 sentences
            if sentence_count >= 4:
                paragraphs.append(" ".join(current_para))
                current_para = []
                sentence_count = 0

        # Don't forget the last paragraph
        if current_para:
            paragraphs.append(" ".join(current_para))

        return "\n\n".join(paragraphs)

    @staticmethod
    def extract_text_from_pdf(file_content: bytes) -> list[str]:
        """
        Extract text content from PDF file.
        Returns a list of strings where each string is a page.

        Args:
            file_content: PDF file content as bytes

        Returns:
            List of page contents as strings

        Raises:
            ValueError: If PDF is invalid or cannot be processed
        """
        try:
            pdf_file = io.BytesIO(file_content)
            reader = PdfReader(pdf_file)

            if len(reader.pages) == 0:
                raise ValueError("PDF file has no pages")

            pages = []
            empty_page_count = 0
            for page_num, page in enumerate(reader.pages, 1):
                text = page.extract_text()
                if text and text.strip():
                    # First remove headers/footers, then normalize
                    cleaned_text = PDFService._remove_headers_footers(text)
                    normalized_text = PDFService._normalize_text(cleaned_text)
                    pages.append(normalized_text)
                else:
                    # Include placeholder for pages with no extractable text
                    # This preserves page numbers and indicates the issue to users
                    pages.append(
                        f"[Page {page_num}: No extractable text. "
                        "This page may contain images or scanned content.]"
                    )
                    empty_page_count += 1

            # If ALL pages are empty, the PDF likely needs OCR
            if empty_page_count == len(pages):
                raise ValueError(
                    "PDF file contains no extractable text. "
                    "This may be a scanned document that requires OCR processing."
                )

            return pages

        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Failed to process PDF: {str(e)}")

    @staticmethod
    def validate_pdf(file_content: bytes) -> bool:
        """
        Validate if the file is a valid PDF.

        Args:
            file_content: File content as bytes

        Returns:
            True if valid PDF, False otherwise
        """
        try:
            pdf_file = io.BytesIO(file_content)
            reader = PdfReader(pdf_file)
            # Try to access the first page to ensure it's readable
            if len(reader.pages) > 0:
                _ = reader.pages[0]
            return True
        except Exception:
            return False


pdf_service = PDFService()
