import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '../stores/session'
import PilihPeranView from '../views/PilihPeranView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: PilihPeranView },
    { path: '/admin', component: () => import('../views/AdminView.vue'), meta: { role: 'admin' } },
    { path: '/pengirim', component: () => import('../views/PengirimView.vue'), meta: { role: 'pengirim' } },
    { path: '/gudang', component: () => import('../views/GudangView.vue'), meta: { role: 'gudang' } },
    { path: '/kurir', component: () => import('../views/KurirView.vue'), meta: { role: 'kurir' } },
    { path: '/penerima', component: () => import('../views/PenerimaView.vue'), meta: { role: 'penerima' } },
    { path: '/verifikasi', component: () => import('../views/VerifikasiView.vue') },
  ],
})

// Halaman peran hanya bisa dibuka kalau peran yang dipilih cocok
router.beforeEach((to) => {
  if (to.meta.role && useSessionStore().role !== to.meta.role) return '/'
})

export default router