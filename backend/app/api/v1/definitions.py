from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.dictionary import WordDefinitionResponse, WordPronunciationResponse
from app.services.dictionary_service import dictionary_service

router = APIRouter()


@router.get("/{word}", response_model=WordDefinitionResponse)
async def get_word_definition(word: str):
    """Get definition of a word from external dictionary API"""

    try:
        definition = await dictionary_service.get_word_definition(word)
        return definition
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{word}/pronounce", response_model=WordPronunciationResponse)
async def get_word_pronunciation(
    word: str, voice: str = Query(default="us", pattern="^(us|uk|au)$")
):
    """Get pronunciation audio URL for a word"""

    try:
        pronunciation = await dictionary_service.get_word_pronunciation(word, voice)
        return pronunciation
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
