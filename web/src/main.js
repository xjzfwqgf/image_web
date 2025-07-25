import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

// 全局加载 config.json 设置后端 API 地址
async function loadApiConfig() {
  try {
    const res = await fetch('/config.json');
    if (res.ok) {
      const config = await res.json();
      if (config && config.apiBaseUrl) {
        axios.defaults.baseURL = config.apiBaseUrl;
      }
    }
  } catch (e) {
    // 忽略错误，默认使用相对路径
  }
}

loadApiConfig().finally(() => {
  createApp(App).mount('#app');
});
