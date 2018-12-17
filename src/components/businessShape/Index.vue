<template>
    <AttributeModule
        :show="attributeModule.show"
        :data="attributeModule.data"
        @close="handlerModelCancel"
    ></AttributeModule>
</template>

<script>
    import { mapGetters } from 'vuex'
    import uuidV1 from 'uuid/v1'
    import stringFormat from 'string-format'
    import { deepClone, isEmpty } from '@/common/utils'
    import attribute from './attribute'
    import emptyData from './emptyData.json'
    import { tpl } from './tipTpl.js'
    export default {
        name: 'ComponentsBusinessShape',
        components: {
            'AttributeModule': attribute
        },
        data () {
            return {
                attributeModule: {
                    show: false,
                    data: null
                }
            }
        },
        computed: {
            ...mapGetters({
                wrapStageData: 'wrapStageData',
                ploterConfig: 'ploterConfig',
                stageElements: 'stageElements',
                componentsBusinessShapeData: 'componentsBusinessShapeData'
            })
        },
        watch: {
            ploterConfig (cfg) {
                if (cfg.businessShape && cfg.businessShape.enable) {
                    window.wrapHandshake.model['updateBusinessData'] = this.updateBusinessData
                    window.wrapHandshake.model['updateBusinessRecord'] = this.updateBusinessRecord
                    window.ploterStage.on('evt_stage_element_dblclick', this.onStageElementDblclick)
                    window.ploterStage.on('evt_stage_element_changed', this.onStageElementChanged)
                    window.ploterStage.on('evt_stage_element_contextmenu', this.onStageElementContextmenu)
                    window.ploterStage.on('evt_stage_element_mouseenter', this.onStageElementMouseenter)
                    window.ploterStage.on('evt_stage_element_mouseleave', this.onStageElementMouseleave)
                    setTimeout(() => {
                        this.getBusinessData(this.wrapStageData.uuid)
                    }, 1000)
                }
            },
            componentsBusinessShapeData: {
                handler (data) {
                    this.updateStageFromBusinessData(data)
                },
                deep: true
            }
        },
        mounted () {},
        methods: {
            onStageElementDblclick (element) {
                const shapeUuid = element.getAttr('shapeUuid')
                const businessRecord = this.componentsBusinessShapeData.find(item => {
                    return item.shapeUuid === shapeUuid
                })
                if (businessRecord) {
                    if (this.ploterConfig.readOnly) {
                        window.wrapHandshake.emit('evtBusinessShapeSelected', businessRecord)
                    } else {
                        this.attributeModule.data = deepClone(businessRecord)
                        this.attributeModule.show = true
                    }
                }
            },
            onStageElementChanged (event) {
                const shapeUuid = event.element.getAttr('shapeUuid')
                const shapeCfg = event.element.getAttr('_shapeCfg')
                if (!shapeCfg.businessShape) return
                if (event.changeType === 'add') {
                    let record = {
                        ...emptyData,
                        uuid: uuidV1(),
                        shapeUuid: shapeUuid,
                        stageUuid: this.wrapStageData.uuid
                    }
                    this.$store.dispatch('addBusinessRecord', record)
                } else if (event.changeType === 'delete') {
                    const businessRecord = this.$store.getters.componentsBusinessRecordGet(shapeUuid)
                    this.$store.dispatch('removeBusinessRecord', businessRecord)
                }
            },
            getBusinessData () {
                window.wrapHandshake.emit('evtNeedBusinessData')
                let loopTime = this.ploterConfig.businessShape.requestLoop
                if (loopTime > 0) {
                    setTimeout(() => {
                        me.getBusinessData()
                    }, loopTime)
                }
            },
            updateBusinessData (data) {
                const me = this
                me.$store.commit('updateBusinessShapeData', data)
            },
            updateBusinessRecord (data) {
                const me = this
                me.$store.dispatch('updateBusinessRecord', data)
            },
            updateStageFromBusinessData (data) {
                data.forEach(record => {
                    let nameText = ''
                    if (!isEmpty(record.tenantName) && record.status !== 'normal') {
                        nameText = record.tenantName
                    } else {
                        nameText = record.name
                    }
                    let shapeFeature = {
                        textShape: {
                            fields: [{
                                alias: 'code',
                                value: record.code,
                                fontSize: record.codeFontSize,
                                fontStyle: record.codeFontStyle,
                                fontFamily: record.codeFontFamily
                            }, {
                                alias: 'name',
                                value: nameText,
                                fontSize: record.nameFontSize,
                                fontStyle: record.nameFontStyle,
                                fontFamily: record.namefontFamily
                            }]
                        },
                        mainShape: {}
                    }
                    if (record.status === 'normal') {
                        shapeFeature.mainShape.stroke = '#666'
                        shapeFeature.mainShape.fill = '#eaeaea'
                        shapeFeature.textShape.fill = '#666'
                    } else if (record.status === 'allotted') {
                        shapeFeature.mainShape.stroke = '#f00000'
                        shapeFeature.mainShape.fill = '#ffdddd'
                        shapeFeature.textShape.fill = '#f00000'
                    } else if (record.status === 'bespoke') {
                        shapeFeature.mainShape.stroke = '#827700'
                        shapeFeature.mainShape.fill = '#ffea00'
                        shapeFeature.textShape.fill = '#827700'
                    } else if (record.status === 'completed') {
                        shapeFeature.mainShape.stroke = '#199200'
                        shapeFeature.mainShape.fill = '#baffac'
                        shapeFeature.textShape.fill = '#199200'
                    }

                    const shapeUuid = record.shapeUuid
                    this.$emit('evt_stage_element_feature_changed', shapeUuid, shapeFeature)
                })
            },
            handlerModelCancel () {
                this.attributeModule.data = emptyData
                this.attributeModule.show = false
            },
            onStageElementContextmenu (context) {
                const me = this
                if (!this.ploterConfig.readOnly) {
                    let contextmenu = me.getBusinessShapeContextmenu()
                    contextmenu.onclick = function (e) {
                        e.preventDefault()
                        e.stopPropagation()
                        let target = e.target
                        let action = target.dataset.action
                        switch (action) {
                        case 'detail':
                            me.onStageElementDblclick(context.element)
                            break
                        case 'allot':
                            me.doAllotBusinessData(context.element)
                            break
                        case 'delete':
                            let mainShape = context.element.findOne('.mainShape')
                            me.$emit('evt_stage_element_remove', mainShape)
                            break
                        }
                        contextmenu.hide()
                    }
                    contextmenu.style.top = context.event.offsetY + 'px'
                    contextmenu.style.left = context.event.offsetX + 'px'
                    contextmenu.show()
                }
            },
            onStageElementMouseenter (context) {
                const shapeUuid = context.element.getAttr('shapeUuid')
                const businessRecord = this.componentsBusinessShapeData.find(item => {
                    return item.shapeUuid === shapeUuid
                })
                if (businessRecord) {
                    let tipEl = this.getBusinessShapeTip(true)
                    let content = stringFormat(tpl, {
                        code: businessRecord.code || '',
                        name: businessRecord.name || '',
                        area: businessRecord.area || '',
                        boothType: businessRecord.boothType || '',
                        entryType: businessRecord.entryType || ''
                    })
                    tipEl.innerHTML = content
                    tipEl.style.top = context.event.offsetY + 'px'
                    tipEl.style.left = context.event.offsetX + 'px'
                    tipEl.show()
                }
            },
            onStageElementMouseleave (event) {
                let tipEl = this.getBusinessShapeTip(false)
                if (tipEl) {
                    tipEl.hide()
                }
            },
            doAllotBusinessData (shapeWrap) {
                const shapeUuid = shapeWrap.getAttr('shapeUuid')
                const businessRecord = this.componentsBusinessShapeData.find(item => {
                    return item.shapeUuid === shapeUuid
                })
                if (businessRecord) {
                    if (!this.ploterConfig.readOnly) {
                        window.wrapHandshake.emit('evtBusinessDataAllot', businessRecord)
                    }
                }
            },
            getBusinessShapeContextmenu (callback) {
                const canvasWrap = document.querySelector('.app-ploter-main-canvas')
                const konvajsContent = canvasWrap.querySelector('.konvajs-content')
                if (konvajsContent) {
                    let contextmenu = konvajsContent.querySelector('.business-shape-contextmenu')
                    if (!contextmenu) {
                        contextmenu = document.createElement('ul')
                        let menuItems = '<li data-action="detail">查看详情</li><li data-action="allot">指定展位</li><li data-action="delete">删除</li>'
                        contextmenu.className = 'business-shape-contextmenu'
                        contextmenu.innerHTML = menuItems
                        konvajsContent.appendChild(contextmenu)
                    }
                    contextmenu.show = function () {
                        contextmenu.style.display = 'block'
                        document.body.addEventListener('click', this.hide)
                    }
                    contextmenu.hide = function () {
                        contextmenu.style.top = 0
                        contextmenu.style.left = 0
                        contextmenu.style.display = 'none'
                        document.body.removeEventListener('click', this.hide)
                    }
                    return contextmenu
                }
            },
            getBusinessShapeTip (autoCreate) {
                const canvasWrap = document.querySelector('.app-ploter-main-canvas')
                const konvajsContent = canvasWrap.querySelector('.konvajs-content')
                if (konvajsContent) {
                    let tipEl = konvajsContent.querySelector('.business-shape-tip')
                    if (!tipEl && autoCreate) {
                        tipEl = document.createElement('div')
                        tipEl.className = 'business-shape-tip'
                        konvajsContent.appendChild(tipEl)
                    }
                    if (tipEl) {
                        tipEl.show = function () {
                            tipEl.style.display = 'block'
                        }
                        tipEl.hide = function () {
                            tipEl.style.top = 0
                            tipEl.style.left = 0
                            tipEl.style.display = 'none'
                        }
                    }
                    return tipEl
                }
            }
        }
    }
</script>
