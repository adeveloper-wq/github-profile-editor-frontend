import { createApp } from 'vue'
import './tailwind.css'
import App from './App.vue'
import { routes } from './routes.js'
import { createRouter, createWebHistory } from 'vue-router'
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App)

const options = {
  position: POSITION.BOTTOM_CENTER,
  timeout: 8000
};

app.use(Toast, options);

const router = createRouter({
  history: createWebHistory(),
  routes,
})

app.use(router)
app.mount('#app')
