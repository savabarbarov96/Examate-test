// import { create } from 'zustand';
// // import { User } from '@/utils/types.js';

// interface AuthActions {
//   setUser: (user: User) => void;
//   setIsAuthenticated: (isAuthenticated: boolean) => void;
//   setAccessToken: (accessToken: string) => void;
//   setRefreshToken: (refreshToken: string) => void;
//   logout: () => void;
// }

// interface AuthContextType {
//   user: User | null;
//   refreshToken: string;
//   accessToken: string;
//   // isLoading: boolean;
//   isAuthenticated: boolean;
//   actions: AuthActions;
// }

// export const useAuthStore = create<AuthContextType>((set) => ({
//   user: null,
//   refreshToken: '',
//   accessToken: '',
//   isAuthenticated: false,
//   actions: {
//     setUser: (user: User) => set(() => ({ user })),
//     setIsAuthenticated: (isAuthenticated: boolean) => set(() => ({ isAuthenticated })),
//     setAccessToken: (accessToken: string) => set(() => ({ accessToken })),
//     setRefreshToken: (refreshToken: string) => set(() => ({ refreshToken })),
//     logout: () =>
//       set(() => ({
//         user: null,
//         refreshToken: '',
//         accessToken: '',
//         isLoading: false,
//         isAuthenticated: false,
//       })),
//   },
// }));

// export const useAuthActions = () => useAuthStore((state) => state.actions);

// export const useAccessToken = () => useAuthStore((state) => state.accessToken);
// export const useRefreshToken = () => useAuthStore((state) => state.refreshToken);
// export const useUser = () => useAuthStore((state) => state.user);
// export const useAuth = () => useAuthStore((state) => state.isAuthenticated);