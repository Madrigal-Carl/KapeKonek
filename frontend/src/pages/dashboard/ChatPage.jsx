import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Pencil,
  Send,
  ShieldCheck,
  Smile,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ArchiveConfirmModal } from "@/components/modals";
import useAuth from "@/hooks/useAuth";
import {
  chatKeys,
  useChats,
  useDeleteMessage,
  useMarkChatRead,
  useSendMessage,
  useToggleReaction,
  useUpdateMessage,
} from "@/hooks/useChats";
import { useChatSocket } from "@/hooks/useChatSocket";
import { onChatEvent, setActiveChatId } from "@/services/chatSocket";
import { getChatMessages } from "@/services/chat.service";
import { uploadToCloudinary } from "@/services/upload.service";
import { notify, notifyError } from "@/utils/notify";
import { sendMessageSchema, updateMessageSchema } from "@/schemas/chat.schema";

const MESSAGES_PER_PAGE = 30;
const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const fmtTime = (s) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const isEdited = (m) =>
  m.updatedAt &&
  new Date(m.updatedAt).getTime() - new Date(m.createdAt).getTime() > 1000;

// Messages can only be edited/deleted within 3 minutes of sending.
const canModifyMessage = (m) =>
  m.createdAt && Date.now() - new Date(m.createdAt).getTime() <= 3 * 60 * 1000;

