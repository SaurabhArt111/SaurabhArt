
import { useEffect } from "react";
import { Link } from "react-router-dom";
import TunnelType from "../components/lab/TunnelType";
import { useLang } from "../lib/i18n";

function LabBar() {
  const { t } = useLang();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "18px 28px",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "var(--ink-3)",
      }}
    >
      <Link to="/" style={{ color: "var(--ink-2)", whiteSpace: "nowrap" }}>
        {t("lab.back")}
      </Link>
      <span style={{ textAlign: "right" }}>{t("lab.hint")}</span>
    </div>
  );
}

export default function TunnelLab() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Tunnel Type — Lab · Saurabh";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <main
      style={{
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <LabBar />

      <div style={{ flex: 1, minHeight: 0 }}>
        <TunnelType text="SAURABH" />
      </div>
    </main>
  );
}
