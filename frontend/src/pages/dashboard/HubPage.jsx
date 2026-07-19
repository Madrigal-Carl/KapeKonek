import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Send,
  ThumbsUp,
  MessageCircle,
  MoreHorizontal,
  Check,
  Coffee,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

const INITIAL_POSTS = [
  {
    id: "p1",
    author: "Maria Santos",
    role: "Extension Officer \u2022 Benguet",
    verified: true,
    time: "2h",
    content:
      "Reminder for arabica growers: now is the best window to prune branches damaged by the last typhoon. Remove dead wood and shape the canopy to improve airflow and reduce leaf rust risk.",
    likes: 24,
    liked: false,
    shares: 3,
    comments: [
      {
        id: "c1",
        author: "Juan Dela Cruz",
        text: "Thanks Maria! Will start pruning this weekend.",
        time: "1h",
      },
    ],
    showComments: false,
  },
  {
    id: "p2",
    author: "Juan Dela Cruz",
    role: "Farmer \u2022 Sagada",
    verified: true,
    time: "5h",
    content:
      "First batch of honey-process beans is drying nicely. Three days in and the brix is dropping steadily. Anyone else experimenting with extended fermentation this season?",
    likes: 41,
    liked: true,
    shares: 7,
    comments: [],
    showComments: false,
  },
  {
    id: "p3",
    author: "KapeKonek Advisory",
    role: "Knowledge Hub",
    time: "Yesterday",
    content:
      "New guide published: 'Soil pH Management for Highland Coffee'. Covers liming schedules, organic amendments, and how to read a basic soil test. Tap to read.",
    likes: 88,
    liked: false,
    shares: 19,
    comments: [],
    showComments: false,
  },
];
function Avatar({ name, verified, size = 40 }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
        {initials}
      </div>
      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-emerald-500 text-white">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      )}
    </div>
  );
}
function PostImages({ images, onOpen }) {
  if (!images || images.length === 0) return null;
  const count = images.length;
  const show = images.slice(0, 4);
  const extra = count - 4;
  const gridClass =
    count === 1 ? "grid-cols-1" : count === 3 ? "grid-cols-2" : "grid-cols-2";
  return (
    <div className={`grid ${gridClass} gap-1 bg-border`}>
      {show.map((src, i) => {
        const isWide = count === 3 && i === 0;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onOpen(i)}
            className={`relative overflow-hidden bg-muted ${isWide ? "row-span-2" : ""}`}
          >
            <img
              src={src}
              alt=""
              className={`h-full w-full object-cover ${count === 1 ? "max-h-[520px]" : "aspect-square"}`}
            />
            {i === 3 && extra > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-semibold text-white">
                +{extra}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
function Lightbox({ images, index, onClose, onPrev, onNext }) {
  if (index == null) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
      >
        Close
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
          >
            ›
          </button>
        </>
      )}
      <img
        src={images[index]}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
export function HubPage() {
  const { role } = useAuth();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [draft, setDraft] = useState("");
  const [draftImages, setDraftImages] = useState([]);
  const fileRef = useRef(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [lightbox, setLightbox] = useState(null); // { postId, index }
  const updatePost = (id, patch) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const toggleLike = (id) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );
  const submitPost = () => {
    if (!draft.trim() && draftImages.length === 0) return;
    const newPost = {
      id: `p${Date.now()}`,
      author: "You",
      role: "Farmer",
      time: "now",
      content: draft.trim(),
      images: draftImages,
      likes: 0,
      liked: false,
      shares: 0,
      comments: [],
      showComments: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    setDraft("");
    setDraftImages([]);
    if (fileRef.current) fileRef.current.value = "";
  };
  const submitComment = (id) => {
    const text = (commentDrafts[id] ?? "").trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              showComments: true,
              comments: [
                ...p.comments,
                { id: `c${Date.now()}`, author: "You", text, time: "now" },
              ],
            }
          : p,
      ),
    );
    setCommentDrafts((prev) => ({ ...prev, [id]: "" }));
  };
  const onPickImages = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setDraftImages((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };
  const removeDraftImage = (i) =>
    setDraftImages((prev) => prev.filter((_, idx) => idx !== i));
  const openLightbox = (postId, index) => setLightbox({ postId, index });
  const closeLightbox = () => setLightbox(null);
  const lbPost = lightbox ? posts.find((p) => p.id === lightbox.postId) : null;
  const lbImages = lbPost?.images ?? (lbPost?.image ? [lbPost.image] : []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-4 space-y-4">
        {/* Composer */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Avatar name="You" />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share an update, question, or tip with the community…"
              className="min-h-[60px] flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          {draftImages.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {draftImages.map((src, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-md border border-border"
                >
                  <img
                    src={src}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeDraftImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <ImageIcon className="h-4 w-4" />
              Photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPickImages}
            />
            <button
              type="button"
              onClick={submitPost}
              disabled={!draft.trim() && draftImages.length === 0}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Post
            </button>
          </div>
        </div>

        {/* Feed */}
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-start justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar name={post.author} verified={post.verified} />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {post.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {post.role} • {post.time}
                  </p>
                </div>
              </div>
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {post.content && (
              <p className="px-4 pb-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {post.content}
              </p>
            )}
            <PostImages
              images={
                post.images && post.images.length
                  ? post.images
                  : post.image
                    ? [post.image]
                    : []
              }
              onOpen={(i) => openLightbox(post.id, i)}
            />

            <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
              <span>
                {post.likes > 0 && (
                  <>
                    <ThumbsUp className="mr-1 inline h-3 w-3 text-primary" />
                    {post.likes}
                  </>
                )}
              </span>
              <span className="space-x-3">
                {post.comments.length > 0 && (
                  <span>{post.comments.length} comments</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 border-t border-border">
              <button
                onClick={() => toggleLike(post.id)}
                className={`inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors hover:bg-muted ${post.liked ? "text-blue-600" : "text-muted-foreground"}`}
              >
                <ThumbsUp
                  className="h-4 w-4"
                  fill={post.liked ? "currentColor" : "none"}
                />
                {post.liked ? "Liked" : "Like"}
              </button>
              <button
                onClick={() =>
                  updatePost(post.id, { showComments: !post.showComments })
                }
                className="inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" />
                Comment
              </button>
            </div>

            {post.showComments && (
              <div className="space-y-3 border-t border-border bg-muted/30 px-4 py-3">
                {post.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <Avatar name={c.author} size={32} />
                    <div className="rounded-2xl bg-background px-3 py-2 shadow-sm">
                      <p className="text-xs font-semibold text-foreground">
                        {c.author}
                      </p>
                      <p className="text-sm text-foreground">{c.text}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {c.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Avatar name="You" size={32} />
                  <div className="relative flex-1">
                    <input
                      value={commentDrafts[post.id] ?? ""}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitComment(post.id);
                        }
                      }}
                      placeholder="Write a comment…"
                      className="w-full rounded-full border border-input bg-background px-4 py-2 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <button
                      onClick={() => submitComment(post.id)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-primary hover:bg-muted"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
      </main>
      <Lightbox
        images={lbImages}
        index={lightbox?.index ?? null}
        onClose={closeLightbox}
        onPrev={() =>
          setLightbox(
            (lb) =>
              lb && {
                ...lb,
                index: (lb.index - 1 + lbImages.length) % lbImages.length,
              },
          )
        }
        onNext={() =>
          setLightbox(
            (lb) => lb && { ...lb, index: (lb.index + 1) % lbImages.length },
          )
        }
      />
    </div>
  );
}
