import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

// Router hazır olduktan sonra mount et (opsiyonel ama iyi pratik)
router.isReady().then(() => {
  app.mount('#app')
})
