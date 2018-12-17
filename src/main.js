import Vue from 'vue'
import router from '@/routes/'
import App from '@/TheApp'
import store from './store'

// 注册组件
import Components from './components/'
Components.init()

// 注册插件
import Plugins from './plugins/'
Plugins.init()

/* eslint-disable no-new */
// var postmate = new Postmate.Model({})
// postmate.then(function (parent) {
//     console.log('ploter:', '确认握手请求。')
//     window.wrapHandshake = parent
//     new Vue({
//         el: '#app',
//         router,
//         store,
//         render: h => h(App)
//     })
// })

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})

if (__DEV__) {
    console.info('[当前环境] 开发环境')
    Vue.config.devtools = true
    Vue.config.productionTip = false
}

if (__PROD__) {
    console.info('[当前环境] 生产环境')
    Vue.config.devtools = false
}
