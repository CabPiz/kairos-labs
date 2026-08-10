import type { CSSProperties } from "react";

export const toggleButtonBase: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "6px",
  padding: "0.35rem 0.75rem",
  cursor: "pointer",
  color: "rgba(255,255,255,0.75)",
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  fontFamily: "var(--font-inter), sans-serif",
  transition: "border-color 0.2s, background 0.2s",
};

export const toggleButtonHover: CSSProperties = {
  borderColor: "rgba(255,255,255,0.35)",
  background: "rgba(255,255,255,0.1)",
};

export const toggleButtonRest: CSSProperties = {
  borderColor: "rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
};

export const menuBase: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 6px)",
  right: 0,
  minWidth: "140px",
  background: "#0b1221",
  border: "1px solid rgba(59,130,246,0.25)",
  borderRadius: "8px",
  padding: "4px",
  margin: 0,
  listStyle: "none",
  zIndex: 100,
  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
};

export const menuItemActive: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "0.5rem 0.75rem",
  background: "rgba(59,130,246,0.12)",
  borderRadius: "5px",
  cursor: "pointer",
  color: "#fff",
  fontSize: "0.8rem",
  fontWeight: 700,
  fontFamily: "var(--font-inter), sans-serif",
  transition: "background 0.15s, color 0.15s",
  listStyle: "none",
};

export const menuItemInactive: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "0.5rem 0.75rem",
  background: "transparent",
  borderRadius: "5px",
  cursor: "pointer",
  color: "rgba(255,255,255,0.65)",
  fontSize: "0.8rem",
  fontWeight: 400,
  fontFamily: "var(--font-inter), sans-serif",
  transition: "background 0.15s, color 0.15s",
  listStyle: "none",
};

export const caretStyle = (open: boolean): CSSProperties => ({
  display: "inline-block",
  width: "0",
  height: "0",
  borderLeft: "4px solid transparent",
  borderRight: "4px solid transparent",
  borderTop: "5px solid rgba(255,255,255,0.5)",
  transition: "transform 0.2s",
  transform: open ? "rotate(180deg)" : "none",
});
