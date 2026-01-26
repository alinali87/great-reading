from fastapi import APIRouter

from app.api.v1 import auth, books, definitions, dictionary, settings

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(books.router, prefix="/books", tags=["books"])
api_router.include_router(dictionary.router, prefix="/dictionary", tags=["dictionary"])
api_router.include_router(
    definitions.router, prefix="/definitions", tags=["definitions"]
)
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
