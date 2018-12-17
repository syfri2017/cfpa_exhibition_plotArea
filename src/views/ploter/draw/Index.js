import icon from './Icon'
import rectangle from './Rectangle'
import image from './Image'
import appPlotBaseStage from '@/store/static/plot/AppPlotBaseStage'
import { isEmpty } from '@/common/utils'

function createEmptyStageData (config) {
    let stageData = {
        ...appPlotBaseStage
    }
    const stageLayers = stageData.children
    const backgroundLayer = stageLayers.find(item => {
        return item.attrs.name === 'backgroundLayer'
    })
    const shapesLayer = stageLayers.find(item => {
        return item.attrs.name === 'shapesLayer'
    })
    const stageSetting = getLocalSetting('stage')
    let stageWidth = stageSetting.width
    let stageHeight = stageSetting.height
    let stageFill = stageSetting.fill

    if (config) {
        stageWidth = config.width
        stageHeight = config.height
        shapesLayer.children.push({
            attrs: {
                name: 'shapeWrap',
                _shapeCfg: {
                    name: '底图',
                    id: 'backgroundImg',
                    type: 'image',
                    style: {
                        importSize: 'image',
                        mainShape: {
                            src: config.backgroundImage
                        }
                    }
                },
                activable: true
            },
            className: 'Group',
            children: [{
                attrs: {
                    name: 'shapeGroup',
                    draggable: true,
                    x: 0,
                    y: 0
                },
                className: 'Group',
                children: [{
                    attrs: {
                        id: 'stageBackgroundImg',
                        name: 'mainShape',
                        x: 0,
                        y: 0,
                        width: stageWidth,
                        height: stageHeight
                    },
                    className: 'Image'
                }]
            }, {
                attrs: {
                    name: 'interactiveGroup'
                },
                className: 'Group',
                children: []
            }]
        })
    }
    backgroundLayer.children.push({
        attrs: {
            name: 'shapeWrap',
            _shapeCfg: {
                name: '画布区域',
                id: 'backgroundArea',
                type: 'Rect',
                style: {}
            },
            activable: false
        },
        className: 'Group',
        children: [{
            attrs: {
                name: 'shapeGroup',
                draggable: false,
                _isDrawn: true,
                x: 0,
                y: 0
            },
            className: 'Group',
            children: [{
                attrs: {
                    id: 'stageBackgroundArea',
                    name: 'backgroundAreaShape',
                    x: 0,
                    y: 0,
                    width: stageWidth,
                    height: stageHeight,
                    fill: stageFill
                },
                className: 'Rect'
            }]
        }]
    })

    stageData.attrs.width = stageWidth
    stageData.attrs.height = stageHeight

    // this.$emit('evtInitPlot', stageData, 'create')
    return stageData
}

function initPlotTool (tool, stage) {
    switch (tool.type) {
    case 'icon':
        icon.init(tool, stage)
        break
    case 'area':
        const shapeType = tool.style.shapeType
        if (shapeType === 'rectangle') {
            rectangle.init(tool, stage)
        }
        break
    case 'image':
        image.init(tool, stage)
        break
    }
}

function reloadShapes (stage) {
    const shapesLayer = stage.findOne('.shapesLayer')
    const groups = shapesLayer.children
    // redraw image
    groups.forEach(shapeWrap => {
        const shapeCfg = shapeWrap.getAttr('_shapeCfg')
        if (shapeCfg.type === 'image') {
            image.reloadShape(shapeWrap)
        }
    })
    // redraw other
    setTimeout(() => {
        groups.forEach(shapeWrap => {
            const shapeCfg = shapeWrap.getAttr('_shapeCfg')
            switch (shapeCfg.type) {
            case 'icon':
                icon.reloadShape(shapeWrap)
                break
            case 'area':
                const shapeType = shapeCfg.style.shapeType
                if (shapeType === 'rectangle') {
                    rectangle.reloadShape(shapeWrap)
                }
                break
            }
        })
    }, 0)
}

function resizeCanvas (stage, width, height) {
    stage.setAttrs({
        width: width,
        height: height
    })
}

function applyFeature (stage, shape, option) {
    if (isEmpty(stage)) return
    if (isEmpty(shape)) return
    if (isEmpty(option)) return

    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeCfg = shapeWrap.getAttr('_shapeCfg')

    switch (shapeCfg.type) {
    case 'icon':
        icon.applyFeature(stage, shape, option)
        break
    case 'area':
        const shapeType = shapeCfg.style.shapeType
        if (shapeType === 'rectangle') {
            rectangle.applyFeature(stage, shape, option)
        }
        break
    case 'image':
        image.applyFeature(stage, shape, option)
        break
    }
}

function applyStageCfg (stage, cfg) {
    const background = stage.findOne('#stageBackground')
    stage.setAttrs({
        width: cfg.width,
        height: cfg.height
    })
    background.setAttrs({
        width: cfg.width,
        height: cfg.height,
        fill: cfg.fill
    })
    stage.draw()
}

function initLocalSetting () {
    const localSettingStr = localStorage.getItem('plotSetting')
    let localSetting = JSON.parse(localSettingStr)
    if (!localSetting) {
        localStorage.setItem('plotSetting', JSON.stringify({
            stage: {
                width: 1200,
                height: 800,
                fill: '#fff'
            },
            icon: {
                width: 48,
                height: 48
            }
        }))
    }
}

function getLocalSetting (key) {
    const localSettingStr = localStorage.getItem('plotSetting')
    let localSetting = JSON.parse(localSettingStr)
    if (key) {
        return localSetting[key]
    } else {
        return localSetting
    }
}

export default {
    initLocalSetting,
    reloadShapes,
    getLocalSetting,
    createEmptyStageData,
    // initBaseImage,
    initPlotTool,
    applyFeature,
    resizeCanvas,
    applyStageCfg
}
