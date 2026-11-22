<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useSessionStore } from './stores/session'
import { useNetworkStore } from './stores/network'
import { ROLES, short } from './constants'
import NetworkStatus from './components/NetworkStatus.vue'

const session = useSessionStore()
const net = useNetworkStore()
const router = useRouter()

// Memeriksa jaringan dan peran akun setiap 4 detik
let timer
onMounted(() => {
  net.refresh()
  timer = setInterval(() => {
    net.refresh()
    session.verifikasi()
  }, 4000)
})
onUnmounted(() => clearInterval(timer))

// Kembali ke halaman Masuk jika sesi berakhir (misalnya peran dicabut Admin)
watch(() => session.role, (r) => {
  if (!r) router.push('/')
})

function keluar() {
  session.logout()
  router.push('/')
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-in">
      <RouterLink to="/" class="brand">JejakKirim</RouterLink>
      <nav aria-label="Navigasi utama">
        <RouterLink v-if="session.role" :to="session.role === 'admin' ? '/admin' : '/dashboard'">Dashboard</RouterLink>
        <RouterLink v-else to="/">Masuk</RouterLink>
        <RouterLink to="/verifikasi">Verifikasi riwayat</RouterLink>
      </nav>
      <NetworkStatus />
      <div v-if="session.role" class="akun">
        <span class="peran">{{ ROLES[session.role] }}</span>
        <span class="alamat">{{ short(session.account) }}</span>
        <button class="ghost kecil" @click="keluar">Keluar</button>
      </div>
    </div>
  </header>
  <main class="page">
    <RouterView />
  </main>
</template>