"""Sample book service - provides a welcome book for all users"""

from datetime import datetime

# Constant ID for the sample book - same for all users
SAMPLE_BOOK_ID = "sample-welcome-book"

# Sample book content - a short story for new users
SAMPLE_BOOK_NAME = "Welcome to GreatReading"
SAMPLE_BOOK_CONTENT = [
    """Welcome to GreatReading!

This is your personal reading companion designed to help you improve your English reading skills. Here's how to get the most out of this app.

GreatReading is built around the idea of focused reading sessions. Instead of reading for hours without direction, you'll read in timed intervals that help maintain concentration and retention.

Double-click on any word to see its definition and add it to your personal dictionary. This way, you build vocabulary as you read.""",
    """Getting Started with Reading

To begin, upload a PDF book using the upload area on the main page. Your books are private and only visible to you.

Once uploaded, click on a book to start reading. You can navigate between pages using the Previous and Next buttons, or use keyboard arrows.

The timer feature helps you stay focused. Choose 5, 10, or 15 minute sessions. When the timer ends, you'll get a gentle reminder to take a break.""",
    """Building Your Vocabulary

One of the most powerful features is the personal dictionary. When you encounter an unfamiliar word, double-click on it.

A popup will appear showing the word's definition. Click "Add to Dictionary" to save it for later review.

You can access your saved words anytime from the Dictionary button on the main page. Regular review of these words will help cement them in your memory.""",
    """Tips for Effective Reading

Read actively, not passively. Ask yourself questions about what you're reading. What is the main idea? What might happen next?

Don't stop at every unknown word. Try to understand meaning from context first. Only look up words that are essential to understanding.

Take notes mentally or in a separate notebook. Summarizing what you've read helps with comprehension and retention.

Happy reading! Upload your first book and start your learning journey.""",
]


def get_sample_book_data() -> dict:
    """
    Get the sample book data as a dictionary.
    This is loaded from code, not from the database, so it's always up to date.

    Returns:
        Dictionary with sample book data matching BookResponse schema
    """
    now = datetime.utcnow()
    return {
        "id": SAMPLE_BOOK_ID,
        "name": SAMPLE_BOOK_NAME,
        "content": SAMPLE_BOOK_CONTENT,
        "current_page": 0,
        "total_pages": len(SAMPLE_BOOK_CONTENT),
        "file_size": len("".join(SAMPLE_BOOK_CONTENT)),
        "created_at": now,
        "updated_at": now,
    }


def is_sample_book(book_id: str) -> bool:
    """Check if the given book_id is the sample book"""
    return book_id == SAMPLE_BOOK_ID
