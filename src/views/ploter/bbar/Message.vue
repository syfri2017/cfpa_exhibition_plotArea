<template>
    <div class="app-status-bar-current-wrap">
        <div class="app-status-bar-current" v-if="plotTool != null">
            <img class="app-status-bar-current-icon"
                v-if="plotTool.src"
                :src="plotTool.src + '.png'" />
            <h6 class="app-status-bar-current-title">{{plotTool.name}}</h6>
            <!-- <div class="app-curren-t-desc">{{plotToolDesc}}</div> -->
            <div class="app-status-bar-current-tip">
                <template v-if="isLine">
                    按下 <code>ESC</code> 键结束绘制，
                </template>
                单击鼠标右键退出当前工具
            </div>
        </div>
        <div class="app-status-bar-current" v-else>
            <div class="app-status-bar-current-tip">当前未选中标绘工具</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppPloterBBarMessage',
        props: ['plotTool'],
        computed: {
            isLine () {
                return this.plotTool.type === 'line' || this.plotTool.type === 'arrowLine'
            },
            plotToolDesc () {
                let desc = this.plotTool.desc
                if (!desc) {
                    desc = '此工具没有描述信息'
                }
                return desc
            }
        }
    }
</script>
