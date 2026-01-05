import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.dictionary import DictionaryWord
from app.schemas.dictionary import (
    DictionaryListResponse,
    DictionaryWordCreate,
    DictionaryWordResponse,
    WordExistsResponse,
)

router = APIRouter()

# Temporary user ID for MVP (single user)
TEMP_USER_ID = "default-user"


@router.get("", response_model=DictionaryListResponse)
def get_dictionary(
    sort: str = Query(
        default="addedAt_desc",
        pattern="^(addedAt_desc|addedAt_asc|word_asc|word_desc)$",
    ),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    """Get user's personal dictionary"""

    # Build query
    query = db.query(DictionaryWord).filter(DictionaryWord.user_id == TEMP_USER_ID)

    # Apply sorting
    if sort == "addedAt_desc":
        query = query.order_by(DictionaryWord.added_at.desc())
    elif sort == "addedAt_asc":
        query = query.order_by(DictionaryWord.added_at.asc())
    elif sort == "word_asc":
        query = query.order_by(DictionaryWord.word.asc())
    elif sort == "word_desc":
        query = query.order_by(DictionaryWord.word.desc())

    # Get total count
    total = query.count()

    # Apply pagination
    words = query.offset(offset).limit(limit).all()

    return DictionaryListResponse(words=words, total=total, limit=limit, offset=offset)


@router.post(
    "", response_model=DictionaryWordResponse, status_code=status.HTTP_201_CREATED
)
def add_word_to_dictionary(
    word_data: DictionaryWordCreate, db: Session = Depends(get_db)
):
    """Add a new word to dictionary"""

    clean_word = word_data.word.lower().strip()

    # Check if word already exists
    existing_word = (
        db.query(DictionaryWord)
        .filter(
            DictionaryWord.user_id == TEMP_USER_ID, DictionaryWord.word == clean_word
        )
        .first()
    )

    if existing_word:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Word already exists in your dictionary",
        )

    # Create new dictionary word
    dictionary_word = DictionaryWord(
        id=str(uuid.uuid4()),
        user_id=TEMP_USER_ID,
        word=clean_word,
        definition=word_data.definition,
        context=word_data.context,
    )

    db.add(dictionary_word)
    db.commit()
    db.refresh(dictionary_word)

    return dictionary_word


@router.delete("/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_word_from_dictionary(word_id: str, db: Session = Depends(get_db)):
    """Remove a word from dictionary"""

    word = (
        db.query(DictionaryWord)
        .filter(DictionaryWord.id == word_id, DictionaryWord.user_id == TEMP_USER_ID)
        .first()
    )

    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Word not found in dictionary"
        )

    db.delete(word)
    db.commit()

    return None


@router.get("/check/{word}", response_model=WordExistsResponse)
def check_word_in_dictionary(word: str, db: Session = Depends(get_db)):
    """Check if a word exists in the dictionary"""

    clean_word = word.lower().strip()

    exists = (
        db.query(DictionaryWord)
        .filter(
            DictionaryWord.user_id == TEMP_USER_ID, DictionaryWord.word == clean_word
        )
        .first()
        is not None
    )

    return WordExistsResponse(exists=exists, word=clean_word)
