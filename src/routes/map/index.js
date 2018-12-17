// 不同功能模块的路由应代码分离
export default [
    {
        path: '/',
        component: require('@/views/ploter/plot'),
        props: true,
        // 模块
        meta: {
            requireAuth: true // 声明需要验证权限
        }
    },
    { // 404
        path: '*',
        component: {
            beforeCreate () {
                console.log('Warn: 404')
                this.$router.replace('/')
            },
            template: '<div></div>'
        }
    }
]
