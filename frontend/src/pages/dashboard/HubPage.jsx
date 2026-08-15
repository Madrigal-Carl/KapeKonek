import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Play,
  Search,
  Send,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { PageSection } from "@/components/dashboard";
import { ArchiveConfirmModal } from "@/components/modals";
import { Button } from "@/components/ui";
import useAuth from "@/hooks/useAuth";
import {
  useCreateComment,
  useCreatePost,
  useDeleteComment,
  useDeletePost,
  usePostComments,
  usePosts,
  useDebouncedPostLike,
  useUpdateComment,
  useUpdatePost,
} from "@/hooks/usePosts";
import {
  POST_TAG_OPTIONS,
  createCommentSchema,
  createPostSchema,
  getFieldErrors,
  updateCommentSchema,
  updatePostSchema,
} from "@/schemas/post.schema";
import { uploadToCloudinary } from "@/services/upload.service";
import { notifyError } from "@/utils/notify";

const fmtRelative = (value) => {
  if (!value) return "";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const initialsOf = (name) =>
  (name ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function Avatar({ name, size = 40 }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-foreground"
      style={{ width: size, height: size, borderRadius: "50%" }}
    >
      {initialsOf(name)}
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
      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-none">
        {count}
      </span>
    </button>
  );
}

function PostCaption({ content }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 150;
  const needsToggle = content.length > limit;
  const visible =
    !needsToggle || expanded
      ? content
      : `${content.slice(0, limit).trimEnd()}…`;

  return (
    <div className="px-3 pb-2 text-[15px] leading-[1.35] text-foreground sm:px-4">
      <span
        className="whitespace-pre-wrap break-words"
        style={{ overflowWrap: "anywhere" }}
      >
        {visible}
      </span>
      {needsToggle && (
        <>
          {" "}
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="font-semibold text-primary hover:underline"
          >
            {expanded ? "See less" : "See more"}
          </button>
        </>
      )}
    </div>
  );
}

function postMedia(post) {
  const videos = (post.mediaUrl ?? []).map((src) => ({ kind: "video", src }));
  const images = (post.imageUrl ?? []).map((src) => ({ kind: "image", src }));
  return [...videos, ...images];
}

function MediaCollage({ items, onOpen }) {
  if (!items.length) return null;
  const count = items.length;
  const visible = items.slice(0, 4);
  const hiddenCount = count > 4 ? count - 3 : 0;
  const layout =
    count === 1
      ? ""
      : count === 2
        ? "grid h-80 grid-cols-2 gap-[2px] sm:h-[28rem]"
        : "grid h-80 grid-cols-2 grid-rows-2 gap-[2px] sm:h-[28rem]";

  return (
    <div
      className={`overflow-hidden bg-border ${layout}`}
      style={{ borderRadius: 10 }}
    >
      {visible.map((item, index) => {
        const isLarge = count === 3 && index === 0;
        const isOverflow = count > 4 && index === 3;

        return (
          <button
            key={`${item.src}-${index}`}
            type="button"
            onClick={() => onOpen(index)}
            className={[
              "group relative flex min-h-0 items-center justify-center overflow-hidden bg-muted",
              count === 1 && "min-h-[20rem] max-h-[520px] w-full sm:min-h-[28rem]",
              isLarge && "row-span-2",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {item.kind === "video" ? (
              <>
                <video
                  src={item.src}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-contain object-center transition-transform duration-200 group-hover:scale-[1.02]"
                />
                <span className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white"
                    style={{ borderRadius: "50%" }}
                  >
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
              </>
            ) : (
              <img
                src={item.src}
                alt=""
                className="h-full w-full object-contain object-center transition-transform duration-200 group-hover:scale-[1.02]"
              />
            )}
            {isOverflow && (
              <span className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-semibold text-white">
                +{hiddenCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Lightbox({ items, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (index == null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [index, onClose, onNext, onPrev]);

  if (index == null || !items[index]) return null;
  const item = items[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center border border-white/30 bg-black/40 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onPrev();
            }}
            aria-label="Previous"
            className="absolute left-3 grid h-11 w-11 place-items-center border border-white/30 bg-black/40 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            aria-label="Next"
            className="absolute right-3 grid h-11 w-11 place-items-center border border-white/30 bg-black/40 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <div
        className="flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        {item.kind === "video" ? (
          <video
            key={item.src}
            src={item.src}
            controls
            autoPlay
            className="max-h-[82vh] max-w-full bg-black object-contain"
          />
        ) : (
          <img
            key={item.src}
            src={item.src}
            alt=""
            className="max-h-[82vh] max-w-full object-contain"
          />
        )}
        <span className="border border-white/20 bg-black/40 px-3 py-1 text-xs text-white">
          {index + 1} / {items.length}
        </span>
      </div>
    </div>
  );
}

function Composer({ draft, setDraft, tags, setTags, media, setMedia, onSubmit, editing, onCancel }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState({ active: false, percent: 0 });

  const onPick = async (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    const total = files.reduce((sum, file) => sum + file.size, 0);
    let done = 0;
    setUploading({ active: true, percent: 0 });
    for (const file of files) {
      try {
        const result = await uploadToCloudinary(file, "post", (loaded) => {
          setUploading({ active: true, percent: Math.min(Math.round(((done + loaded) / total) * 100), 99) });
        });
        done += file.size;
        setMedia((prev) => [...prev, { kind: file.type.startsWith("video/") ? "video" : "image", src: result.secure_url, name: file.name }]);
      } catch (error) {
        notifyError(error, "Failed to upload media");
      }
    }
    setUploading({ active: false, percent: 100 });
  };

  const toggleTag = (tag) => setTags((prev) => prev.includes(tag) ? prev.filter((value) => value !== tag) : [...prev, tag]);
  const canPost = draft.trim() || media.length > 0;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 sm:p-5">
        {editing && (
          <div className="mb-3 flex items-center justify-between border border-accent bg-accent/10 px-3 py-2">
            <span className="label-mono text-accent">Editing post</span>
            <button type="button" onClick={onCancel} className="label-mono text-muted-foreground hover:underline">Cancel</button>
          </div>
        )}
        <div className="flex items-start gap-3">
          <Avatar name="You" />
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Share an update, ask a question, or post a tip…" className="min-h-[92px] flex-1 resize-none rounded-lg border border-border bg-background px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        {media.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {media.map((item, index) => (
              <div key={`${item.src}-${index}`} className="relative overflow-hidden rounded-lg border border-border">
                {item.kind === "video" ? <video src={item.src} muted playsInline preload="metadata" className="aspect-square w-full object-cover" /> : <img src={item.src} alt={item.name ?? ""} className="aspect-square w-full object-cover" />}
                <button type="button" onClick={() => setMedia((prev) => prev.filter((_, i) => i !== index))} aria-label="Remove media" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80" style={{ borderRadius: "50%" }}><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        )}
        {uploading.active && (
          <div className="mt-3 flex items-center gap-3 border border-border bg-muted/30 p-3">
            <div className="h-1.5 flex-1 overflow-hidden bg-muted"><div className="h-full bg-accent transition-[width]" style={{ width: `${uploading.percent}%` }} /></div>
            <span className="label-mono shrink-0 text-muted-foreground">{uploading.percent}%</span>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <span className="label-mono mr-1 text-muted-foreground">Tags</span>
          {POST_TAG_OPTIONS.map((tag) => (
            <button key={tag.value} type="button" onClick={() => toggleTag(tag.value)} className={[
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              tags.includes(tag.value) ? "border-accent bg-accent/10 text-foreground" : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground",
            ].join(" ")}>
              {tags.includes(tag.value) && <Check className="h-3 w-3 text-accent" />}{tag.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading.active} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"><ImageIcon className="h-4 w-4" /> Media</button>
        <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden disabled={uploading.active} onChange={onPick} />
        <Button type="button" onClick={onSubmit} disabled={!canPost || uploading.active} className="gap-2"><Send className="h-4 w-4" />{editing ? "Save Changes" : "Post"}</Button>
      </div>
    </div>
  );
}

function PostCard({ post, currentUserId, onEdit, onDelete, onMediaOpen, onTagClick }) {
  const postId = post._id ?? post.id;
  const authorName = post.author?.fullName ?? post.author ?? "Unknown";
  const ownPost = post.author?._id === currentUserId || authorName === "You";
  const [expanded, setExpanded] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentMenuOpen, setCommentMenuOpen] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editingText, setEditingText] = useState("");
  const inputRef = useRef(null);
  const [likeBounce, setLikeBounce] = useState(false);
  const createComment = useCreateComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const { data: comments = [], isLoading } = usePostComments(postId, { enabled: commentsOpen });
  const likeState = useDebouncedPostLike(postId, {
    liked: post.liked,
    likeCount: post.likeCount,
  });

  useEffect(() => {
    if (!postMenuOpen && !commentMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      const target = event.target;
      if (
        target.closest?.('[aria-label="Post options"]') ||
        target.closest?.('[aria-label="Comment options"]')
      ) {
        return;
      }
      setPostMenuOpen(false);
      setCommentMenuOpen(null);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [postMenuOpen, commentMenuOpen]);

  const openComments = () => {
    setCommentsOpen((value) => !value);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };
  const handleLike = () => {
    likeState.toggle();
    setLikeBounce(true);
    window.setTimeout(() => setLikeBounce(false), 260);
  };
  const submitComment = (event) => {
    event.preventDefault();
    const result = createCommentSchema.safeParse({ message: commentDraft });
    if (!result.success) return;
    createComment.mutate({ postId, data: result.data });
    setCommentDraft("");
  };
  const saveComment = (comment) => {
    const result = updateCommentSchema.safeParse({ message: editingText });
    if (!result.success) return;
    updateComment.mutate({ postId, commentId: comment._id ?? comment.id, data: result.data });
    setEditingComment(null);
  };
  const media = postMedia(post);
  const description = post.description ?? post.content ?? "";
  const showComments = commentsOpen;

  return (
    <article className="overflow-hidden rounded-lg bg-white">
      <div className="flex items-center gap-2 p-3">
        <Avatar name={authorName} verified={post.verified} />
        <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-semibold text-foreground">{authorName}</p><p className="text-[13px] text-muted-foreground">posted an update · {post.createdAt ? fmtRelative(post.createdAt) : post.time} · Public</p></div>
        {ownPost && <div className="relative"><button type="button" onClick={() => setPostMenuOpen((value) => !value)} aria-label="Post options" className="grid h-8 w-8 place-items-center text-muted-foreground hover:bg-muted"><MoreHorizontal className="h-5 w-5" /></button>{postMenuOpen && <div className="absolute right-0 top-full z-20 mt-1 w-32 border border-border bg-card p-1 shadow-lg"><button type="button" onClick={() => { setPostMenuOpen(false); onEdit(post); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted"><Pencil className="h-3.5 w-3.5" />Edit</button><button type="button" onClick={() => { setPostMenuOpen(false); onDelete(post); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Delete</button></div>}</div>}
      </div>
      {description && <PostCaption content={description} />}
      {(post.tags || []).length > 0 && <div className="flex flex-wrap gap-1.5 px-3 pb-3">{post.tags.map((tag) => <button key={tag} type="button" onClick={() => onTagClick?.(tag)} className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">{tag}</button>)}</div>}
      <MediaCollage items={media} onOpen={(index) => onMediaOpen(postId, index)} />
      <div className="flex items-center justify-between px-3 py-2 text-[13px] text-muted-foreground"><span className="inline-flex items-center gap-1"><ThumbsUp className={likeState.liked ? "h-3.5 w-3.5 fill-blue-600 text-blue-600" : "h-3.5 w-3.5"} />{likeState.likeCount} likes</span><span>{post.commentCount ?? comments.length} comments</span></div>
      <div className="grid grid-cols-2 border-t border-border"><button type="button" onClick={handleLike} className={["inline-flex items-center justify-center gap-2 border-r border-border py-2.5 text-sm font-semibold hover:bg-muted", likeState.liked ? "text-blue-600" : "text-muted-foreground", likeBounce && "animate-[hub-like-pop_260ms_ease-out]"].join(" ")}><ThumbsUp className="h-[18px] w-[18px]" fill={likeState.liked ? "currentColor" : "none"} />{likeState.liked ? "Liked" : "Like"}</button><button type="button" onClick={openComments} className="inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"><MessageCircle className="h-[18px] w-[18px]" />Comment</button></div>
      {showComments && <div className="space-y-3 border-t border-border bg-muted/30 px-3 py-3">{isLoading ? <p className="text-xs text-muted-foreground">Loading comments…</p> : comments.length === 0 ? <p className="text-xs text-muted-foreground">No comments yet.</p> : comments.map((comment) => { const commentId = comment._id ?? comment.id; const commentAuthor = comment.author?.fullName ?? comment.author ?? "Unknown"; const ownComment = comment.isOwn || commentAuthor === "You"; return <div key={commentId} className="flex items-start gap-2"><Avatar name={commentAuthor} size={32} /><div className="rounded-2xl bg-background px-3 py-2"><div className="flex items-center gap-2"><p className="text-xs font-semibold text-foreground">{commentAuthor}</p>{ownComment && <div className="relative"><button type="button" onClick={() => setCommentMenuOpen((value) => value === commentId ? null : commentId)} aria-label="Comment options" className="grid h-6 w-6 place-items-center text-muted-foreground hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button>{commentMenuOpen === commentId && <div className="absolute right-0 top-full z-20 mt-1 w-28 border border-border bg-card p-1 shadow-lg"><button type="button" onClick={() => { setCommentMenuOpen(null); setEditingComment(commentId); setEditingText(comment.message ?? comment.text ?? ""); }} className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-foreground hover:bg-muted"><Pencil className="h-3 w-3" />Edit</button><button type="button" onClick={() => { setCommentMenuOpen(null); deleteComment.mutate({ postId, commentId }); }} className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" />Delete</button></div>}</div>}</div>{editingComment === commentId ? <div className="mt-1 flex gap-2"><input value={editingText} onChange={(event) => setEditingText(event.target.value)} className="min-w-0 border border-border bg-background px-2 py-1 text-sm" autoFocus /><button type="button" onClick={() => saveComment({ ...comment, _id: commentId })} className="text-xs font-semibold text-primary">Save</button></div> : <p className="text-sm text-foreground">{comment.message ?? comment.text}</p>}</div></div>; })}<div className="flex items-center gap-2"><Avatar name="You" size={32} /><form onSubmit={submitComment} className="relative flex-1"><input ref={inputRef} value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Write a comment…" className="w-full rounded-full border border-input bg-background px-4 py-2 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none" /><button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-primary"><Send className="h-4 w-4" /></button></form></div></div>}
    </article>
  );
}

export function HubPage() {
  const { user } = useAuth();
  const currentUserId = user?._id;
  const { data: posts = [], isLoading, isError } = usePosts({ all: true });
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [draft, setDraft] = useState("");
  const [draftTags, setDraftTags] = useState([]);
  const [draftMedia, setDraftMedia] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const resetEditor = () => {
    setDraft("");
    setDraftTags([]);
    setDraftMedia([]);
    setEditingPost(null);
    setErrors({});
  };

  const beginEdit = (post) => {
    setEditingPost(post);
    setDraft(post.description ?? post.content ?? "");
    setDraftTags(post.tags ?? []);
    setDraftMedia(postMedia(post));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitPost = () => {
    const payload = {
      description: draft,
      tags: draftTags,
      imageUrl: draftMedia.filter((item) => item.kind === "image").map((item) => item.src),
      mediaUrl: draftMedia.filter((item) => item.kind === "video").map((item) => item.src),
    };
    const schema = editingPost ? updatePostSchema : createPostSchema;
    const result = schema.safeParse(payload);
    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }
    setErrors({});
    if (editingPost) {
      updatePost.mutate(
        { id: editingPost._id ?? editingPost.id, data: result.data },
        { onSuccess: resetEditor },
      );
    } else {
      createPost.mutate(result.data, { onSuccess: resetEditor });
    }
  };

  const countByTag = useMemo(
    () =>
      posts.reduce((counts, post) => {
        (post.tags ?? []).forEach((tag) => {
          counts[tag] = (counts[tag] ?? 0) + 1;
        });
        return counts;
      }, {}),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeTag !== "All" && !(post.tags ?? []).includes(activeTag)) return false;
      return (
        !search ||
        (post.description ?? "").toLowerCase().includes(search) ||
        (post.author?.fullName ?? "").toLowerCase().includes(search) ||
        (post.tags ?? []).some((tag) => tag.toLowerCase().includes(search))
      );
    });
  }, [posts, query, activeTag]);

  const lightboxPost = lightbox
    ? posts.find((post) => (post._id ?? post.id) === lightbox.postId)
    : null;
  const lightboxItems = lightboxPost ? postMedia(lightboxPost) : [];

  const moveLightbox = (direction) => {
    setLightbox((current) => {
      if (!current || !lightboxItems.length) return current;
      return {
        ...current,
        index: (current.index + direction + lightboxItems.length) % lightboxItems.length,
      };
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-4 py-6">
        <PageSection
          eyebrow="Community"
          title="Knowledge Hub"
          description="Advisory posts, agronomy guides, and shared best practices from the coffee community."
        />

        <div className="space-y-4">
          <Composer
            draft={draft}
            setDraft={setDraft}
            tags={draftTags}
            setTags={setDraftTags}
            media={draftMedia}
            setMedia={setDraftMedia}
            onSubmit={submitPost}
            editing={editingPost}
            onCancel={resetEditor}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}

          <div className="rounded-xl border border-border bg-card p-3 shadow-sm lg:sticky lg:top-4 lg:z-10">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search posts, authors, tags…"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
              />
            </div>
            <div className="mt-3 flex items-center gap-1 overflow-x-auto border-t border-border pt-3">
              <FilterTab label="All" count={posts.length} active={activeTag === "All"} onClick={() => setActiveTag("All")} />
              {POST_TAG_OPTIONS.map((tag) => (
                <FilterTab
                  key={tag.value}
                  label={tag.label}
                  count={countByTag[tag.value] ?? 0}
                  active={activeTag === tag.value}
                  onClick={() => setActiveTag(activeTag === tag.value ? "All" : tag.value)}
                />
              ))}
            </div>
          </div>

          {isError ? (
            <div className="border border-destructive bg-card px-4 py-10 text-center text-sm text-destructive">Failed to load posts.</div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((id) => <div key={id} className="h-48 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-16 text-center">
              <Search className="mx-auto mb-3 h-5 w-5 text-muted-foreground" />
              <p className="font-semibold text-foreground">No posts found</p>
              <p className="mt-1 text-sm text-muted-foreground">Be the first to share an update.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post._id ?? post.id}
                  post={post}
                  currentUserId={currentUserId}
                  onEdit={beginEdit}
                  onDelete={setConfirmDelete}
                  onMediaOpen={(postId, index) => setLightbox({ postId, index })}
                  onTagClick={setActiveTag}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {confirmDelete && (
        <ArchiveConfirmModal
          title="Delete post?"
          confirmLabel="Delete"
          description="This will permanently remove this post and its comments."
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => deletePost.mutate(confirmDelete._id ?? confirmDelete.id, { onSuccess: () => setConfirmDelete(null) })}
        />
      )}

      <Lightbox
        items={lightboxItems}
        index={lightbox?.index ?? null}
        onClose={() => setLightbox(null)}
        onPrev={() => moveLightbox(-1)}
        onNext={() => moveLightbox(1)}
      />
    </div>
  );
}
