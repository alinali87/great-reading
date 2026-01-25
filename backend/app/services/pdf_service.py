import io

from pypdf import PdfReader


class PDFService:
    """Service for processing PDF files"""

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
                    pages.append(text.strip())
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
