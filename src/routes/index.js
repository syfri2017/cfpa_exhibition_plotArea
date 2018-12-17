import Vue from 'vue'
import VueRouter from 'vue-router'
// import store from '../store'
import routes from './map/' // 路由映射
import iView from 'iview'
import _utils from '../common/utils'
// import _constants from '../common/constants'
Vue.use(VueRouter)

const router = new VueRouter({
    // mode: 'history',
    // mode: 'hash|history|abstract',
    // base: '/',
    // linkActiveClass: 'router-link-active',
    // scrollBehavior: fn
    routes
})

router.beforeEach((to, from, next) => {
    // if (to.meta.requireAuth) {
    //     let isLogin = _utils.getCookie('au')
    //     if (isLogin) {
    //         // 取回登录人信息
    //         let currentAppUser = store.getters.appUser
    //         if (!currentAppUser) {
    //             store.commit('updateAppUser', {
    //                 appUser: JSON.parse(localStorage.getItem('au'))
    //             })
    //         }
    //         // COOKIE 充值
    //         _utils.setCookie('au', true, _constants.COOKIE_TERM)

    //         next()
    //     } else {
    //         // 跳到登录页面，并记录当前页面路由信息，用于登录后跳回
    //         let nextPath = to.fullPath
    //         next({
    //             path: '/login',
    //             query: { redirect: nextPath }
    //         })
    //         // 清除保存的用户信息
    //         localStorage.removeItem('au')
    //     }
    // } else {
    //     next()
    // }
    iView.LoadingBar.start()
    _utils.setTitle(to.meta.title)
    next()
})

router.afterEach(() => {
    iView.LoadingBar.finish()
    window.scrollTo(0, 0)
})

export default router