const toAttachmentType = (mime) => {
  if (mime?.startsWith("image/")) return "image";
  if (mime?.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return "document";
};

const initialsOf = (name) =>
  (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function Avatar({ name, className, verified, isAdmin }) {
  return (
    <div className="shrink-0">
      <div
        className={[
          "relative grid place-items-center border border-border bg-muted font-semibold text-foreground",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ borderRadius: "50%" }}
      >
        {initialsOf(name)}
        {verified && (
          <span
            className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center border border-background bg-emerald-500 text-white"
            style={{ borderRadius: "50%" }}
            title="Verified"
          >
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        )}
        {isAdmin && (
          <span
            className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center border border-background bg-accent text-accent-foreground"
            style={{ borderRadius: "50%" }}
            title="Admin"
          >
            <ShieldCheck className="h-2.5 w-2.5" />
          </span>
        )}
      </div>
    </div>
  );
}

function ReactionPicker({ open, onOpenChange, onPick, isOwn }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onMouseDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label="Add reaction"
        title="Add reaction"
        className="grid h-8 w-8 place-items-center text-muted-foreground hover:text-foreground"
      >
        <Smile className="h-4 w-4" />
      </button>
      {open && (
        <div
          className={`absolute bottom-full z-30 mb-1 flex gap-0.5 border border-border bg-card p-1 shadow-lg ${
            isOwn ? "right-0" : "left-0"
          }`}
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onPick(emoji)}
              className="grid h-9 w-9 place-items-center pb-0.5 text-lg hover:bg-muted"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatPage() {
  const { user } = useAuth();
  const currentUserId = user?._id;

  const [membersOpen, setMembersOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, setPending] = useState([]);
  const [upload, setUpload] = useState({ active: false, percent: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [reactionUsersFor, setReactionUsersFor] = useState(null);
  const reactionsRef = useRef(null);
  const toggleReactionMutation = useToggleReaction();

  const scrollRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimersRef = useRef({});
  const lastTypingAtRef = useRef(0);
  const queryClient = useQueryClient();

  const { data: chats = [], isLoading: chatsLoading } = useChats();
  const chat = chats[0];
  const chatId = chat?._id;

  const [messages, setMessages] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(null);

  const { status: socketStatus, sendTyping } = useChatSocket({ chatId });

  // When the socket (re)connects, sync the chat list so any chat:read events
  // missed while disconnected are caught up (seen status stays live).
  const prevSocketStatusRef = useRef(socketStatus);
  useEffect(() => {
    if (
      socketStatus === "connected" &&
      prevSocketStatusRef.current !== "connected"
    ) {
      queryClient.invalidateQueries({ queryKey: chatKeys.list });
    }
    prevSocketStatusRef.current = socketStatus;
  }, [socketStatus, queryClient]);

  const sendMutation = useSendMessage();
  const updateMutation = useUpdateMessage();
  const deleteMutation = useDeleteMessage();
  const markChatRead = useMarkChatRead();

  // Mark the chat as read when opened and flag it as the active chat so the
  // unread badge isn't incremented while it's being viewed. Fires once per
  // chat — the mutation object identity changes every render, so it goes
  // through a ref to avoid re-firing.
  const markChatReadRef = useRef(null);
  const markedReadRef = useRef(null);

  useEffect(() => {
    markChatReadRef.current = markChatRead;
  }, [markChatRead]);

  useEffect(() => {
    if (!chatId) return;
    setActiveChatId(chatId);
    if (markedReadRef.current !== chatId) {
      markedReadRef.current = chatId;
      markChatReadRef.current?.mutate(chatId);
    }
    return () => setActiveChatId(null);
  }, [chatId]);

  // Initial load — start from the LAST page so the most recent messages
  // (up to 30) appear first; older pages are prepended on scroll-up.
  useEffect(() => {
    if (!chatId) return;

    let cancelled = false;
    setMessages([]);
    setHasMore(false);
    setNextPage(null);
    setLoadingInitial(true);

    (async () => {
      try {
        const first = await getChatMessages(chatId, {
          page: 1,
          limit: MESSAGES_PER_PAGE,
        });
        const totalPages = first.pagination?.totalPages ?? 1;
        const last = await getChatMessages(chatId, {
          page: totalPages,
          limit: MESSAGES_PER_PAGE,
        });

        if (cancelled) return;
        setMessages(last.messages);
        setHasMore(totalPages > 1);
        setNextPage(totalPages > 1 ? totalPages - 1 : null);
      } catch (err) {
        if (!cancelled) notifyError(err, "Failed to load messages");
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  const loadOlder = async () => {
    if (!chatId || loadingOlder || !hasMore || nextPage == null) return;

    setLoadingOlder(true);
    const scrollEl = scrollRef.current;
    const prevHeight = scrollEl?.scrollHeight ?? 0;

    try {
      const res = await getChatMessages(chatId, {
        page: nextPage,
        limit: MESSAGES_PER_PAGE,
      });
      setMessages((prev) => [...res.messages, ...prev]);
      setHasMore(res.pagination.page > 1);
      setNextPage(res.pagination.page > 1 ? res.pagination.page - 1 : null);

      // Keep the viewport anchored after prepending older messages.
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } catch (err) {
      notifyError(err, "Failed to load older messages");
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop < 60) loadOlder();
  };

  // Realtime event handling — merge socket events into the local message
  // list AND the chat list (last-message preview) so every member updates.
  useEffect(() => {
    if (!chatId) return;

    const patchChatList = (updater) =>
      queryClient.setQueryData(chatKeys.list, (old = []) =>
        old.map((chat) => (chat._id === chatId ? updater(chat) : chat)),
      );

    const toLastMessage = (m) =>
      m
        ? {
            _id: m._id,
            text: m.text,
            hasAttachments: (m.attachments ?? []).length > 0,
            deleted: Boolean(m.deleted),
            sender: m.sender,
            createdAt: m.createdAt,
          }
        : null;

    const unsubscribes = [
      onChatEvent("chat:new-message", (d) => {
        if (d.chatId !== chatId) return;
        setMessages((prev) =>
          prev.some((m) => m._id === d.message._id) ? prev : [...prev, d.message],
        );
        patchChatList((chat) => ({
          ...chat,
          lastMessage: toLastMessage(d.message),
          // A new latest message resets who has seen it.
          lastReadBy: [],
        }));
        // The active viewer immediately reads this new message — rebroadcast
        // so the author sees the read receipt in realtime.
        if (d.message.sender?._id !== currentUserId) {
          markChatReadRef.current?.mutate(chatId);
        }
      }),
      onChatEvent("chat:message-updated", (d) => {
        if (d.chatId !== chatId) return;
        setMessages((prev) =>
          prev.map((m) => (m._id === d.message._id ? d.message : m)),
        );
        patchChatList((chat) =>
          chat.lastMessage?._id === d.message._id
            ? { ...chat, lastMessage: toLastMessage(d.message) }
            : chat,
        );
      }),
      onChatEvent("chat:message-deleted", (d) => {
        if (d.chatId !== chatId || !d.message) return;
        // Recall: keep the message slot in place as a tombstone.
        setMessages((prev) =>
          prev.map((m) => (m._id === d.message._id ? d.message : m)),
        );
        patchChatList((chat) =>
          chat.lastMessage?._id === d.messageId
            ? { ...chat, lastMessage: toLastMessage(d.message) }
            : chat,
        );
      }),
      onChatEvent("chat:reaction", (d) => {
        if (d.chatId !== chatId) return;
        setMessages((prev) =>
          prev.map((m) => (m._id === d.messageId ? d.message : m)),
        );
      }),
      onChatEvent("chat:read", (d) => {
        if (d.chatId !== chatId) return;
        patchChatList((chat) => {
          const last = chat.lastMessage;
          if (!last || last.sender?._id === d.user._id) return chat;
          if (new Date(last.createdAt).getTime() > new Date(d.lastReadAt).getTime()) {
            return chat;
          }
          if ((chat.lastReadBy ?? []).some((r) => r._id === d.user._id)) {
            return chat;
          }
          return { ...chat, lastReadBy: [...(chat.lastReadBy ?? []), d.user] };
        });
      }),
      onChatEvent("chat:typing", (d) => {
        if (d.chatId !== chatId || d.sender?._id === currentUserId) return;
        const id = d.sender._id;
        setTypingUsers((prev) =>
          prev.some((t) => t.id === id)
            ? prev
            : [...prev, { id, name: d.sender.fullName }],
        );
        clearTimeout(typingTimersRef.current[id]);
        typingTimersRef.current[id] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
      }),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      Object.values(typingTimersRef.current).forEach(clearTimeout);
    };
  }, [chatId, currentUserId, queryClient]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, typingUsers.length]);

  // Close the "who reacted" popover on outside click.
  useEffect(() => {
    if (!reactionUsersFor) return undefined;
    const onMouseDown = (event) => {
      if (reactionsRef.current && !reactionsRef.current.contains(event.target)) {
        setReactionUsersFor(null);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [reactionUsersFor]);

  const handleReaction = (message, emoji) => {
    toggleReactionMutation.mutate({ chatId, messageId: message._id, emoji });
    setReactionPickerFor(null);
  };

  const onPickFiles = async (e) => {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!list.length) return;

    // Images max 5 MB; files and videos max 20 MB.
    const allowed = list.filter((file) => {
      const isImage = file.type?.startsWith("image/");
      const limit = isImage ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
      if (file.size > limit) {
        notify(
          `"${file.name}" exceeds the ${limit / 1024 / 1024} MB size limit`,
          { type: "error" },
        );
        return false;
      }
      return true;
    });

    if (!allowed.length) return;

    const totalBytes = allowed.reduce((sum, file) => sum + file.size, 0);
    let completedBytes = 0;
    setUpload({ active: true, percent: 0 });

    for (const file of allowed) {
      try {
        const result = await uploadToCloudinary(file, "chat", (loaded) => {
          const overall = ((completedBytes + loaded) / totalBytes) * 100;
          setUpload({
            active: true,
            percent: Math.min(Math.round(overall), 99),
          });
        });
        completedBytes += file.size;
        setUpload({
          active: true,
          percent: Math.round((completedBytes / totalBytes) * 100),
        });
        setPending((prev) => [
          ...prev,
          {
            name: file.name,
            url: result.secure_url,
            type: toAttachmentType(file.type),
            size: file.size,
          },
        ]);
      } catch (err) {
        notifyError(err, "Failed to upload file");
      }
    }

    setUpload({ active: false, percent: 100 });
  };

  const onTextChange = (value) => {
    setText(value);
    const now = Date.now();
    if (chatId && value.trim() && now - lastTypingAtRef.current > 400) {
      lastTypingAtRef.current = now;
      sendTyping(chatId);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!chatId || upload.active) return;
    if (!text.trim() && pending.length === 0) return;

    const payload = {
      text: text.trim() || undefined,
      attachments: pending.length ? pending : undefined,
    };

    const result = sendMessageSchema.safeParse(payload);
    if (!result.success) return;

    sendMutation.mutate({ chatId, data: result.data });
    setText("");
    setPending([]);
  };

  const startEdit = (m) => {
    setEditingId(m._id);
    setEditingText(m.text ?? "");
  };

  const saveEdit = (m) => {
    const result = updateMessageSchema.safeParse({ text: editingText.trim() });
    if (!result.success) return;
    updateMutation.mutate({
      chatId,
      messageId: m._id,
      data: result.data,
    });
    setEditingId(null);
  };

  const renderAttachments = (m) =>
    m.attachments?.length ? (
      <div className="mb-1 flex flex-col items-end gap-2">
        {m.attachments.map((a, idx) =>
          a.type === "image" ? (
            <a
              key={idx}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={a.url}
                alt={a.name}
                className="max-h-40 border border-border object-cover"
              />
            </a>
          ) : a.type === "video" ? (
            <video
              key={idx}
              src={a.url}
              controls
              className="max-h-56 w-full border border-border bg-background"
            />
          ) : (
            <a
              key={idx}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-2 border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted"
              title={a.name}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{a.name}</span>
            </a>
          ),
        )}
      </div>
    ) : null;

  if (chatsLoading) {
    return (
      <div className="-m-4 flex h-[calc(100dvh-3.5rem)] flex-col lg:-m-8 lg:h-screen">
        <div className="animate-pulse border-b border-border bg-card px-4 py-4 sm:px-6">
          <div className="h-5 w-40 bg-muted" />
        </div>
        <div className="flex-1 space-y-4 p-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 w-2/3 bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="grid min-h-[60vh] place-items-center py-8">
        <div className="max-w-sm border border-border bg-card px-6 py-12 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center border border-border bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="font-semibold text-foreground">No chat group yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You don&apos;t belong to an association yet. Once you join one, its
            group chat will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] flex-col lg:-m-8 lg:h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={chat.name} className="h-10 w-10 text-sm" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
              {chat.name}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {chat.members.length} members ·{" "}
              {socketStatus === "connected" ? "Active now" : "Connecting…"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMembersOpen(true)}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Members</span>
        </Button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3">
            {loadingInitial ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="h-10 w-2/3 animate-pulse bg-muted" />
              ))
            ) : messages.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No messages yet — say hello to your group!
                </p>
              </div>
            ) : (
              <>
                {hasMore && (
                  <div className="py-2 text-center">
                    {loadingOlder ? (
                      <span className="label-mono text-xs text-muted-foreground">
                        Loading older messages…
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={loadOlder}
                        className="label-mono text-accent hover:underline"
                      >
                        Load older messages
                      </button>
                    )}
                  </div>
                )}
                {messages.map((m, i) => {
                  const isOwn = m.sender?._id === currentUserId;
                  const isRecalled = Boolean(m.deleted);
                  const prev = messages[i - 1];
                  const showAuthor =
                    !isOwn && prev?.sender?._id !== m.sender?._id;

                  return (
                    <div
                      key={m._id}
                      className={`group flex items-start gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      {!isOwn && (
                      <Avatar
                        name={m.sender?.fullName}
                        verified={m.sender?.verified}
                        isAdmin={m.sender?.isAdmin}
                        className={`h-9 w-9 text-xs ${showAuthor ? "" : "invisible"}`}
                      />
                    )}
                    <div
                      className={`flex max-w-[85%] flex-col ${isOwn ? "items-end" : "items-start"}`}
                    >
                      {showAuthor && (
                        <span className="mb-0.5 px-1 text-xs text-muted-foreground">
                          {m.sender?.fullName}
                        </span>
                      )}

                      {editingId === m._id ? (
                        <div className="flex w-full items-center gap-2 border border-border bg-background p-2">
                          <input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit(m);
                              }
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(m)}
                            className="label-mono text-accent hover:underline"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="label-mono text-muted-foreground hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : isRecalled ? (
                        <>
                          <div className="border border-border bg-muted/60 px-4 py-2.5 text-sm italic leading-relaxed text-muted-foreground">
                            This message has been recalled
                          </div>
                          <span className="mt-0.5 px-1 text-xs text-muted-foreground">
                            {fmtTime(m.createdAt)}
                          </span>
                        </>
                      ) : (
                        <>
                          {renderAttachments(m)}
                          {m.text && (
                            <div
                              className={`border px-4 py-2.5 text-sm leading-relaxed ${
                                isOwn
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-muted text-foreground"
                              }`}
                            >
                              {m.text}
                            </div>
                          )}
                          {(m.reactions?.length ?? 0) > 0 && (
                            <div
                              ref={reactionsRef}
                              className="mt-0.5 flex flex-wrap items-center gap-1"
                            >
                              {m.reactions.map((reaction) => (
                                <button
                                  key={reaction.emoji}
                                  type="button"
                                  onClick={() =>
                                    setReactionUsersFor(
                                      reactionUsersFor === m._id
                                        ? null
                                        : m._id,
                                    )
                                  }
                                  className="inline-flex items-center gap-1 border border-border bg-card px-1.5 py-0.5 text-xs text-foreground hover:bg-muted"
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="label-mono text-muted-foreground">
                                    {reaction.count}
                                  </span>
                                </button>
                              ))}
                              {reactionUsersFor === m._id && (
                                <div className="relative">
                                  <div className="absolute bottom-full left-0 z-30 mb-1 min-w-[160px] border border-border bg-card p-2 shadow-lg">
                                    {(m.reactions ?? []).map((reaction) => (
                                      <div
                                        key={reaction.emoji}
                                        className="flex items-center gap-2 py-0.5 text-xs text-foreground"
                                      >
                                        <span>{reaction.emoji}</span>
                                        <span>
                                          {reaction.users
                                            .map((u) => u.fullName)
                                            .join(", ")}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="mt-0.5 flex items-center gap-1 px-1">
                            <span className="text-xs text-muted-foreground">
                              {fmtTime(m.createdAt)}
                              {isEdited(m) && " · edited"}
                            </span>
                            <div
                              className={`transition-opacity ${
                                reactionPickerFor === m._id
                                  ? "opacity-100"
                                  : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                              }`}
                            >
                              <ReactionPicker
                                isOwn={isOwn}
                                open={reactionPickerFor === m._id}
                                onOpenChange={(open) =>
                                  setReactionPickerFor(open ? m._id : null)
                                }
                                onPick={(emoji) => handleReaction(m, emoji)}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {isOwn && editingId !== m._id && !isRecalled && canModifyMessage(m) && (
                      <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          aria-label="Edit message"
                          className="grid h-7 w-7 place-items-center border border-border bg-background text-muted-foreground hover:bg-accent hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(m)}
                          aria-label="Delete message"
                          className="grid h-7 w-7 place-items-center border border-border bg-background text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
                })}
              </>
            )}

            {/* Seen status of the latest message — below the last message */}
            {!loadingInitial &&
              messages.length > 0 &&
              chat.lastReadBy?.length > 0 && (
                <div className="flex justify-end px-1 pt-0.5 text-xs text-muted-foreground">
                  Seen by{" "}
                  {chat.lastReadBy
                    .map((reader) =>
                      reader._id === currentUserId
                        ? "You"
                        : reader.fullName.split(" ")[0],
                    )
                    .join(", ")}
                </div>
              )}

            {/* Typing indicator — inside the thread, at the bottom */}
            {typingUsers.length > 0 && (
              <div className="flex items-end gap-2">
                {typingUsers.map((t) => (
                  <div key={t.id} className="flex items-center gap-2">
                    <div
                      className="grid h-8 w-8 place-items-center border border-border bg-muted text-[10px] font-semibold text-foreground"
                      style={{ borderRadius: "50%" }}
                      title={t.name}
                    >
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div
                      className="flex items-center gap-1 border border-border bg-muted px-3 py-2.5"
                      style={{ borderRadius: 9999 }}
                      aria-label={`${t.name} is typing`}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 bg-foreground"
                          style={{
                            borderRadius: "50%",
                            animation: `typing-wave 1.2s ease-in-out ${i * 0.15}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Members panel — desktop */}
        {membersOpen && (
          <aside className="hidden w-64 shrink-0 border-l border-border bg-card p-4 md:block">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Members</h2>
              <button
                type="button"
                onClick={() => setMembersOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close members"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {chat.members.map((member) => (
                <li key={member._id} className="flex items-center gap-3">
                  <Avatar name={member.fullName} verified={member.verified} isAdmin={member.isAdmin} className="h-9 w-9 text-xs" />
                  <div className="min-w-0">
                    <div className="truncate text-sm text-foreground">
                      {member.fullName}
                    </div>
                    <div className="label-mono text-muted-foreground">
                      {member._id === currentUserId ? "You" : "Member"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {/* Members panel — mobile */}
      {membersOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground-40 md:hidden"
          onClick={() => setMembersOpen(false)}
        >
          <div
            className="max-h-[75vh] w-full overflow-y-auto border-t border-border bg-card p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Members · {chat.members.length}
              </h2>
              <button
                type="button"
                onClick={() => setMembersOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close members"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-2">
              {chat.members.map((member) => (
                <li key={member._id} className="flex items-center gap-3">
                  <Avatar name={member.fullName} verified={member.verified} isAdmin={member.isAdmin} className="h-9 w-9 text-xs" />
                  <div className="min-w-0">
                    <div className="truncate text-sm text-foreground">
                      {member.fullName}
                    </div>
                    <div className="label-mono text-muted-foreground">
                      {member._id === currentUserId ? "You" : "Member"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="border-t border-border bg-card px-3 py-3 sm:px-6"
      >
        {pending.length > 0 && (
          <div className="mx-auto mb-2 flex max-w-5xl flex-wrap items-start gap-2">
            {pending.map((a, idx) => (
              <div key={`${a.name}-${idx}`} className="group relative">
                {a.type === "image" ? (
                  <img
                    src={a.url}
                    alt={a.name}
                    className="h-24 w-24 border border-border object-cover"
                  />
                ) : a.type === "video" ? (
                  <video
                    src={a.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-24 w-24 border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 border border-border bg-background px-2 text-center">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <span className="block w-full truncate text-[10px] text-foreground">
                      {a.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setPending((p) => p.filter((_, i) => i !== idx))
                  }
                  aria-label="Remove attachment"
                  className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center border border-border bg-background text-muted-foreground hover:bg-destructive hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {upload.active && (
          <div className="mx-auto mb-2 flex max-w-5xl items-center gap-3 border border-border bg-muted/30 p-3">
            <div className="h-1.5 flex-1 overflow-hidden bg-muted">
              <div
                className="h-full bg-accent transition-[width] duration-150"
                style={{ width: `${upload.percent}%` }}
              />
            </div>
            <span className="label-mono shrink-0 text-muted-foreground">
              Uploading… {upload.percent}%
            </span>
          </div>
        )}

        <div className="mx-auto flex max-w-5xl items-end gap-2">
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={upload.active}
            onChange={onPickFiles}
          />
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            multiple
            hidden
            disabled={upload.active}
            onChange={onPickFiles}
          />
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            disabled={upload.active}
            onChange={onPickFiles}
          />
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            disabled={upload.active}
            className="grid h-10 w-10 shrink-0 place-items-center border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Attach image"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            disabled={upload.active}
            className="grid h-10 w-10 shrink-0 place-items-center border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Attach video"
          >
            <Video className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={upload.active}
            className="grid h-10 w-10 shrink-0 place-items-center border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            rows={1}
            placeholder="Type a message…"
            className="max-h-32 min-h-[44px] flex-1 resize-none border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={(!text.trim() && pending.length === 0) || upload.active}
            className="h-10 w-10"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {confirmDelete && (
        <ArchiveConfirmModal
          title="Delete message?"
          confirmLabel="Delete"
          description={
            <>
              This will permanently remove this message for everyone in the
              group.
            </>
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteMutation.mutate(
              { chatId, messageId: confirmDelete._id },
              { onSuccess: () => setConfirmDelete(null) },
            );
          }}
        />
      )}

      <style>{`
        @keyframes typing-wave {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
