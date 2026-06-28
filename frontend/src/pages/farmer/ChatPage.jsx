import { useEffect, useRef, useState } from "react";
import {
  Check,
  Paperclip,
  Send,
  Users,
  X,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

const MEMBERS = [
  { name: "Maria Santos", avatar: "MS", verified: true },
  { name: "Juan Dela Cruz", avatar: "JD", verified: true },
  { name: "Ana Reyes", avatar: "AR", verified: false },
  { name: "You", avatar: "YO", verified: false },
];
const SEED = [
  {
    id: "1",
    author: "Maria Santos",
    avatar: "MS",
    verified: true,
    text: "Good morning! Anyone harvesting this week?",
    at: "08:12",
  },
  {
    id: "2",
    author: "Juan Dela Cruz",
    avatar: "JD",
    verified: true,
    text: "Starting Robusta picks tomorrow on the south lot.",
    at: "08:15",
  },
  {
    id: "3",
    author: "Ana Reyes",
    avatar: "AR",
    verified: false,
    text: "Nice \u2014 I can lend extra baskets if you need.",
    at: "08:17",
  },
  {
    id: "4",
    author: "You",
    avatar: "YO",
    verified: false,
    text: "Count me in for Thursday. I'll bring the truck.",
    at: "08:20",
    self: true,
  },
  {
    id: "5",
    author: "Maria Santos",
    avatar: "MS",
    verified: true,
    text: "Perfect. Let's meet at the drying patio 6am.",
    at: "08:22",
  },
];
function MemberAvatar({
  initials,
  verified,
  className,
  badgeClassName,
  iconClassName,
}) {
  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={[
          "grid place-items-center rounded-full bg-muted font-semibold text-foreground",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {initials}
      </div>
      {verified && (
        <span
          className={[
            "absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-background",
            badgeClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Check className={iconClassName} />
        </span>
      )}
    </div>
  );
}
export function ChatPage() {
  const [messages, setMessages] = useState(SEED);
  const [text, setText] = useState("");
  const [pending, setPending] = useState([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const imageRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);
  const handleFiles = (files, kind) => {
    if (!files) return;
    const next = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: kind,
    }));
    setPending((p) => [...p, ...next]);
  };
  const send = (e) => {
    e.preventDefault();
    if (!text.trim() && pending.length === 0) return;
    const now = /* @__PURE__ */ new Date();
    const at = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        author: "You",
        avatar: "YO",
        verified: false,
        text: text.trim() || void 0,
        attachments: pending.length ? pending : void 0,
        at,
        self: true,
      },
    ]);
    setText("");
    setPending([]);
  };
  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] flex-col lg:-m-8 lg:h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
            HG
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
              Harvest Group
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {MEMBERS.length} members · Active now
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMembersOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Members</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3">
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const showAuthor = !m.self && prev?.author !== m.author;
              return (
                <div
                  key={m.id}
                  className={`flex items-end gap-2 ${m.self ? "justify-end" : "justify-start"}`}
                >
                  {!m.self && (
                    <MemberAvatar
                      initials={m.avatar}
                      verified={m.verified}
                      className={`h-9 w-9 text-sm ${prev?.author === m.author ? "invisible" : ""}`}
                      badgeClassName="h-4 w-4"
                      iconClassName="h-2.5 w-2.5"
                    />
                  )}
                  <div
                    className={`flex max-w-[85%] flex-col ${m.self ? "items-end" : "items-start"}`}
                  >
                    {showAuthor && (
                      <span className="mb-0.5 px-1 text-sm text-muted-foreground">
                        {m.author}
                      </span>
                    )}
                    {m.attachments?.map((a, idx) =>
                      a.type === "image" ? (
                        <img
                          key={idx}
                          src={a.url}
                          alt={a.name}
                          className="mb-1 max-h-64 rounded-2xl border border-border object-cover"
                        />
                      ) : (
                        <a
                          key={idx}
                          href={a.url}
                          download={a.name}
                          className="mb-1 inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-base text-foreground hover:bg-muted"
                        >
                          <FileText className="h-5 w-5" />
                          {a.name}
                        </a>
                      ),
                    )}
                    {m.text && (
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-base leading-relaxed ${m.self ? "bg-accent text-accent-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}
                      >
                        {m.text}
                      </div>
                    )}
                    <span className="mt-0.5 px-1 text-xs text-muted-foreground">
                      {m.at}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Members panel */}
        {membersOpen && (
          <aside className="hidden w-64 shrink-0 border-l border-border bg-card p-4 md:block">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Members</h2>
              <button
                onClick={() => setMembersOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {MEMBERS.map((m) => (
                <li key={m.name} className="flex items-center gap-3">
                  <MemberAvatar
                    initials={m.avatar}
                    verified={m.verified}
                    className="h-10 w-10 text-sm"
                    badgeClassName="h-4 w-4"
                    iconClassName="h-2.5 w-2.5"
                  />
                  <span className="text-base text-foreground">{m.name}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={send}
        className="border-t border-border bg-card px-3 py-3 sm:px-6"
      >
        {pending.length > 0 && (
          <div className="mx-auto mb-2 flex max-w-5xl flex-wrap gap-2">
            {pending.map((a, idx) => (
              <div
                key={idx}
                className="group relative flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
              >
                {a.type === "image" ? (
                  <ImageIcon className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                <span className="max-w-[140px] truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setPending((p) => p.filter((_, i) => i !== idx))
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mx-auto flex max-w-5xl items-end gap-2">
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              handleFiles(e.target.files, "image");
              e.target.value = "";
            }}
          />
          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              handleFiles(e.target.files, "file");
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Attach image"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(e);
              }
            }}
            rows={1}
            placeholder="Aa"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-3xl border border-border bg-background px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={!text.trim() && pending.length === 0}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
