import Vue from 'vue'
import App from './App.vue'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import './plugins/filters'
import './plugins/axios'
import './plugins/element'
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
