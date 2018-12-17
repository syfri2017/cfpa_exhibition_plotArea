<template>
    <div class="app-status-bar-stageattr-wrap" v-if="stage">
        <div class="app-status-bar-stageattr">
            <div style="flex: 1"> </div>
            <!-- <Poptip title="画布属性"
                class="app-status-bar-stageattr-poptip"
                placement="top-end"
            > -->
                <!-- <div>
                    当前画布： {{stage.attrs.width}} x {{stage.attrs.height}}
                    <Icon type="arrow-down-b"></Icon>
                </div> -->
                <!-- <Form :model="stageCfg" slot="content" class="app-status-bar-stageattr-form">
                    <FormItem>
                        <Row>
                            <Col span="8" class="app-status-bar-stageattr-form-label">宽:</Col>
                            <Col span="14">
                                <InputNumber
                                :min="320"
                                :step="10"
                                v-model="stageCfg.width"></InputNumber>
                            </Col>
                            <Col span="2">px</Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Row>
                            <Col span="8" class="app-status-bar-stageattr-form-label">高:</Col>
                            <Col span="14">
                                <InputNumber
                                :min="320"
                                :step="10"
                                v-model="stageCfg.height"></InputNumber>
                            </Col>
                            <Col span="2">px</Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Row>
                            <Col span="8" class="app-status-bar-stageattr-form-label">背景色:</Col>
                            <Col span="16">
                                <ColorPicker
                                    v-model="stageCfg.fill"
                                    :colors="baseColors"
                                />
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem>
                        <Button long @click="onApplyCfg">确定</Button>
                    </FormItem>
                </Form>
            </Poptip> -->
            缩放:
            <Slider
                class="app-status-bar-stageattr-zoom-slider"
                v-model="scaleLevel"
                :max="2"
                :min="0.2"
                :step="0.2"
                :tip-format="tipFormat"
                @on-change="onScaleChange"
            ></Slider>
            <Button
                size="small"
                type="text"
                icon="ios-undo"
                style="margin-left:8px"
                @click="onResetScale"
            ></Button>
        </div>
    </div>
</template>

<script>
    import appPlotBaseColors from '@/store/static/plot/AppPlotBaseColors'
    export default {
        name: 'AppPloterBBarStageAttr',
        props: ['stage'],
        data () {
            return {
                stageCfg: {
                    width: 800,
                    height: 600,
                    fill: '#fff'
                },
                baseColors: appPlotBaseColors,
                scaleLevel: 1
            }
        },
        watch: {
            stage (stage) {
                if (stage) {
                    const background = stage.findOne('#stageBackgroundArea')
                    this.stageCfg = {
                        width: stage.getWidth(),
                        height: stage.getHeight(),
                        fill: background.getFill()
                    }
                    console.log(this.stageCfg)
                }
            }
        },
        mounted () {
            this.stage.on('evt_stage_scale_changed', this.onStageScaleChanged)
        },
        methods: {
            onApplyCfg () {
                this.$emit('evtStageCfgChanged', this.stageCfg)
            },
            onScaleChange (value) {
                this.$emit('evtStageScaleChanged', value)
            },
            onResetScale () {
                this.scaleLevel = 1
                this.$emit('evtStageScaleReset')
            },
            onStageScaleChanged (event) {
                this.scaleLevel = event.scaleLevel
            },
            tipFormat (value) {
                return value * 100 + '%'
            }
        }
    }
</script>
