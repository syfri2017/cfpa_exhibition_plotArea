import _constants from '../common/constants'
// import utils from '../common/utils'
import axios from 'axios'
import qs from 'qs'

/* axios 配置 */
let ENV = require('../../build/config/ENV')
// 根据env信息选择使用不同的服务器
if (ENV.__ENV__ === 'development') {
    axios.defaults.baseURL = _constants.SERVER_DOMAIN_DEV + _constants.SERVER_PATH
} else {
    if (ENV.__ENV__ === 'production') {
        axios.defaults.baseURL = _constants.SERVER_DOMAIN + _constants.SERVER_PATH
    } else {
        axios.defaults.baseURL = _constants.SERVER_DOMAIN_DEBUG + _constants.SERVER_PATH
    }
}
axios.defaults.timeout = _constants.AJAX_TIMEOUT
axios.interceptors.request.use(function (config) {
    // TODO: 使用axios的全局拦截器在请求发出之前插入用于验证登陆的token
    let handshakeModel = window.wrapHandshake.model
    config.headers['Authorization'] = handshakeModel.accessToken

    return config
}, function (err) {
    return Promise.reject(err)
})

const HEAD_FORM_URLENCODED = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
}
// const HEAD_FORM_DATA = {
//     headers: {
//         'Content-Type': 'multipart/form-data'
//     }
// }

export default {
    getImportImgData: (params) => {
        return new Promise((resolve, reject) => {
            axios.post(params.url, qs.stringify(params.params), HEAD_FORM_URLENCODED).then(function (response) {
                resolve(response.data)
            }).catch(function (error) {
                reject(error)
            })
        })
    }
}

