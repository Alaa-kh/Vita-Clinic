export const ROUTES = {
  home: '/',
  care: '/care',
  careDetail: '/care/:id',
  favorites: '/favorites',
  createCare: '/listings/new',
  login: '/login',
  register: '/register',
  profile: '/profile',
} as const

export function careDetailPath(id: string): string {
  return `/care/${id}`
}
