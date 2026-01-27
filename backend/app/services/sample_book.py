"""Sample book service - provides a welcome book for all users"""

from datetime import datetime

# Constant ID for the sample book - same for all users
SAMPLE_BOOK_ID = "sample-welcome-book"

# Sample book content - a short story for new users
SAMPLE_BOOK_NAME = "Welcome to GreatReading"
SAMPLE_BOOK_CONTENT = [
    """Welcome to GreatReading!

GreatReading is your personal reading companion, designed to help you read great books.

Sometimes great books are hard to read. Shakespeare's language can be difficult even for native speakers. A book on quantum mechanics can feel dense and abstract - even for very smart physicists.

But this extra effort shouldn't discourage us. Reading the right books matters, even when it's tough.

At the same time, life is busy and full of distractions. It's hard to find time to sit down and read seriously.

GreatReading helps you build a habit of reading books that truly matter. You can start small - just 5 minutes a day. Start the timer and spend a few focused minutes with your book.

Don't force yourself. Stay curious, like a child. Absorb the words and sentences. Pause and think for as long as it feels right.

If a book feels especially dense, switch to Sentence Mode and read one sentence at a time. There's no rush.

When you finish a session - congratulations! You've taken one step closer to becoming a great reader. You can start another timer or simply keep reading.

Anyone can start small and become a great reader. Great readers understand great ideas. And great ideas can change the world.

How to Get Started with GreatReading

To begin, upload a PDF using the upload area on the main page. Your books are private and visible only to you.

Once uploaded, click on a book to start reading. You can move between pages using the Previous and Next buttons or the arrow keys on your keyboard.

The timer helps you stay focused. Choose a 5, 10, or 15 minute session. When time is up, you'll receive a gentle reminder.

Highlight any word to hear its pronunciation and add it to your personal dictionary. This helps you build vocabulary as you read.

You can review your saved words anytime using the Dictionary button on the main page.

Happy reading! Upload your first book and begin your reading journey.""",
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
