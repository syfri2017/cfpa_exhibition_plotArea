import drawLib from './index'
import {
    initShapeWrap,
    exitPlotTool,
    switchInteractives,
    redrawAllLayer,
    hideAllInteractiveTools
} from './utils'

function init (toolCfg, stage) {
    exitPlotTool(stage)
    stage.on('evt-draw', function (e) {
        let point = stage.getPointerPosition()
        draw(toolCfg, point, stage)
        stage.fire('evt_update_legend')
    })
}

function draw (cfg, point, stage) {
    let targetLayer = stage.findOne('.shapesLayer')
    let imageObj = new Image()
    let imgUrl = cfg.src + '.png'
    imageObj.src = imgUrl
    imageObj.onload = function () {
        const localSetting = drawLib.getLocalSetting()
        const iconSize = {
            width: cfg.style.mainShape.width || localSetting.icon.width || 48,
            height: cfg.style.mainShape.height || localSetting.icon.height || 48
        }
        const scale = stage.scale()
        const x = point.x / scale.x - (iconSize.width / 2)
        const y = point.y / scale.y - (iconSize.height / 2)

        let shapeWrap = initShapeWrap(cfg)
        shapeWrap.setAttr('activable', true)
        let shapeGroup = shapeWrap.findOne('.shapeGroup')
        targetLayer.add(shapeWrap)

        let icon = new Konva.Image({
            name: 'mainShape',
            x: x,
            y: y,
            width: iconSize.width,
            height: iconSize.height,
            image: imageObj,
            draggable: false
        })
        icon.on('evt-active', initActive)
        shapeGroup.add(icon)

        if (cfg.style.textShape) {
            const wT = iconSize.width * 1.5
            const hT = iconSize.height / 3
            const hC = 2
            const xT = x - (wT - iconSize.width) / 2
            let yT = y - hC - hT
            if (cfg.id === 'battle_direction_flfx') {
                yT = yT + iconSize.height / 2
            }

            let text = new Konva.Text({
                name: 'textShape',
                x: xT,
                y: yT,
                width: wT,
                height: hT,
                align: 'center',
                wrap: 'none',
                ellipsis: true,
                draggable: false,
                ...cfg.style.textShape
            })
            shapeGroup.add(text)
        }
        targetLayer.draw()

        stage.fire('evt_stage_element_changed', {
            changeType: 'add',
            element: shapeWrap
        })

        window.plotstack.execute(new window.InsertCommand(stage, '.shapesLayer', shapeGroup))
    }
}

function applyFeature (stage, shape, option) {
    const shapeWrap = shape.findAncestor('.shapeWrap')

    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')
    const textShape = shapeGroup.findOne('.textShape')

    let editCmd = new window.EditCommand(stage, '.shapesLayer')
    editCmd.setOldValue(shapeGroup)

    shapeGroup.opacity(option.opacity)

    if (mainShape) {
        if (mainShape.getWidth() !== option.mainShape.width) {
            const xtn = mainShape.getPosition().x - (option.mainShape.width - mainShape.getWidth()) / 2
            option.mainShape.x = Math.round(xtn)
        }

        if (mainShape.getHeight() !== option.mainShape.height) {
            const ytn = mainShape.getPosition().y - (option.mainShape.height - mainShape.getHeight()) / 2
            option.mainShape.y = Math.round(ytn)
        }
        mainShape.setAttrs({
            x: option.mainShape.x,
            y: option.mainShape.y,
            width: option.mainShape.width,
            height: option.mainShape.height
        })
    }
    if (textShape) {
        if (textShape.getWidth() !== option.textShape.width) {
            const xtn = textShape.getPosition().x - (option.textShape.width - textShape.getWidth()) / 2
            option.textShape.x = Math.round(xtn)
        }

        if (textShape.getHeight() !== option.textShape.height) {
            const ytn = textShape.getPosition().y - (option.textShape.height - textShape.getHeight()) / 2
            option.textShape.y = Math.round(ytn)
        }

        textShape.setAttrs({
            x: option.textShape.x,
            y: option.textShape.y,
            width: option.textShape.width,
            height: option.textShape.height,
            align: option.textShape.align,
            text: option.textShape.text,
            fill: option.textShape.fill,
            fontFamily: option.textShape.fontFamily,
            fontSize: option.textShape.fontSize
        })
    }
    let targetLayer = stage.findOne('.shapesLayer')
    targetLayer.draw()

    editCmd.setNewValue(shapeGroup)
    window.plotstack.execute(editCmd)
}

function initActive (icon) {
    const stage = icon.getStage()
    const shapeWrap = icon.findAncestor('.shapeWrap')
    const shapeGroup = icon.findAncestor('.shapeGroup')
    const interactiveGroup = shapeWrap.findOne('.interactiveGroup')

    const tr = interactiveGroup.findOne('.transformer')
    if (!shapeWrap.getAttr('activable') || tr) {
        return
    }

    hideAllInteractiveTools(stage)
    let transformer = new Konva.Transformer({
        name: 'transformer',
        rotateHandlerOffset: 20,
        enabledHandlers: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
    })
    // 缩放图标时修改系统设置的图标预设尺寸
    transformer.on('dragend', function (e) {
        const shapeWrap = this.findAncestor('.shapeWrap')
        const shapeGroup = shapeWrap.findOne('.shapeGroup')
        const mainShape = shapeWrap.findOne('.mainShape')
        const scaleX = shapeGroup.getAttr('scaleX') || 1
        const scaleY = shapeGroup.getAttr('scaleY') || 1
        const shapeWidth = mainShape.getAttr('width')
        const shapeHeight = mainShape.getAttr('height')
        const size = {
            width: shapeWidth * scaleX,
            height: shapeHeight * scaleY
        }
        let localSetting = drawLib.getLocalSetting()
        localSetting.icon = size
        localStorage.setItem('plotSetting', JSON.stringify(localSetting))
    })
    transformer.attachTo(shapeGroup)
    interactiveGroup.add(transformer)

    shapeGroup.setDraggable(true)
    shapeWrap.setAttr('actived', true)
    switchInteractives(shapeWrap, 'show')
    redrawAllLayer(stage)
}

function reloadShape (shapeWrap) {
    const shapeCfg = shapeWrap.getAttr('_shapeCfg')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')
    let imageObj = new Image()

    shapeWrap.setAttr('actived', false)

    imageObj.onload = function () {
        mainShape.image(imageObj)
        mainShape.on('evt-active', initActive)
        mainShape.draw()
    }
    imageObj.src = shapeCfg.src + '.png'
}

export default {
    init,
    applyFeature,
    reloadShape
}
