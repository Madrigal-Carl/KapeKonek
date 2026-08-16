import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

const CLOSE_EVENT = "row-actions:close";

// Row action dropdown used by every data table. The menu renders through a
// portal with fixed positioning so it is never clipped by table containers
// and always floats above the page. Only one menu is open at a time, it
// closes on outside clicks/Escape/selection, and it is keyboard-navigable.
export function RowActions({ actions = [], align = "right" }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const id = useId();

  const close = () => {
    setOpen(false);
    setMenuPos(null);
    triggerRef.current?.focus();
  };

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPos({
      top: Math.min(rect.bottom + 4, window.innerHeight - 240),
      left: rect.left,
      right: align === "right" ? window.innerWidth - rect.right : undefined,
    });
  }, [align]);

  useEffect(() => {
    if (!open) return undefined;

    updatePosition();
    const reposition = () => updatePosition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    const closeOthers = (event) => {
      if (event.detail !== id) setOpen(false);
    };
    const onMouseDown = (event) => {
      if (
        rootRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener(CLOSE_EVENT, closeOthers);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener(CLOSE_EVENT, closeOthers);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [id, open, updatePosition]);

  const focusItem = (index) => {
    const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
    items?.[index]?.focus();
  };

  const openMenu = () => {
    if (!open) {
      window.dispatchEvent(new CustomEvent(CLOSE_EVENT, { detail: id }));
      updatePosition();
      setOpen(true);
    }
  };

  const toggleMenu = () => {
    if (open) {
      close();
    } else {
      openMenu();
    }
  };

  const selectAction = (action) => {
    close();
    action?.onClick?.();
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) {
        openMenu();
        window.setTimeout(() => focusItem(0), 0);
      }
    }
  };

  const handleItemKeyDown = (event, index) => {
    const count = actions.length;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem((index + 1) % count);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem((index - 1 + count) % count);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectAction(actions[index]);
    } else if (event.key === "Escape") {
      close();
    }
  };

  if (actions.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleMenu}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex h-8 w-8 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-white"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: menuPos.top,
              ...(menuPos.right !== undefined
                ? { right: menuPos.right }
                : { left: menuPos.left }),
              zIndex: 9999,
            }}
            className="w-44 border border-border bg-card p-1 shadow-lg"
          >
            {actions.map((action, index) => (
              <button
                key={action.key}
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={action.disabled}
                onClick={() => selectAction(action)}
                onKeyDown={(event) => handleItemKeyDown(event, index)}
                className={[
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-40",
                  action.danger
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-foreground hover:bg-muted",
                ].join(" ")}
              >
                {action.icon ? <action.icon className="h-4 w-4 shrink-0" /> : null}
                {action.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
