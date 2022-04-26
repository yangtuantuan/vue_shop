import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "login" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Home = () => import(/* webpackChunkName: "home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "home_welcome" */ '../components/Welcome.vue')

// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate" */ '../components/goods/Cate.vue')
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Params" */ '../components/goods/Params.vue')

// import GoodsList from '../components/goods/List.vue'
const GoodsList = () => import(/* webpackChunkName: "GoodsList" */ '../components/goods/List.vue')

// import GoodsAdd from '../components/goods/Add.vue'
const GoodsAdd = () => import(/* webpackChunkName: "GoodsAdd" */ '../components/goods/Add.vue')

// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order" */ '../components/order/Order.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    children: [
      { path: '/', redirect: '/welcome' },
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: GoodsAdd },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report },
      { path: '/*', component: Welcome }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const tokenStr = window.sessionStorage.getItem('token')
  if (to.path === '/login' || tokenStr) {
    return next()
  }
  return next('/login')
})

export default router
