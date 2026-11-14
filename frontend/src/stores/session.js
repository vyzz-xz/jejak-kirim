import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ACCOUNTS } from '../constants'

// Menyimpan peran yang sedang dipakai di perangkat ini
export const useSessionStore = defineStore('session', () => {
    const role = ref(null)
    const account = computed(() => (role.value ? ACCOUNTS[role.value] : null))
    const setRole = (r) => { role.value = r }
    return { role, account, setRole }
})