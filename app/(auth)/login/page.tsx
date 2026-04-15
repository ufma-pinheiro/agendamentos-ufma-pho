"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_failed') {
      setError('Falha na autenticação. Tente novamente.');
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="gradient-overlay"></div>
        <div className="pattern-overlay"></div>
      </div>

      <div className="login-container">
        <div className="login-brand">
          <div className="logo-animation">
            <div className="logo-circle">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="logo-pulse"></div>
          </div>
          <h1>Agenda UFMA</h1>
          <p>Sistema de Gestão de Espaços Acadêmicos</p>
        </div>

        <div className="login-card glass">
          <div className="login-content">
            <div id="loginGoogle" className="login-form active">
              <div className="google-prompt">
                <div className="google-icon-large">
                  <svg viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <h3>Acesso ao Sistema</h3>
                <p>Utilize sua conta Google institucional para acessar. Apenas e-mails autorizados têm permissão.</p>

                {error && (
                  <div className="error-message show" style={{ marginBottom: '1rem' }}>
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  className={`btn-google-login ${loading ? 'loading' : ''}`}
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-inline"></div>
                      <span>Redirecionando...</span>
                    </>
                  ) : (
                    <>
                      <i className="fab fa-google"></i>
                      Entrar com Google
                    </>
                  )}
                </button>
                <p className="login-notice" style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                  <i className="fas fa-lock" style={{ marginRight: "0.3rem" }}></i>
                  Acesso restrito a usuários cadastrados
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2026 Universidade Federal do Maranhão</p>
          <div className="security-badge">
            <i className="fas fa-shield-alt"></i>
            <span>Conexão Segura</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Suspense boundary required for useSearchParams in Next.js
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-page" />}>
      <LoginContent />
    </Suspense>
  );
}
