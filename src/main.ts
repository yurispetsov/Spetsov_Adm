// site/src/main.ts — безопасный старт без зависания на router.isReady()
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Глобальный лог ошибок, чтобы видеть любые падения во время навигации
const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue error]', err, info)
}
app.config.warnHandler = (msg, instance, trace) => {
  // не скрываем, просто сводим в консоль
  console.warn('[Vue warn]', msg, trace)
}

// ВАЖНО: монтируем СРАЗУ, без ожидания router.isReady(), чтобы не зависнуть
app.use(router)
app.mount('#app')

// На всякий случай логируем фэйл промисов при динамическом импорте страниц
window.addEventListener('unhandledrejection', (e) => {
  console.error('[unhandledrejection]', e.reason || e)
})
