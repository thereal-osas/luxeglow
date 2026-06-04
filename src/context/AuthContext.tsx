// src/context/AuthContext.supabase.tsx
// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE REPLACEMENT for src/context/AuthContext.tsx
//
// Key differences from the mock version:
//   - Session is managed entirely by Supabase (no manual localStorage)
//   - onAuthStateChange listener keeps the app in sync automatically
//   - login/logout/register all delegate to api.ts which calls Supabase
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { api } from '../data/api';
import { supabase } from '../lib/supabase';

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_ERROR':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // ── 1. Restore any existing session on mount ──────────────────────────────
    // Supabase persists the session in localStorage automatically.
    // We just need to read the profile that goes with it.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;

          if (profile) {
            const user: User = {
              id: profile.id,
              firstName: profile.first_name,
              lastName: profile.last_name,
              email: profile.email,
              phone: profile.phone,
              role: profile.role,
              createdAt: profile.created_at,
            };
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: session.access_token } });
            return;
          }
        } catch (err) {
          // Profile not readable yet (e.g. RLS, race with upsert) — fall through to unauthenticated state
          console.warn('Could not fetch profile on session restore:', err);
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    // ── 2. Keep in sync if the session changes in another tab ─────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          dispatch({ type: 'LOGOUT' });
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) throw profileError;

            if (profile) {
              const user: User = {
                id: profile.id,
                firstName: profile.first_name,
                lastName: profile.last_name,
                email: profile.email,
                phone: profile.phone,
                role: profile.role,
                createdAt: profile.created_at,
              };
              dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: session.access_token } });
            }
          } catch (err) {
            // Profile may not exist yet if this SIGNED_IN fired before the
            // upsert in api.register() completed. The login flow will fetch
            // the profile explicitly, so this is safe to ignore.
            console.warn('onAuthStateChange: could not fetch profile:', err);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { user, token } = await api.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } catch (err) {
      dispatch({ type: 'LOGIN_ERROR' });
      throw err;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (data: any) => {
    await api.register(data);
    // No auto-login after register — user is redirected to /login
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
