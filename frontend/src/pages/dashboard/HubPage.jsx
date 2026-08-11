import { useMemo, useRef, useState } from "react";
import {
  Check,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Play,
  Search,
  Send,
  ThumbsUp,
  X,
} from "lucide-react";
import { PageSection } from "@/components/dashboard";

const TAGS = [
  "Pruning",
  "Harvest",
  "Processing",
  "Soil",
  "Advisory",
  "Announcement",
];

const INITIAL_POSTS = [
  {
    id: "p1",
    author: "Maria Santos",
    role: "Extension Officer • Benguet",
    verified: true,
    time: "2h",
    content:
      "Reminder for arabica growers: now is the best window to prune branches damaged by the last typhoon. Remove dead wood and shape the canopy to improve airflow and reduce leaf rust risk.",
    tags: ["Pruning"],
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
    role: "Farmer • Sagada",
    verified: true,
    time: "5h",
    content:
      "First batch of honey-process beans is drying nicely. Three days in and the brix is dropping steadily. Anyone else experimenting with extended fermentation this season?",
    tags: ["Processing"],
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
    tags: ["Soil", "Advisory"],
    likes: 88,
    liked: false,
    shares: 19,
    comments: [],
    showComments: false,
  },
  {
    id: "p4",
    author: "Ana Reyes",
    role: "Farmer • Atok",
    verified: true,
    time: "2d",
    content:
      "Quick clip from the drying patio — see how we turn the beans hourly on sunny days to keep moisture even.",
    tags: ["Processing", "Harvest"],
    videos: ["https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"],
    likes: 57,
    liked: false,
    shares: 11,
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

function FilterTab({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      {label}
      <span
        className={[
          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
          active
            ? "bg-background/20 text-background"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function ComposerCard({
  draft,
  onDraftChange,
  draftTags,
  onToggleDraftTag,
  draftMedia,
  onRemoveDraftMedia,
  onPickMedia,
  onSubmit,
  fileRef,
}) {
  const canPost = draft.trim() !== "" || draftMedia.length > 0;
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Avatar name="You" />
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Share an update, ask a question, or post a tip for the community…"
            className="min-h-[92px] flex-1 resize-none rounded-lg border border-border bg-background px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {draftMedia.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {draftMedia.map((item, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-lg border border-border"
              >
                {item.kind === "video" ? (
                  <div className="relative aspect-square w-full">
                    <video
                      src={item.src}
                      muted
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white">
                        <Play className="h-4 w-4 fill-current" />
                      </span>
                    </span>
                  </div>
                ) : (
                  <img
                    src={item.src}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onRemoveDraftMedia(i)}
                  aria-label="Remove media"
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <span className="mr-0.5 text-xs font-medium text-muted-foreground">
            Tags
          </span>
          {TAGS.map((tag) => {
            const active = draftTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleDraftTag(tag)}
                className={[
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground",
                ].join(" ")}
              >
                {active && <Check className="h-3 w-3 text-accent" />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ImageIcon className="h-4 w-4" />
          Media
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={onPickMedia}
        />
        <div className="flex items-center gap-3">
          {draftTags.length > 0 && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {draftTags.length} tag{draftTags.length === 1 ? "" : "s"}
            </span>
          )}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canPost}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

function postMedia(post) {
  const items = [];
  for (const src of post.images || []) items.push({ kind: "image", src });
  if (post.image) items.push({ kind: "image", src: post.image });
  for (const src of post.videos || []) items.push({ kind: "video", src });
  return items;
}

function PostMedia({ items, onOpen }) {
  if (!items || items.length === 0) return null;
  const count = items.length;
  const show = items.slice(0, 4);
  const extra = count - 4;
  const gridClass = count === 1 ? "grid-cols-1" : "grid-cols-2";
  return (
    <div className={`grid ${gridClass} gap-1 bg-border`}>
      {show.map((item, i) => {
        const isWide = count === 3 && i === 0;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onOpen(i)}
            className={`relative overflow-hidden bg-muted ${isWide ? "row-span-2" : ""}`}
          >
            {item.kind === "video" ? (
              <>
                <video
                  src={item.src}
                  muted
                  preload="metadata"
                  className={`h-full w-full object-cover ${count === 1 ? "max-h-[520px]" : "aspect-square"}`}
                />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-black/50 text-white">
                    <Play className="h-6 w-6 fill-current" />
                  </span>
                </span>
              </>
            ) : (
              <img
                src={item.src}
                alt=""
                className={`h-full w-full object-cover ${count === 1 ? "max-h-[520px]" : "aspect-square"}`}
              />
            )}
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

function Lightbox({ items, index, onClose, onPrev, onNext }) {
  if (index == null) return null;
  const item = items[index];
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
      {items.length > 1 && (
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
      {item?.kind === "video" ? (
        <video
          src={item.src}
          controls
          autoPlay
          className="max-h-[90vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={item?.src}
          alt=""
          className="max-h-[90vh] max-w-[90vw] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}

export function HubPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [draft, setDraft] = useState("");
  const [draftTags, setDraftTags] = useState([]);
  const [draftMedia, setDraftMedia] = useState([]);
  const fileRef = useRef(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [lightbox, setLightbox] = useState(null); // { postId, index }
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

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

  const toggleDraftTag = (tag) =>
    setDraftTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const submitPost = () => {
    if (!draft.trim() && draftMedia.length === 0) return;
    const images = draftMedia
      .filter((m) => m.kind === "image")
      .map((m) => m.src);
    const videos = draftMedia
      .filter((m) => m.kind === "video")
      .map((m) => m.src);
    const newPost = {
      id: `p${Date.now()}`,
      author: "You",
      role: "Farmer",
      time: "now",
      content: draft.trim(),
      tags: draftTags,
      images,
      videos,
      likes: 0,
      liked: false,
      shares: 0,
      comments: [],
      showComments: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    setDraft("");
    setDraftTags([]);
    setDraftMedia([]);
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

  const onPickMedia = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setDraftMedia((prev) => [
      ...prev,
      ...files.map((f) => ({
        kind: f.type.startsWith("video/") ? "video" : "image",
        src: URL.createObjectURL(f),
      })),
    ]);
  };

  const removeDraftMedia = (i) =>
    setDraftMedia((prev) => prev.filter((_, idx) => idx !== i));

  const openLightbox = (postId, index) => setLightbox({ postId, index });
  const closeLightbox = () => setLightbox(null);
  const lbPost = lightbox ? posts.find((p) => p.id === lightbox.postId) : null;
  const lbMedia = lbPost ? postMedia(lbPost) : [];

  const countByTag = useMemo(() => {
    const counts = {};
    for (const p of posts) {
      for (const t of p.tags || []) counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeTag !== "All" && !(p.tags || []).includes(activeTag)) {
        return false;
      }
      if (!q) return true;
      return (
        (p.content || "").toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, query, activeTag]);

  const isFiltering = query.trim() !== "" || activeTag !== "All";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-4 py-6">
        <PageSection
          eyebrow="Community"
          title="Knowledge Hub"
          description="Advisory posts, agronomy guides, and shared best practices from the coffee community."
        />

        <div className="space-y-4">
          <ComposerCard
            draft={draft}
            onDraftChange={setDraft}
            draftTags={draftTags}
            onToggleDraftTag={toggleDraftTag}
            draftMedia={draftMedia}
            onRemoveDraftMedia={removeDraftMedia}
            onPickMedia={onPickMedia}
            onSubmit={submitPost}
            fileRef={fileRef}
          />

          {/* Search */}
          <div className="rounded-xl border border-border bg-card shadow-sm lg:sticky lg:top-4 lg:z-10">
            <div className="p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts, authors, tags…"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="mt-3 flex items-center gap-1 overflow-x-auto border-t border-border pt-3">
                <FilterTab
                  label="All"
                  count={posts.length}
                  active={activeTag === "All"}
                  onClick={() => setActiveTag("All")}
                />
                {TAGS.map((tag) => (
                  <FilterTab
                    key={tag}
                    label={tag}
                    count={countByTag[tag] ?? 0}
                    active={activeTag === tag}
                    onClick={() =>
                      setActiveTag((current) =>
                        current === tag ? "All" : tag,
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {isFiltering && (
            <p className="px-1 text-xs text-muted-foreground">
              Showing {filteredPosts.length} of {posts.length} post
              {posts.length === 1 ? "" : "s"}
              {activeTag !== "All" && ` tagged “${activeTag}”`}
              {query.trim() && ` matching “${query.trim()}”`}
            </p>
          )}

          {filteredPosts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-4 py-16 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No posts found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search term or tag.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveTag("All");
                }}
                className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
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
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  {post.content && (
                    <p className="px-4 pb-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}

                  {(post.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                      {(post.tags || []).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setActiveTag(tag)}
                          className={[
                            "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                            activeTag === tag
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-muted text-muted-foreground hover:border-foreground hover:text-foreground",
                          ].join(" ")}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  <PostMedia
                    items={postMedia(post)}
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
                        updatePost(post.id, {
                          showComments: !post.showComments,
                        })
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
            </div>
          )}
        </div>
      </main>
      <Lightbox
        items={lbMedia}
        index={lightbox?.index ?? null}
        onClose={closeLightbox}
        onPrev={() =>
          setLightbox(
            (lb) =>
              lb && {
                ...lb,
                index: (lb.index - 1 + lbMedia.length) % lbMedia.length,
              },
          )
        }
        onNext={() =>
          setLightbox(
            (lb) => lb && { ...lb, index: (lb.index + 1) % lbMedia.length },
          )
        }
      />
    </div>
  );
}
