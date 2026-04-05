from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

app = FastAPI(title="Agora API", description="Intellectual discussion spaces")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory store (swap with SQLAlchemy + Postgres later) ──────────────────
rooms_db: dict = {}
posts_db: dict = {}

# ── Schemas ───────────────────────────────────────────────────────────────────

class RoomCreate(BaseModel):
    name: str
    description: str
    tag: str  # e.g. "philosophy", "science", "history"

class RoomOut(BaseModel):
    id: str
    name: str
    description: str
    tag: str
    created_at: str
    post_count: int

class PostCreate(BaseModel):
    room_id: str
    author: str          # display name, no auth yet
    content: str
    parent_id: Optional[str] = None   # None = top-level post, else a reply

class PostOut(BaseModel):
    id: str
    room_id: str
    author: str
    content: str
    parent_id: Optional[str]
    created_at: str
    reply_count: int

# ── Rooms ─────────────────────────────────────────────────────────────────────

@app.get("/rooms", response_model=List[RoomOut])
def list_rooms():
    result = []
    for r in rooms_db.values():
        post_count = sum(1 for p in posts_db.values() if p["room_id"] == r["id"])
        result.append({**r, "post_count": post_count})
    return sorted(result, key=lambda x: x["created_at"], reverse=True)


@app.post("/rooms", response_model=RoomOut, status_code=201)
def create_room(body: RoomCreate):
    room_id = str(uuid.uuid4())
    room = {
        "id": room_id,
        "name": body.name,
        "description": body.description,
        "tag": body.tag,
        "created_at": datetime.utcnow().isoformat(),
    }
    rooms_db[room_id] = room
    return {**room, "post_count": 0}


@app.get("/rooms/{room_id}", response_model=RoomOut)
def get_room(room_id: str):
    room = rooms_db.get(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    post_count = sum(1 for p in posts_db.values() if p["room_id"] == room_id)
    return {**room, "post_count": post_count}


@app.delete("/rooms/{room_id}", status_code=204)
def delete_room(room_id: str):
    if room_id not in rooms_db:
        raise HTTPException(status_code=404, detail="Room not found")
    del rooms_db[room_id]
    # Cascade delete posts
    to_delete = [pid for pid, p in posts_db.items() if p["room_id"] == room_id]
    for pid in to_delete:
        del posts_db[pid]

# ── Posts (threads + replies) ─────────────────────────────────────────────────

@app.get("/rooms/{room_id}/posts", response_model=List[PostOut])
def list_posts(room_id: str, parent_id: Optional[str] = None):
    """
    parent_id=None  → returns top-level threads for this room
    parent_id=<id>  → returns replies to that post
    """
    if room_id not in rooms_db:
        raise HTTPException(status_code=404, detail="Room not found")

    result = []
    for p in posts_db.values():
        if p["room_id"] != room_id:
            continue
        if parent_id is None and p["parent_id"] is not None:
            continue
        if parent_id is not None and p["parent_id"] != parent_id:
            continue
        reply_count = sum(1 for r in posts_db.values() if r["parent_id"] == p["id"])
        result.append({**p, "reply_count": reply_count})

    return sorted(result, key=lambda x: x["created_at"], reverse=False)


@app.post("/posts", response_model=PostOut, status_code=201)
def create_post(body: PostCreate):
    if body.room_id not in rooms_db:
        raise HTTPException(status_code=404, detail="Room not found")
    if body.parent_id and body.parent_id not in posts_db:
        raise HTTPException(status_code=404, detail="Parent post not found")

    post_id = str(uuid.uuid4())
    post = {
        "id": post_id,
        "room_id": body.room_id,
        "author": body.author,
        "content": body.content,
        "parent_id": body.parent_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    posts_db[post_id] = post
    return {**post, "reply_count": 0}


@app.get("/posts/{post_id}", response_model=PostOut)
def get_post(post_id: str):
    post = posts_db.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    reply_count = sum(1 for r in posts_db.values() if r["parent_id"] == post_id)
    return {**post, "reply_count": reply_count}


@app.delete("/posts/{post_id}", status_code=204)
def delete_post(post_id: str):
    if post_id not in posts_db:
        raise HTTPException(status_code=404, detail="Post not found")
    del posts_db[post_id]
    # Cascade delete replies
    to_delete = [pid for pid, p in posts_db.items() if p["parent_id"] == post_id]
    for pid in to_delete:
        del posts_db[pid]


# ── Seed data (dev only) ──────────────────────────────────────────────────────

@app.post("/dev/seed", status_code=201)
def seed():
    """Populate with sample rooms and posts for local dev."""
    sample_rooms = [
        ("The Nature of Consciousness", "Does subjective experience reduce to physics, or is there something more?", "philosophy"),
        ("History of Science", "How did humanity learn to reliably understand the natural world?", "history"),
        ("Language & Meaning", "How do words carry meaning, and can they ever fully capture thought?", "linguistics"),
    ]
    for name, desc, tag in sample_rooms:
        room_id = str(uuid.uuid4())
        rooms_db[room_id] = {
            "id": room_id, "name": name, "description": desc,
            "tag": tag, "created_at": datetime.utcnow().isoformat()
        }
        post_id = str(uuid.uuid4())
        posts_db[post_id] = {
            "id": post_id, "room_id": room_id,
            "author": "Seedbot", "content": f"Opening thread for: {name}",
            "parent_id": None, "created_at": datetime.utcnow().isoformat()
        }
    return {"seeded": len(sample_rooms)}
