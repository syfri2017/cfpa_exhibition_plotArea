<template>
    <div class="app-ploter-widget-scale" v-if="stage">
        <div class="enlarge-btn" @click="onScaleEnlarge"></div>
        <div class="narrow-btn" @click="onScaleNarrow"></div>
        <div class="reset-btn" @click="onResetScale"></div>
    </div>
</template>

<script>
    export default {
        name: 'AppPloterWidgetScale',
        props: ['stage'],
        data () {
            return {
                scaleLevel: 1
            }
        },
        watch: {},
        mounted () {
            this.stage.on('evt_stage_scale_changed', this.onStageScaleChanged)
        },
        methods: {
            onScaleEnlarge () {
                var value = this.scaleLevel + 0.1
                this.$emit('evtStageScaleChanged', value)
            },
            onScaleNarrow () {
                var value = this.scaleLevel - 0.1
                this.$emit('evtStageScaleChanged', value)
            },
            onResetScale () {
                this.scaleLevel = 1
                this.$emit('evtStageScaleReset')
            },
            onStageScaleChanged (event) {
                this.scaleLevel = event.scaleLevel
            }
        }
    }
</script>

<style lang="scss" scoped>
.app-ploter-widget-scale {
    position: absolute;
    top: 88px;
    right: 40px;
    width: 52px;
    text-align: center;
    z-index: 99;
    .enlarge-btn,
    .narrow-btn,
    .reset-btn {
        width: 26px;
        height: 26px;
        margin: 10px auto;
        background-position: 0 0;
        background-repeat: no-repeat;
        box-shadow: 0 0 8px rgba(0,0,0,0.3);
        cursor: pointer;
        &:hover {
            background-position: 0 -26px;
        }
    }
    .enlarge-btn {
        background-image: url('/static/images/widget/scale/btn_enlarge.png');
    }
    .narrow-btn {
        background-image: url('/static/images/widget/scale/btn_narrow.png');
    }
    .reset-btn {
        background-image: url('/static/images/widget/scale/btn_reset.png');
    }
}
</style>
