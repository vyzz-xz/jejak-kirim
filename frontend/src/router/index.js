import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '../stores/session'
import PilihPeranView from '../views/PilihPeranView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: PilihPeranView },
    { path: '/dashboard', component: () => import('../views/DashboardView.vue'), meta: { auth: true } },
    { path: '/admin', component: () => import('../views/AdminView.vue'), meta: { auth: true, role: 'admin' } },
    { path: '/verifikasi', component: () => import('../views/VerifikasiView.vue') },
  ],
})

// Halaman kerja hanya bisa dibuka setelah masuk dengan peran yang sesuai
router.beforeEach((to) => {
  const session = useSessionStore()
  if (to.meta.auth && !session.role) return '/'
  if (to.meta.role && session.role !== to.meta.role) return '/'
  if (to.path === '/dashboard' && session.role === 'admin') return '/admin'
})

export default router