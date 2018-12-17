import {
    initShapeWrap,
    switchInteractives,
    redrawAllLayer,
    hideAllInteractiveTools,
    exitPlotTool
} from './utils'

function init (toolCfg, stage) {
    exitPlotTool(stage)
    draw(toolCfg, stage)
}

function draw (cfg, stage) {
    // let targetLayer = getTargetLayer(cfg, stage)
    let targetLayer = stage.findOne('.shapesLayer')
    let imageObj = new Image()
    imageObj.onload = function () {
        let shapeWrap = initShapeWrap(cfg)
        shapeWrap.setAttr('activable', true)
        let shapeGroup = shapeWrap.findOne('.shapeGroup')
        targetLayer.add(shapeWrap)

        const imgSize = calcImageSize(imageObj, cfg.style.importSize, stage)
        const imgPosition = calcImageimagePosition(imgSize, stage)

        let image = new Konva.Image({
            name: 'mainShape',
            image: imageObj,
            ...imgPosition,
            ...imgSize,
            draggable: false
        })
        image.on('evt-active', initActive)
        shapeGroup.add(image)

        targetLayer.draw()

        window.plotstack.execute(new window.InsertCommand(stage, '.shapesLayer', shapeGroup))
    }
    imageObj.src = cfg.style.mainShape.src
}

function applyFeature (stage, shape, option) {
    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')

    let editCmd = new window.EditCommand(stage, '.shapesLayer')
    editCmd.setOldValue(shapeGroup)

    shapeGroup.opacity(option.opacity)

    if (mainShape) {
        mainShape.setAttrs(option.mainShape)
    }
    let targetLayer = stage.findOne('.shapesLayer')
    targetLayer.draw()

    editCmd.setNewValue(shapeGroup)
    window.plotstack.execute(editCmd)
}

function initActive (image) {
    const stage = image.getStage()
    const shapeWrap = image.findAncestor('.shapeWrap')
    const shapeGroup = image.findAncestor('.shapeGroup')
    const interactiveGroup = shapeWrap.findOne('.interactiveGroup')
    // const shapeCfg = shapeWrap.getAttr('_shapeCfg')
    if (!shapeWrap.getAttr('activable') || shapeWrap.getAttr('actived')) {
        return
    }

    hideAllInteractiveTools(stage)
    let transformer = new Konva.Transformer({
        rotateHandlerOffset: 20,
        enabledHandlers: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']
    })
    transformer.attachTo(shapeGroup)
    interactiveGroup.add(transformer)

    shapeGroup.setDraggable(true)
    shapeWrap.setAttr('actived', true)
    switchInteractives(shapeWrap, 'show')
    redrawAllLayer(stage)
    // e.cancelBubble = true
}

function reloadShape (shapeWrap) {
    const shapeCfg = shapeWrap.getAttr('_shapeCfg')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    // const interactiveGroup = shapeWrap.findOne('.interactiveGroup')
    const mainShape = shapeGroup.findOne('.mainShape')

    mainShape.on('evt-active', initActive)
    let imageObj = new Image()
    imageObj.onload = function () {
        mainShape.image(imageObj)
        mainShape.on('evt-active', initActive)
        mainShape.draw()
    }
    imageObj.src = shapeCfg.style.mainShape.src
}

function calcImageSize (image, calcMode, stage) {
    const imgWidth = image.width
    const imgHeight = image.height
    const stageWidth = stage.getWidth()
    const stageHeight = stage.getHeight()

    let imageSize = {
        width: imgWidth,
        height: imgHeight
    }
    if (calcMode === 'auto') {
        if (imgWidth > imgHeight) {
            if (imgWidth > stageWidth * 0.9) {
                imageSize.width = Math.round(stageWidth * 0.9)
                imageSize.height = Math.round(imgHeight * (imageSize.width / imgWidth))
            }
        } else if (imgWidth < imgHeight) {
            if (imgHeight > stageHeight * 0.9) {
                imageSize.height = Math.round(stageHeight * 0.9)
                imageSize.width = Math.round(imgWidth * (imageSize.height / imgHeight))
            }
        } else {
            if (imgWidth > stageWidth * 0.9) {
                if (stageWidth > stageHeight) {
                    imageSize.width = Math.round(stageHeight * 0.9)
                    imageSize.height = Math.round(stageHeight * 0.9)
                } else if (stageWidth < stageHeight) {
                    imageSize.width = Math.round(stageWidth * 0.9)
                    imageSize.height = Math.round(stageWidth * 0.9)
                } else {
                    imageSize.width = Math.round(stageWidth * 0.9)
                    imageSize.height = Math.round(stageHeight * 0.9)
                }
            }
        }
    } else if (calcMode === 'canvas') {
        if (imgWidth > imgHeight) {
            imageSize.width = Math.round(stageWidth * 0.9)
            imageSize.height = Math.round(imgHeight * (imageSize.width / imgWidth))
        } else if (imgWidth < imgHeight) {
            imageSize.height = Math.round(stageHeight * 0.9)
            imageSize.width = Math.round(imgWidth * (imageSize.height / imgHeight))
        } else {
            if (stageWidth > stageHeight) {
                imageSize.width = Math.round(stageHeight * 0.9)
                imageSize.height = Math.round(stageHeight * 0.9)
            } else if (stageWidth < stageHeight) {
                imageSize.width = Math.round(stageWidth * 0.9)
                imageSize.height = Math.round(stageWidth * 0.9)
            } else {
                imageSize.width = Math.round(stageWidth * 0.9)
                imageSize.height = Math.round(stageHeight * 0.9)
            }
        }
    }

    return imageSize
}

function calcImageimagePosition (imgSize, stage) {
    const imgWidth = imgSize.width
    const imgHeight = imgSize.height
    const stageWidth = stage.getWidth()
    const stageHeight = stage.getHeight()
    let imagePosition = {
        x: Math.round((stageWidth - imgWidth) / 2),
        y: Math.round((stageHeight - imgHeight) / 2)
    }

    return imagePosition
}

export default {
    init,
    applyFeature,
    reloadShape
}
