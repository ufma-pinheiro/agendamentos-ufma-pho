import React from "react";

export default function HomePage() {
  return (
    <div id="abaCalendario" className="tab-content active">
      <div className="card calendar-card calendar-full">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "500px",
            gap: "1rem",
            color: "var(--text-secondary)",
          }}
        >
          <i
            className="fas fa-calendar-alt"
            style={{ fontSize: "3rem", color: "var(--primary-600)" }}
          ></i>
          <h2 style={{ fontWeight: 800 }}>Bem-Vindo à Nova Agenda UFMA</h2>
          <p>Fases 1 e 2 migradas! O calendário será implementado na Fase 3.</p>
        </div>
      </div>
    </div>
  );
}
