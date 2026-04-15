"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("leitor");
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        
        // Lógica de verificação de papel (conforme legacy/login.js)
        const email = session.user.email;
        
        if (email === 'tipinheiro@ufma.br') {
          setRole('dono');
        } else {
          const { data } = await supabase
            .from('usuarios')
            .select('role')
            .eq('email', email)
            .single();
          
          if (data) {
            setRole(data.role);
          }
        }
      }
      setLoading(false);
    }

    loadUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

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

  if (loading) return <aside className="sidebar loading-state"></aside>;

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
            {user?.user_metadata?.avatar_url ? (
               <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ borderRadius: '50%', width: '100%' }} />
            ) : (
               <i className="fas fa-user"></i>
            )}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <span id="userEmailDisplay" className="user-email">{user?.email || 'carregando...'}</span>
              <span id="userRoleDisplay" className="user-role">{role}</span>
            </div>
          )}
        </div>
        <button id="btnLogout" className="btn-logout" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
