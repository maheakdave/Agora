import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8000";

const TAG_COLORS = {
  philosophy: { bg: "#1a1a2e", text: "#a78bfa" },
  history:    { bg: "#1a2e1a", text: "#6ee7b7" },
  science:    { bg: "#2e1a1a", text: "#fca5a5" },
  linguistics:{ bg: "#1a2a2e", text: "#7dd3fc" },
  economics:  { bg: "#2e2a1a", text: "#fcd34d" },
  default:    { bg: "#222",   text: "#d4d4d4"  },
};

const tag = (name) => TAG_COLORS[name] || TAG_COLORS.default;

const fmt = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');`;

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#0d0d0d",
    minHeight: "100vh",
    color: "#e8e0d0",
  },
  header: {
    borderBottom: "1px solid #2a2a2a",
    padding: "0 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    position: "sticky",
    top: 0,
    background: "#0d0d0d",
    zIndex: 10,
  },
  logo: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: "0.04em",
    color: "#e8e0d0",
    cursor: "pointer",
    margin: 0,
  },
  main: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "2.5rem 1.5rem",
  },
  pageTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 38,
    fontWeight: 500,
    color: "#e8e0d0",
    margin: "0 0 0.25rem",
    lineHeight: 1.1,
    fontStyle: "italic",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: "2.5rem",
  },
  card: {
    background: "#161616",
    border: "1px solid #242424",
    borderRadius: 10,
    padding: "1.25rem 1.5rem",
    marginBottom: "1rem",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
  },
  cardHover: {
    background: "#1b1b1b",
    border: "1px solid #3a3a3a",
  },
  roomName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    fontWeight: 600,
    color: "#e8e0d0",
    margin: "0 0 4px",
    lineHeight: 1.3,
  },
  roomDesc: {
    fontSize: 13.5,
    color: "#888",
    margin: "0 0 12px",
    lineHeight: 1.6,
  },
  tagBadge: (name) => ({
    display: "inline-block",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "3px 8px",
    borderRadius: 4,
    background: tag(name).bg,
    color: tag(name).text,
    border: `1px solid ${tag(name).text}33`,
    marginRight: 8,
  }),
  meta: {
    fontSize: 12,
    color: "#555",
  },
  btn: {
    background: "transparent",
    border: "1px solid #3a3a3a",
    borderRadius: 7,
    color: "#aaa",
    fontSize: 13,
    padding: "7px 14px",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnPrimary: {
    background: "#e8e0d0",
    border: "1px solid #e8e0d0",
    borderRadius: 7,
    color: "#0d0d0d",
    fontSize: 13,
    fontWeight: 500,
    padding: "7px 16px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #1e1e1e",
    margin: "2rem 0",
  },
  postCard: {
    borderLeft: "2px solid #2a2a2a",
    paddingLeft: "1rem",
    marginBottom: "1.5rem",
  },
  postAuthor: {
    fontWeight: 500,
    fontSize: 13,
    color: "#c9a84c",
    marginRight: 8,
  },
  postDate: {
    fontSize: 12,
    color: "#555",
  },
  postContent: {
    fontSize: 15,
    lineHeight: 1.75,
    color: "#d4cfc6",
    margin: "6px 0 10px",
  },
  replyCard: {
    borderLeft: "2px solid #1e1e1e",
    paddingLeft: "1rem",
    marginBottom: "1rem",
    marginLeft: "1.5rem",
  },
  form: {
    background: "#161616",
    border: "1px solid #242424",
    borderRadius: 10,
    padding: "1.25rem",
  },
  input: {
    width: "100%",
    background: "#0d0d0d",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    color: "#e8e0d0",
    fontSize: 14,
    padding: "8px 12px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    background: "#0d0d0d",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    color: "#e8e0d0",
    fontSize: 14,
    padding: "8px 12px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    resize: "vertical",
    minHeight: 90,
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  field: { marginBottom: "1rem" },
  error: {
    background: "#2a0d0d",
    border: "1px solid #5c1a1a",
    borderRadius: 8,
    padding: "0.75rem 1rem",
    color: "#f87171",
    fontSize: 13,
    marginBottom: "1rem",
  },
  breadcrumb: {
    fontSize: 13,
    color: "#555",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  crumbLink: { color: "#888", cursor: "pointer", textDecoration: "none" },
};

// ── API helpers ───────────────────────────────────────────────────────────────
const api = {
  get: (path) => fetch(`${API}${path}`).then((r) => r.json()),
  post: (path, body) =>
    fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  del: (path) => fetch(`${API}${path}`, { method: "DELETE" }),
};

// ── Hoverable card ────────────────────────────────────────────────────────────
function Card({ children, onClick, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...styles.card, ...(hovered ? styles.cardHover : {}), ...style }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

// ── Home view: list rooms ─────────────────────────────────────────────────────
function HomeView({ onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", tag: "philosophy" });

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/rooms")
      .then(setRooms)
      .catch(() => setError("Cannot reach backend. Is it running on localhost:8000?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.name.trim()) return;
    await api.post("/rooms", form);
    setForm({ name: "", description: "", tag: "philosophy" });
    setShowForm(false);
    load();
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={styles.pageTitle}>Agora</h1>
          <p style={styles.subtitle}>Structured spaces for intellectual discourse</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New room"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...styles.form, marginBottom: "1.5rem" }}>
          <div style={styles.field}>
            <label style={styles.label}>Room name</label>
            <input
              style={styles.input}
              placeholder="e.g. The Hard Problem of Consciousness"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              placeholder="What is this room about?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div style={{ ...styles.field, display: "flex", gap: "1rem", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Topic tag</label>
              <select
                style={{ ...styles.input, height: 36 }}
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
              >
                {Object.keys(TAG_COLORS).filter(k => k !== "default").map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button style={styles.btnPrimary} onClick={submit}>Create room</button>
          </div>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {loading
        ? <p style={{ color: "#555", fontSize: 14 }}>Loading rooms…</p>
        : rooms.length === 0
        ? <p style={{ color: "#555", fontSize: 14 }}>No rooms yet. Create the first one.</p>
        : rooms.map((r) => (
          <Card key={r.id} onClick={() => onSelectRoom(r)}>
            <h2 style={styles.roomName}>{r.name}</h2>
            {r.description && <p style={styles.roomDesc}>{r.description}</p>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={styles.tagBadge(r.tag)}>{r.tag}</span>
              <span style={styles.meta}>{r.post_count} {r.post_count === 1 ? "thread" : "threads"} · {fmt(r.created_at)}</span>
            </div>
          </Card>
        ))
      }
    </>
  );
}

// ── Room view: list top-level posts ──────────────────────────────────────────
function RoomView({ room, onBack, onSelectPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ author: "", content: "" });

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/rooms/${room.id}/posts`).then(setPosts).finally(() => setLoading(false));
  }, [room.id]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.content.trim()) return;
    await api.post("/posts", { room_id: room.id, author: form.author || "Anonymous", content: form.content });
    setForm({ author: "", content: "" });
    setShowForm(false);
    load();
  };

  return (
    <>
      <div style={styles.breadcrumb}>
        <span style={styles.crumbLink} onClick={onBack}>Rooms</span>
        <span>›</span>
        <span style={{ color: "#aaa" }}>{room.name}</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <span style={styles.tagBadge(room.tag)}>{room.tag}</span>
          <h1 style={{ ...styles.pageTitle, fontSize: 30, marginTop: 8 }}>{room.name}</h1>
          {room.description && <p style={{ ...styles.subtitle, marginBottom: 0 }}>{room.description}</p>}
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New thread"}
        </button>
      </div>

      {showForm && (
        <div style={{ ...styles.form, marginBottom: "1.5rem" }}>
          <div style={styles.field}>
            <label style={styles.label}>Your name</label>
            <input
              style={styles.input}
              placeholder="Anonymous"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Your argument or question</label>
            <textarea
              style={styles.textarea}
              placeholder="State your position clearly…"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <button style={styles.btnPrimary} onClick={submit}>Post thread</button>
        </div>
      )}

      <hr style={styles.divider} />

      {loading
        ? <p style={{ color: "#555", fontSize: 14 }}>Loading threads…</p>
        : posts.length === 0
        ? <p style={{ color: "#555", fontSize: 14 }}>No threads yet. Start the conversation.</p>
        : posts.map((p) => (
          <div key={p.id} style={styles.postCard}>
            <div>
              <span style={styles.postAuthor}>{p.author}</span>
              <span style={styles.postDate}>{fmt(p.created_at)}</span>
            </div>
            <p style={styles.postContent}>{p.content}</p>
            <button style={styles.btn} onClick={() => onSelectPost(p)}>
              {p.reply_count} {p.reply_count === 1 ? "reply" : "replies"} · Reply
            </button>
          </div>
        ))
      }
    </>
  );
}

// ── Thread view: post + its replies ──────────────────────────────────────────
function ThreadView({ room, post, onBack }) {
  const [replies, setReplies] = useState([]);
  const [form, setForm] = useState({ author: "", content: "" });

  const load = useCallback(() => {
    api.get(`/rooms/${room.id}/posts?parent_id=${post.id}`).then(setReplies);
  }, [room.id, post.id]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.content.trim()) return;
    await api.post("/posts", {
      room_id: room.id,
      author: form.author || "Anonymous",
      content: form.content,
      parent_id: post.id,
    });
    setForm({ author: "", content: "" });
    load();
  };

  return (
    <>
      <div style={styles.breadcrumb}>
        <span style={styles.crumbLink} onClick={() => onBack("room")}>Rooms</span>
        <span>›</span>
        <span style={styles.crumbLink} onClick={() => onBack("room")}>{room.name}</span>
        <span>›</span>
        <span style={{ color: "#aaa" }}>Thread</span>
      </div>

      {/* Original post */}
      <div style={{ ...styles.postCard, borderLeftColor: "#c9a84c" }}>
        <div>
          <span style={styles.postAuthor}>{post.author}</span>
          <span style={styles.postDate}>{fmt(post.created_at)}</span>
        </div>
        <p style={{ ...styles.postContent, fontSize: 17 }}>{post.content}</p>
      </div>

      <hr style={styles.divider} />

      {/* Replies */}
      {replies.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          {replies.map((r) => (
            <div key={r.id} style={styles.replyCard}>
              <div>
                <span style={styles.postAuthor}>{r.author}</span>
                <span style={styles.postDate}>{fmt(r.created_at)}</span>
              </div>
              <p style={styles.postContent}>{r.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      <div style={styles.form}>
        <p style={{ fontSize: 13, color: "#666", marginTop: 0, marginBottom: "1rem" }}>Your reply</p>
        <div style={styles.field}>
          <label style={styles.label}>Name</label>
          <input
            style={styles.input}
            placeholder="Anonymous"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </div>
        <div style={styles.field}>
          <textarea
            style={styles.textarea}
            placeholder="Contribute to the discussion…"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <button style={styles.btnPrimary} onClick={submit}>Post reply</button>
      </div>
    </>
  );
}

// ── App shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home");       // "home" | "room" | "thread"
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const goHome = () => { setView("home"); setSelectedRoom(null); setSelectedPost(null); };

  return (
    <>
      <style>{FONT_LINK}</style>
      <div style={styles.root}>
        <header style={styles.header}>
          <h1 style={styles.logo} onClick={goHome}>Agora</h1>
          {view !== "home" && (
            <button style={styles.btn} onClick={goHome}>← All rooms</button>
          )}
        </header>
        <main style={styles.main}>
          {view === "home" && (
            <HomeView onSelectRoom={(r) => { setSelectedRoom(r); setView("room"); }} />
          )}
          {view === "room" && selectedRoom && (
            <RoomView
              room={selectedRoom}
              onBack={goHome}
              onSelectPost={(p) => { setSelectedPost(p); setView("thread"); }}
            />
          )}
          {view === "thread" && selectedRoom && selectedPost && (
            <ThreadView
              room={selectedRoom}
              post={selectedPost}
              onBack={(target) => target === "room" ? setView("room") : goHome()}
            />
          )}
        </main>
      </div>
    </>
  );
}
