<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useSessionStore } from './stores/session'
import { ROLES, short } from './constants'

const session = useSessionStore()
</script>

<template>
  <header class="topbar">
    <div class="topbar-in">
      <RouterLink to="/" class="brand">JejakKirim</RouterLink>
      <nav aria-label="Navigasi utama">
        <RouterLink to="/">Pilih Peran</RouterLink>
        <RouterLink to="/verifikasi">Verifikasi Riwayat</RouterLink>
      </nav>
      <div v-if="session.role" class="whoami">
        <span>{{ ROLES[session.role] }}</span>
        <span class="addr-chip">{{ short(session.account) }}</span>
      </div>
    </div>
  </header>
  <main class="page">
    <RouterView />
  </main>
</template>