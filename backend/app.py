from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import uvicorn
import os # Import os for environment variables
from dotenv import load_dotenv # Import load_dotenv
import pymysql
from contextlib import asynccontextmanager

load_dotenv() # Load environment variables from .env file

@asynccontextmanager
async def lifespan(app: FastAPI):
    # START-UP – open connection (or a pool)
    app.state.db = pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "bookmark_user"),
        password=os.getenv("DB_PASSWORD", "secret"),
        database=os.getenv("DB_NAME", "bookmarks_db"),
        cursorclass=pymysql.cursors.DictCursor,
    )
    print("Connected to DB")
    try:
        yield               # ‼️ FastAPI starts serving requests here
    finally:
        # SHUT-DOWN – close connection
        app.state.db.close()
        print("Shutting down DB")

# ────────────────────────────── APP SETUP ────────────────────────────────
app = FastAPI(
    title="Bookmark API",
    description="API for receiving and processing browser bookmarks.",
    version="1.0.0",
    lifespan=lifespan,     # ← pass the handler
)

# Dependency to get the connection
def get_db():
    return app.state.db

# CORS Configuration
CHROME_EXTENSION_ID_FROM_ENV = os.getenv("CHROME_EXTENSION_ORIGIN")

origins = [CHROME_EXTENSION_ID_FROM_ENV]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of origins that are allowed to make requests
    allow_credentials=True, # Allow cookies to be included in requests
    allow_methods=["*"],    # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],    # Allow all headers
)

# Define a Pydantic model for a single bookmark item
class BookmarkItem(BaseModel):
    id: str
    title: str
    url: Optional[str] = None
    parentId: Optional[str] = None
    index: Optional[int] = None
    dateAdded: Optional[float] = None
    dateGroupModified: Optional[float] = None
    class Config:
        extra = 'allow'


@app.post("/api/bookmarks", summary="Receive and process bookmarks", tags=["Bookmarks"])
async def receive_bookmarks_endpoint(bookmarks_payload: List[BookmarkItem]):
    """
    Receives a list of bookmark items from the Chrome extension.
    - **bookmarks_payload**: A list of bookmark objects.
    """
    try:
        print("Received bookmarks (FastAPI):")
        # Convert Pydantic models to dicts for pretty printing or further processing
        bookmarks_data = [item.model_dump(exclude_none=True) for item in bookmarks_payload]
        print(json.dumps(bookmarks_data, indent=4))
        
        # Here you would typically process and store the bookmarks
        # For example, save to a database, etc.
        
        return {"message": "Bookmarks received successfully by FastAPI!", "count": len(bookmarks_data)}
    except Exception as e:
        print(f"Error processing bookmarks: {e}")
        # This catch is for other unexpected errors during your processing logic.
        raise HTTPException(status_code=500, detail=f"Error processing bookmarks: {str(e)}")

@app.get("/", summary="Root endpoint for API status", tags=["General"])
async def read_root():
    """
    Provides a simple status message for the API.
    """
    return {"message": "Bookmark API is running with FastAPI!"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000, log_level="info")
