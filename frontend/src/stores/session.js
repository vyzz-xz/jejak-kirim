import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ACCOUNTS, ROLES } from '../constants'

const KEY = 'jejakkirim.peran'

// Membaca peran tersimpan. Aman jika penyimpanan browser tidak tersedia.
function baca() {
  try {
    const r = localStorage.getItem(KEY)
    return r && ROLES[r] ? r : null
  } catch {
    return null
  }
}

// Menyimpan peran di browser, jadi refresh tidak mengeluarkan pengguna
export const useSessionStore = defineStore('session', () => {
  const role = ref(baca())
  const account = computed(() => (role.value ? ACCOUNTS[role.value] : null))

  function login(r) {
    role.value = r
    try { localStorage.setItem(KEY, r) } catch { /* abaikan */ }
  }
  function logout() {
    role.value = null
    try { localStorage.removeItem(KEY) } catch { /* abaikan */ }
  }

  return { role, account, login, logout }
})