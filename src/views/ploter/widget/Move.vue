<template>
    <div class="app-ploter-widget-move">
        <div class="up-btn" @click="onMoveTo('up')"></div>
        <div class="right-btn" @click="onMoveTo('right')"></div>
        <div class="left-btn" @click="onMoveTo('left')"></div>
        <div class="down-btn" @click="onMoveTo('down')"></div>
    </div>
</template>

<script>
    export default {
        name: 'AppPloterWidgetMove',
        data () {
            return {
                step: 100
            }
        },
        // watch: {},
        // mounted () {},
        methods: {
            onMoveTo (direction) {
                var wrap = document.querySelector('.app-ploter-main-canvas')
                let x = wrap.scrollLeft
                let y = wrap.scrollTop
                switch (direction) {
                case 'up':
                    wrap.scrollTo(x, y - this.step)
                    break
                case 'right':
                    wrap.scrollTo(x + this.step, y)
                    break
                case 'down':
                    wrap.scrollTo(x, y + this.step)
                    break
                case 'left':
                    wrap.scrollTo(x - this.step, y)
                    break
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
.app-ploter-widget-move {
    position: absolute;
    top: 24px;
    right: 40px;
    z-index: 99;
    width: 52px;
    height: 52px;
    border-radius: 26px;
    box-shadow: 0 0 8px rgba(0,0,0,0.3);
    font-size: 0;
    transform: rotate(45deg);
    .up-btn,
    .right-btn,
    .left-btn,
    .down-btn {
        display: inline-block;
        background-image: url('/static/images/widget/scale/btn_direction.png');
        width: 26px;
        height: 26px;
        background-repeat: no-repeat;
        cursor: pointer;
    }
    .up-btn {
        background-position: 0 0;
        &:hover {
            background-position: 0 -52px;
        }
    }
    .right-btn {
        background-position: -26px 0;
        &:hover {
            background-position: -26px -52px;
        }
    }
    .left-btn {
        background-position: 0 -26px;
        &:hover {
            background-position: 0 -78px;
        }
    }
    .down-btn {
        background-position: -26px -26px;
        &:hover {
            background-position: -26px -78px;
        }
    }
}
</style>
