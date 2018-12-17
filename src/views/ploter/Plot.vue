<template>
<Layout id="AppViewport">
    <Content class="app-body">
        <div class="app-ploter-main">
            <div class="app-ploter-main-body">
                <!-- 画布容器 -->
                <div class="app-ploter-main-canvas" ref="plotStage"></div>
                <div class="app-ploter-main-mask"></div>
            </div>
        </div>
        <ComponentsBusinessShape
            @evt_stage_element_feature_changed="onFeatureChange"
            @evt_stage_element_remove="doShapeDelete"
        />
    </Content>
    <appPloterWidgetMove></appPloterWidgetMove>
    <AppPloterWidgetScale
        v-if="stage"
        :stage="stage"
        @evtStageCfgChanged="onStageCfgChanged"
        @evtStageScaleChanged="onStageScaleChanged"
        @evtStageScaleReset="onStageScaleReset">
    </AppPloterWidgetScale>
    <!-- <Footer class="app-footer app-state-bar" v-if="footer.show">
        <AppPloterBBarMessage
            :plotTool="currentPlotTool"
        ></AppPloterBBarMessage>
        <AppPloterBBarCoordinate
            :coordinate="coordinateSystem"
        ></AppPloterBBarCoordinate>
        <AppPloterBBarStageAttr
            :stage="stage"
            @evtStageCfgChanged="onStageCfgChanged"
            @evtStageScaleChanged="onStageScaleChanged"
            @evtStageScaleReset="onStageScaleReset"
        ></AppPloterBBarStageAttr>
    </Footer> -->
</Layout>
</template>

