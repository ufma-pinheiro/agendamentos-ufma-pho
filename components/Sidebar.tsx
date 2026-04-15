"use client";
import React, { useState } from 'react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Mock de nível de acesso (será dinâmico na Fase 2 com Supabase)
  const role: string = "editor"; 

  const mainNavItems = [
    { id: 'abaCalendario', label: 'Calendário', icon: 'fa-calendar-alt' },
    { id: 'abaMeusEventos', label: 'Meus Eventos', icon: 'fa-user-check', visible: role !== 'leitor' },
    { id: 'abaResumo', label: 'Resumo Mensal', icon: 'fa-list-alt' },
  ];

  const adminNavItems = [
    { id: 'abaDashboard', label: 'Dashboard', icon: 'fa-chart-pie', visible: role === 'dono' || role === 'editor' },
    { id: 'abaRelatorios', label: 'Relatórios', icon: 'fa-file-export', visible: role === 'dono' || role === 'editor' },
    { id: 'abaUsuarios', label: 'Usuários', icon: 'fa-users-cog', visible: role === 'dono' },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <i className="fas fa-calendar-check"></i>
        </div>
        {!isCollapsed && (
          <div className="brand-text">
            <h1>Agenda UFMA</h1>
            <span>Gestão de Espaços</span>
          </div>
        )}
        <button 
          className="btn-collapse-sidebar" 
          id="btnCollapseSidebar" 
          title="Recolher menu"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className={`fas ${isCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-label">Principal</span>
          {mainNavItems.filter(item => item.visible !== false).map(item => (
            <button key={item.id} className={`nav-item ${item.id === 'abaCalendario' ? 'active' : ''}`}>
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
              {item.id === 'abaCalendario' && <div className="nav-indicator"></div>}
            </button>
          ))}
        </div>

        {(role === 'dono' || role === 'editor') && (
          <div className="nav-section admin-only">
            <span className="nav-label">Administração</span>
            {adminNavItems.filter(item => item.visible).map(item => (
              <button key={item.id} className="nav-item">
                <i className={`fas ${item.icon}`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar" id="userAvatar">
            <i className="fas fa-user"></i>
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <span id="userEmailDisplay" className="user-email">usuario@ufma.br</span>
              <span id="userRoleDisplay" className="user-role">{role}</span>
            </div>
          )}
        </div>
        <button id="btnLogout" className="btn-logout">
          <i className="fas fa-sign-out-alt"></i>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
