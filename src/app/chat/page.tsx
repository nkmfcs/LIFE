"use client";

import { useState, useRef, useEffect } from "react";
import { PageTitle, Card } from "@/components/ui";
import { Icon } from "@/components/icons";

type Message = { role: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: next.slice(0, -1).map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.text ?? "Нет ответа." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Ошибка при запросе к Claude." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <PageTitle title="Чат" subtitle="Спроси Claude о своих данных" />
      <div className="col" style={{ gap: 12 }}>
        <Card delay={40} style={{ minHeight: 320, maxHeight: "60vh", overflowY: "auto" }}>
          {messages.length === 0 && (
            <p className="t-body" style={{ color: "var(--ink-mute)", textAlign: "center", padding: "32px 0" }}>
              Напиши что-нибудь — например: «Как я спал на этой неделе?»
            </p>
          )}
          <div className="col" style={{ gap: 12 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: m.role === "user" ? "var(--accent)" : "var(--paper-sunk)",
                    color: m.role === "user" ? "var(--paper)" : "var(--ink)",
                    fontSize: 14,
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px 14px 14px 4px",
                    background: "var(--paper-sunk)",
                    color: "var(--ink-mute)",
                    fontSize: 14,
                  }}
                >
                  Думаю…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </Card>

        <Card delay={80} style={{ padding: "10px 14px" }}>
          <div className="row center" style={{ gap: 10 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Сообщение… (Enter — отправить)"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: "var(--ink)",
                resize: "none",
                lineHeight: 1.5,
                minHeight: 40,
                maxHeight: 120,
                fontFamily: "inherit",
              }}
              rows={1}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--accent)",
                border: "none",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                opacity: loading || !input.trim() ? 0.4 : 1,
                transition: "opacity 0.2s",
                flexShrink: 0,
              }}
            >
              <Icon name="chevron" size={18} stroke={2} style={{ color: "var(--paper)" }} />
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
