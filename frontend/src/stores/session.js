import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ACCOUNTS, ROLES, ROLE_DARI_NUM } from '../constants'
import { isMock, getRoleOf } from '../services/shipmentService'
import { setAktif } from '../services/identity'

const KEY = 'jejakkirim.sesi'

function baca() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    return s && ROLES[s.role] && s.address ? s : null
  } catch {
    return null
  }
}

// Sesi = identitas yang sedang dipakai di perangkat ini, tersimpan di browser
export const useSessionStore = defineStore('session', () => {
  const awal = baca()
  const role = ref(awal?.role ?? null)
  const address = ref(awal?.address ?? null)
  const account = computed(() => address.value)

  function simpan() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ role: role.value, address: address.value }))
    } catch { /* abaikan */ }
  }

  function login(r, addr = ACCOUNTS[r]) {
    role.value = r
    address.value = addr
    simpan()
    setAktif(addr)
  }

  function logout() {
    role.value = null
    address.value = null
    try { localStorage.removeItem(KEY) } catch { /* abaikan */ }
    setAktif(null)
  }

  // Mencocokkan sesi dengan peran di smart contract (misalnya peran diganti atau dicabut Admin)
  async function verifikasi() {
    if (isMock || !address.value) return
    let n
    try {
      n = await getRoleOf(address.value)
    } catch {
      return // node tidak terjangkau, jangan keluarkan pengguna
    }
    const baru = ROLE_DARI_NUM[n]
    if (!baru) return logout()
    if (baru !== role.value) {
      role.value = baru
      simpan()
    }
  }

  return { role, account, login, logout, verifikasi }
})