import Vue from 'vue'
// UI 组件库
import iview from 'iview'
import '@/assets/style/common/_reset_iview.less'
// import 'iview/dist/styles/iview.css'

function init () {
    Vue.use(iview)
    iview.LoadingBar.config({
        color: '#ffc800',
        failedColor: '#ff4949',
        height: 2
    })
}

export default {
    init
}
