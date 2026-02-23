// =============================================================
// Zustand - User Store
// =============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, Curriculum } from "@/types";

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  role: Role | null;
  curriculum: Curriculum | null;
  avatar: string | null;
  isAuthenticated: boolean;
  setUser: (user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    curriculum?: Curriculum | null;
    avatar?: string | null;
  }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      email: null,
      role: null,
      curriculum: null,
      avatar: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          ...user,
          curriculum: user.curriculum ?? null,
          avatar: user.avatar ?? null,
          isAuthenticated: true,
        }),

      clearUser: () =>
        set({
          id: null,
          name: null,
          email: null,
          role: null,
          curriculum: null,
          avatar: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "lms-user-store",
      partialize: (state) => ({
        id: state.id,
        name: state.name,
        email: state.email,
        role: state.role,
        curriculum: state.curriculum,
        avatar: state.avatar,
      }),
    }
  )
);
