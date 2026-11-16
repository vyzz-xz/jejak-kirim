import { onMounted, onUnmounted } from 'vue'
import { useShipmentStore } from '../stores/shipments'

// Memuat daftar saat halaman dibuka, lalu menyegarkannya berkala
export function useAutoRefresh(ms = 3000) {
    const store = useShipmentStore()
    let timer
    onMounted(() => {
        store.enter()
        timer = setInterval(() => {
        if (!store.loading) store.refresh()
        }, ms)
    })
    onUnmounted(() => clearInterval(timer))
    return store
}