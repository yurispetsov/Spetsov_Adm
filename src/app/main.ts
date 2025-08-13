// src/app/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from './app.vue'
import './styles.css'
import { vCan } from '@/shared/rbac/vCan'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('can', vCan)
app.mount('#app')
