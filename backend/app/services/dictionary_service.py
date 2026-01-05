import httpx

from app.core.config import settings
from app.schemas.dictionary import (
    WordDefinitionItem,
    WordDefinitionResponse,
    WordPronunciationResponse,
)


class DictionaryService:
    """Service for interacting with external dictionary API"""

    def __init__(self):
        self.api_url = settings.DICTIONARY_API_URL

    async def get_word_definition(self, word: str) -> WordDefinitionResponse:
        """
        Get definition of a word from external dictionary API.

        Args:
            word: Word to look up

        Returns:
            WordDefinitionResponse with definitions

        Raises:
            ValueError: If word not found or API error
        """
        clean_word = word.lower().strip()

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/{clean_word}", timeout=10.0
                )

                if response.status_code == 404:
                    raise ValueError(
                        f"Definition not found for the word '{clean_word}'"
                    )

                response.raise_for_status()
                data = response.json()

                if not data or len(data) == 0:
                    raise ValueError(f"No definitions found for '{clean_word}'")

                # Parse the API response
                word_data = data[0]
                definitions = []
                phonetic = word_data.get("phonetic", None)
                audio_url = None

                # Extract audio URL from phonetics
                if "phonetics" in word_data:
                    for phonetic_entry in word_data["phonetics"]:
                        if "audio" in phonetic_entry and phonetic_entry["audio"]:
                            audio_url = phonetic_entry["audio"]
                            break

                # Extract definitions
                if "meanings" in word_data:
                    for meaning in word_data["meanings"]:
                        part_of_speech = meaning.get("partOfSpeech", "")

                        for definition in meaning.get("definitions", []):
                            definitions.append(
                                WordDefinitionItem(
                                    part_of_speech=part_of_speech,
                                    definition=definition.get("definition", ""),
                                    example=definition.get("example", None),
                                )
                            )

                if not definitions:
                    raise ValueError(f"No definitions found for '{clean_word}'")

                return WordDefinitionResponse(
                    word=clean_word,
                    definitions=definitions,
                    phonetic=phonetic,
                    audio_url=audio_url,
                )

        except httpx.HTTPError as e:
            raise ValueError(f"Failed to fetch definition: {str(e)}")

    async def get_word_pronunciation(
        self, word: str, voice: str = "us"
    ) -> WordPronunciationResponse:
        """
        Get pronunciation audio URL for a word.

        Args:
            word: Word to pronounce
            voice: Voice/accent preference (us, uk, au)

        Returns:
            WordPronunciationResponse with audio URL

        Raises:
            ValueError: If pronunciation not available
        """
        # First get the word definition which includes audio
        definition = await self.get_word_definition(word)

        if not definition.audio_url:
            raise ValueError(f"Pronunciation not available for '{word}'")

        return WordPronunciationResponse(
            word=definition.word,
            audio_url=definition.audio_url,
            phonetic=definition.phonetic,
        )


dictionary_service = DictionaryService()
