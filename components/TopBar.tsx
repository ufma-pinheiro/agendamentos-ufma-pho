"use client";
import React from 'react';

const TopBar = () => {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button className="btn-icon menu-toggle" id="menuToggle">
          <i className="fas fa-bars"></i>
        </button>
        <div className="breadcrumb">
          <span className="page-title" id="pageTitle">Calendário</span>
        </div>
      </div>

      <div className="top-bar-center">
        <div className="legend-filter-chips" id="legendFilterChips">
          <button className="legend-chip active" data-filter="all">
            <span className="chip-dot" style={{ background: 'var(--primary-500)' }}></span>Todos
          </button>
          <button className="legend-chip" data-filter="Engenharia">
            <span className="chip-dot" style={{ background: 'var(--eng-color)' }}></span>Engenharia
          </button>
          <button className="legend-chip" data-filter="Licenciaturas">
            <span className="chip-dot" style={{ background: 'var(--lic-color)' }}></span>Licenciaturas
          </button>
          <button className="legend-chip" data-filter="Saúde">
            <span className="chip-dot" style={{ background: 'var(--sau-color)' }}></span>Saúde
          </button>
        </div>
      </div>

      <div className="top-bar-right">
        <div className="search-box">
          <i className="fas fa-search search-icon"></i>
          <input type="search" id="buscaGlobal" placeholder="Buscar... (/)" autoComplete="off" />
        </div>

        <div className="action-group">
          <button id="btnToggleTheme" className="btn-icon btn-theme" title="Alternar tema">
            <i className="fas fa-moon"></i>
          </button>
          <button id="btnRefreshDados" className="btn-icon btn-refresh" title="Sincronizar dados">
            <i className="fas fa-sync-alt"></i>
          </button>
          <button id="btnNovoAgendamento" className="btn-primary" title="Novo agendamento (N)">
            <i className="fas fa-plus"></i>
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
