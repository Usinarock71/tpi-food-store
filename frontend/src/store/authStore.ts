import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPublic } from '../features/auth';
import { authApi } from '../features/auth';

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username: string, password: string) => {
        await authApi.login(username, password);
        const perfil = await authApi.getMe();
        set({ usuario: perfil, cargando: false });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const perfil = await authApi.getMe();
          set({ usuario: perfil, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);