<script>
    import { mapGetters } from 'vuex'
    import drawLib from './draw'
    import plotundo from '@/plugins/plotundo'
    import {
        exitPlotTool,
        deleteShape,
        pasteShape
    } from './draw/utils'
    import {
        prepareStageData,
        prepareStageElements,
        getShapeOnStage
    } from './draw/stage'
    import {
        Base64
    } from 'js-base64'
    import { deepClone } from '@/common/utils'
    // 共通组件
    import componentsBusinessShape from '@/components/businessShape'
    // 标绘组件
    import appPloterBBarMessage from './bbar/Message'
    import appPloterBBarCoordinate from './bbar/Coordinate'
    import appPloterBBarStageAttr from './bbar/StageAttr'
    // widget
    import appPloterWidgetScale from './widget/Scale'
    import appPloterWidgetMove from './widget/Move'
    
    export default {
        name: 'AppPloterMain',
        components: {
            'ComponentsBusinessShape': componentsBusinessShape,
            'AppPloterBBarMessage': appPloterBBarMessage,
            'AppPloterBBarCoordinate': appPloterBBarCoordinate,
            'AppPloterBBarStageAttr': appPloterBBarStageAttr,
            'AppPloterWidgetScale': appPloterWidgetScale,
            'AppPloterWidgetMove': appPloterWidgetMove
        },
        data () {
            return {
                stage: null,
                currentPlotTool: null,
                currentPlotActiveItem: null,
                currentPasteItem: null,
                footer: {
                    show: false
                },
                coordinateSystem: {
                    system: '像素',
                    x: 0,
                    y: 0
                }
            }
        },
        computed: {
            ...mapGetters({
                wrapStageData: 'wrapStageData',
                ploterConfig: 'ploterConfig',
                stageElements: 'stageElements',
                stageSize: 'stageSize',
                componentsBusinessShapeData: 'componentsBusinessShapeData'
            })
        },
        watch: {},
        created () {
            drawLib.initLocalSetting()
        },
        mounted () {
            const me = this
            const postmate = new Postmate.Model({
                saveHandler: me.emitSaveData,
                selectToolHandler: me.onToolSelected
            })

            postmate.then(function (handshake) {
                window.wrapHandshake = handshake
                const stageRecord = handshake.model.stageRecord
                me.$store.commit('updateStageData', stageRecord)
                const ploterCfg = handshake.model.config
                if (ploterCfg) {
                    me.$store.commit('updatePloterCongig', ploterCfg)
                }
                me.initPloter(stageRecord.jsonData || null)
            })
            plotundo.init()
        },
        methods: {
            initPloter (stageData) {
                const me = this
                if (!stageData) {
                    if (me.stage) {
                        const warn = confirm('现在执行新建操作将放弃对当前画布做出的修改，\n点击确认按钮前请确认您的标绘成果已经保存。')
                        if (warn === true) {
                            me.stage.destroy()
                        }
                    }
                    const createCfg = me.ploterConfig.createCfg
                    if (createCfg) {
                        if (createCfg.type === 'img') {
                            stageData = JSON.stringify(drawLib.createEmptyStageData({
                                width: createCfg.width,
                                height: createCfg.height,
                                backgroundImage: createCfg.from
                            }))
                            me.initStage(stageData, '.app-ploter-main-canvas')
                        }
                    } else {
                        stageData = JSON.stringify(drawLib.createEmptyStageData())
                        me.initStage(stageData, '.app-ploter-main-canvas')
                    }
                } else {
                    me.initStage(stageData, '.app-ploter-main-canvas')
                }
                if (!this.ploterConfig.readOnly) {
                    me.footer.show = true
                }
            },
            initStage (stageData, wrap) {
                const me = this
                if (window.ploterStage) {
                    window.ploterStage.destroy()
                }
                const data = prepareStageData(stageData)
                const stage = Konva.Node.create(data, wrap)
                window.ploterStage = stage
                me.stage = stage
                drawLib.reloadShapes(stage)
                me.$store.commit('updateStageSize', {
                    width: stage.getWidth(),
                    height: stage.getHeight()
                })
                me.setStageLayout()
                me.initStageEvent(stage)
            },
            initStageEvent (stage) {
                const me = this
                if (!this.ploterConfig.readOnly) {
                    stage.on('mousedown', (e) => {
                        const mouseButton = e.evt.button
                        const targetShape = e.target
                        const targetShapeName = targetShape.getAttr('name')
                        // ===============
                        // 事件转发部分
                        // ===============
                        // 如果鼠标左键落下处不是交互工具，
                        // 那基本不是要标绘就是要激活或取消激活交互工具
                        if (mouseButton === 0) { // 左键单击
                            if (targetShapeName !== 'shapeAnchor' && targetShape.parent.className !== 'Transformer') {
                                // 如果当前有激活的标绘工具，
                                // 那么所有在底图上的左键单击都是画图
                                if (me.currentPlotTool) {
                                    stage.fire('evt-draw', e)
                                    // }
                                } else {
                                // 如果当前没有激活的标绘工具，
                                // 那么所有在画布上的左键单击都是选取(除了画布本身)
                                    if (targetShape.nodeType !== 'Stage') {
                                        if (targetShape.getId() !== 'stageBackgroundArea' || targetShape.getId() !== 'stageBackgroundImg') {
                                            me.doSelectShape(targetShape)
                                        }
                                    }
                                }
                            }
                        } else { // 右/中键单击
                        // 如果鼠标右/中键落下，
                        // 那就是要取消激活标绘工具和交互工具
                            me.doExitPlotTool()
                        }
                    })
                    stage.on('evt_stage_element_changed', event => {
                        let stageData = event.target.toJSON()
                        prepareStageElements(JSON.parse(stageData))
                        window.focus()
                    })
                    const plotStageEl = me.$refs.plotStage.querySelector('.konvajs-content')
                    plotStageEl.addEventListener('mousemove', (e) => {
                        const point = stage.getPointerPosition()
                        me.coordinateSystem.x = point.x
                        me.coordinateSystem.y = point.y
                    })
                    plotStageEl.addEventListener('mouseout', (e) => {
                        me.coordinateSystem.x = null
                        me.coordinateSystem.y = null
                    })
                    // 键盘事件
                    window.addEventListener('keydown', (event) => {
                        console.log('event', event)
                        if (event.keyCode === 46) { // del键：删除选中
                            if (me.currentPlotActiveItem) {
                                me.doShapeDelete(me.currentPlotActiveItem)
                            }
                        } else if (event.keyCode === 27) { // ESC键：中断绘制
                            stage.fire('evt-stop')
                            me.currentPlotActiveItem = null
                        } else if (event.keyCode === 67 && event.ctrlKey) { // Ctrl+C
                            if (me.currentPlotActiveItem && me.currentPlotActiveItem.className === 'MoftArrowLine') {
                                alert('当前元素不支持复制粘贴操作')
                            } else {
                                me.currentPasteItem = me.currentPlotActiveItem
                            }
                        } else if (event.keyCode === 86 && event.ctrlKey) { // Ctrl+V
                            if (me.currentPasteItem) {
                                pasteShape(me.currentPasteItem)
                            }
                        } else if (event.keyCode === 90 && event.ctrlKey) { // Ctrl+Z
                            if (window.plotstack.canUndo()) {
                                window.plotstack['undo']()
                            } else {
                                alert('无可撤销内容')
                            }
                        } else if (event.keyCode === 89 && event.ctrlKey) { // Ctrl+Y
                            if (window.plotstack.canRedo()) {
                                window.plotstack['redo']()
                            } else {
                                alert('无可恢复内容')
                            }
                        }
                    })
                }

                // 屏蔽画布上的浏览器右键菜单
                me.$refs.plotStage.oncontextmenu = function () {
                    return false
                }
                // 浏览器调整大小后，重设画布布局
                window.addEventListener('resize', (e) => {
                    me.setStageLayout()
                })
                // 激活一下子窗口，以捕获window下事件
                window.focus()
            },
            onSelectFile () {
                this.$refs.loadInput.click()
            },
            onSelectedPlotFile (e) {
                const me = this
                const file = e.target.files[0]
                if (typeof FileReader === 'function') {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        const content = e.target.result.replace('data:;base64,', '')
                        const stageData = JSON.parse(Base64.decode(content))
                        if (!stageData.attrs.mplot) {
                            alert('文件无效，请选择.mplot后缀的云帆标绘文件')
                            return
                        }
                        if (me.stage) {
                            const warn = confirm('现在打开标绘文件将放弃对当前画布做出的修改，\n点击确认按钮前请确认您的标绘成果已经保存。')
                            if (warn === true) {
                                me.initPloter(stageData)
                            }
                        }
                        this.$refs.loadInput.value = ''
                    }
                    reader.readAsDataURL(file)
                } else {
                    alert('您的浏览器版本太低，请升级。')
                }
            },
            onToolSelected (tool) {
                if (this.stage) {
                    this.stage.fire('evt-stop')
                    this.currentPlotTool = tool
                    this.initPlotTool()
                }
            },
            onFeatureChange (shapeUuid, shapeStyle) {
                const shape = getShapeOnStage(shapeUuid)
                const mainShape = shape.findOne('.mainShape')
                drawLib.applyFeature(this.stage, mainShape, shapeStyle)
            },
            onStageCfgChanged (cfg) {
                drawLib.applyStageCfg(this.stage, cfg)
            },
            onStageScaleChanged (value) {
                this.doStageScale(value)
            },
            onStageScaleReset () {
                this.doStageScaleReset()
            },
            onSelectShape (shapeUuid) {
                const me = this
                const shape = getShapeOnStage(shapeUuid)

                if (shape) {
                    me.doSelectShape(shape.findOne('.mainShape'))
                }
            },
            initPlotTool () {
                if (!this.currentPlotTool) return
                const toolCfg = {...deepClone(this.currentPlotTool)}
                const stage = this.stage
                drawLib.initPlotTool(toolCfg, stage)
            },
            doShapeDelete (shape) {
                const stage = this.stage
                const shapeWrap = shape.findAncestor('.shapeWrap')
                deleteShape(shape)
                stage.fire('evt_stage_element_changed', {
                    changeType: 'delete',
                    element: shapeWrap
                })
                this.currentPlotActiveItem = null
            },
            doExitPlotTool () {
                const me = this
                const stage = me.stage
                stage.fire('evt-stop')
                exitPlotTool(stage)
                me.currentPlotTool = null
                me.currentPlotActiveItem = null
            },
            doSelectShape (shape) {
                const me = this
                shape.fire('evt-active', shape)
                me.currentPlotActiveItem = shape
            },
            doStageScale (value) {
                const stage = this.stage
                const ploterWrap = document.querySelector('.konvajs-content')
                const ploterWrapSize = {
                    width: Math.round(this.stageSize.width * value),
                    height: Math.round(this.stageSize.height * value)
                }
                ploterWrap.style.width = ploterWrapSize.width + 'px'
                ploterWrap.style.height = ploterWrapSize.height + 'px'
                stage.setAttrs({
                    width: ploterWrapSize.width,
                    height: ploterWrapSize.height
                })
                stage.scale({
                    x: value,
                    y: value
                })
                stage.draw()
                stage.fire('evt_stage_scale_changed', {
                    scaleLevel: value
                })
                this.setStageLayout()
            },
            doStageScaleReset () {
                const stage = this.stage
                const ploterWrap = document.querySelector('.konvajs-content')

                ploterWrap.style.width = this.stageSize.width + 'px'
                ploterWrap.style.height = this.stageSize.height + 'px'
                stage.setAttrs({
                    width: this.stageSize.width,
                    height: this.stageSize.height
                })
                stage.scale({
                    x: 1,
                    y: 1
                })
                stage.draw()
                stage.fire('evt_stage_scale_changed', {
                    scaleLevel: 1
                })
                this.setStageLayout()
            },
            setStageLayout () {
                const me = this
                const plotStageEl = this.$refs.plotStage
                const stage = this.stage
                let wrapWidth = window.innerWidth
                if (me.currentPlotActiveItem) {
                    wrapWidth = window.innerWidth - 320
                }

                if (wrapWidth > stage.width()) {
                    plotStageEl.setAttribute('data-layout-center', true)
                } else {
                    plotStageEl.removeAttribute('data-layout-center')
                }
            },
            // 发射画布数据
            emitSaveData () {
                const me = this
                this.stage.fire('evt-stop')
                exitPlotTool(this.stage)
                this.currentPlotTool = null
                this.currentPlotActiveItem = null
                this.doStageScaleReset()
                setTimeout(() => {
                    const jsonData = me.stage.toJSON()
                    const dataUrl = me.stage.toDataURL()
                    const data = {
                        stageUuid: this.wrapStageData.uuid,
                        jsonData: jsonData,
                        picData: dataUrl,
                        businessData: this.componentsBusinessShapeData
                    }
                    window.wrapHandshake.emit('evtSaveDataReady', data)
                }, 1000)
            }
        }
    }
</script>

<style lang="scss">
@import '~@/assets/app.scss';
</style>
