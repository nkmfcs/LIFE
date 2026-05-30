"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  const isDbError =
    error.message.includes("Can't reach database") ||
    error.message.includes("Connection") ||
    error.message.includes("ECONNREFUSED") ||
    error.message.includes("5433");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 18, padding: "80px 32px", minHeight: "60vh" }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: "var(--danger-bg)", color: "var(--danger-deep)",
        display: "grid", placeItems: "center",
        border: "1px solid var(--line)",
      }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 28 }}>!</span>
      </div>
      <h2 className="t-d2">{isDbError ? "База не отвечает" : "Что-то пошло не так"}</h2>
      <p className="t-body" style={{ color: "var(--ink-soft)", maxWidth: 460, lineHeight: 1.6 }}>
        {isDbError ? (
          <>Похоже, SSH-туннель отвалился. Открой PowerShell и подними его снова: <code style={{ background: "var(--paper-sunk)", padding: "2px 6px", borderRadius: 4 }}>ssh -L 5433:localhost:5432 uz-user@89.126.221.198</code> — потом обнови страницу.</>
        ) : (
          <>Ошибка: {error.message}</>
        )}
      </p>
      <button className="btn btn--primary" onClick={reset}>Попробовать снова</button>
    </div>
  );
}
