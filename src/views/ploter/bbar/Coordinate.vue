<template>
    <div class="app-status-bar-coordinate-wrap">
        <div class="app-status-bar-coordinate" v-if="coordinate != null">
            <div class="app-status-bar-coordinate-system">坐标系：{{coordinate.system}}</div>
            <div class="app-status-bar-coordinate-value"
                v-if="coordinate.x != null || coordinate.y != null"
            >
                <span>X：{{viewCoordinate.x}}px</span>
                <span>Y：{{viewCoordinate.y}}px</span>
            </div>
            <div class="app-status-bar-coordinate-tip"
                v-else
            >
                鼠标当前位于画布之外
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppPloterBBarCoordinate',
        props: ['coordinate'],
        data () {
            return {
                x: 0,
                y: 0
            }
        },
        computed: {
            viewCoordinate () {
                return {
                    x: Math.round(this.coordinate.x),
                    y: Math.round(this.coordinate.y)
                }
            }
        }
    }
</script>
