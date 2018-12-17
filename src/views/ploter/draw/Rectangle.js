import {
    isEmpty
} from '@/common/utils'
import {
    initShapeWrap,
    // getTargetLayer,
    getDrawingGroup,
    exitPlotTool,
    switchInteractives,
    redrawAllLayer,
    hideAllInteractiveTools
} from './utils'

function init (toolCfg, stage) {
    exitPlotTool(stage)

    stage.on('evt-draw', function (e) {
        let point = stage.getPointerPosition()
        draw(stage, point, toolCfg)
        stage.on('mousemove', function (e) {
            var point = stage.getPointerPosition()
            draw(stage, point, toolCfg)
        })
        stage.on('mouseup', function (e) {
            stage.off('mousemove')
            var point = stage.getPointerPosition()
            draw(stage, point, toolCfg, true)
            stage.off('mouseup')
            stage.fire('evt_update_legend')
        })
    })
}

function draw (stage, point, cfg, drawn) {
    let targetLayer = stage.findOne('.shapesLayer')
    let shapeGroup = getDrawingGroup(stage)
    let shapeWrap = null
    if (isEmpty(shapeGroup)) {
        shapeWrap = initShapeWrap(cfg)
        shapeWrap.setAttr('activable', true)
        shapeGroup = shapeWrap.findOne('.shapeGroup')
        shapeGroup.setAttr('_isDrawn', false)
        targetLayer.add(shapeWrap)
    } else {
        shapeWrap = shapeGroup.findAncestor('.shapeWrap')
    }
    let rect = shapeGroup.findOne('.mainShape')
    const scale = stage.scale()
    if (!rect) {
        rect = new Konva.Rect({
            name: 'mainShape',
            x: point.x / scale.x,
            y: point.y / scale.y,
            width: 0,
            height: 0,
            opacity: 0.3,
            dashEnabled: false,
            draggable: false,
            ...cfg.style.mainShape
        })
        rect.on('evt-active', initActive)
        shapeGroup.add(rect)
    } else {
        const rectSize = {
            width: Math.abs(point.x / scale.x - rect.getX()),
            height: Math.abs(point.y / scale.y - rect.getY())
        }
        rect.setAttrs(rectSize)
        if (drawn) {
            if (rect.getWidth() < 8 || rect.getHeight() < 8) {
                shapeWrap.destroy()
                console.log('图形尺寸过小，取消绘制')
            } else {
                if (cfg.style.mainShape.backgroundImage) {
                    if (cfg.style.mainShape.fillPatternRepeat === 'no-repeat') {
                        const xz = rect.x() + (rect.getWidth() - cfg.style.mainShape.backgroundImage.width) / 2
                        const yz = rect.y() + (rect.getHeight() - cfg.style.mainShape.backgroundImage.height) / 2
                        let imageObj = new Image()
                        imageObj.onload = function () {
                            let icon = new Konva.Image({
                                name: 'fillicon',
                                x: xz,
                                y: yz,
                                width: cfg.style.mainShape.backgroundImage.width,
                                height: cfg.style.mainShape.backgroundImage.height,
                                image: imageObj,
                                draggable: false
                            })
                            shapeGroup.add(icon)
                            shapeGroup.draw()
                        }
                        let svgSrc = cfg.style.mainShape.backgroundImage.src
                        // svgSrc = svgSrc.replace(/fill:.*?;/g,
                        //     'fill:' + cfg.style.mainShape.backgroundImage.fill + ';')
                        // svgSrc = svgSrc.replace(/stroke:.*?;/g,
                        //     'stroke:' + cfg.style.mainShape.backgroundImage.stroke + ';')
                        imageObj.src = svgSrc
                    } else {
                        let imageObj = new Image(cfg.style.mainShape.backgroundImage.width,
                            cfg.style.mainShape.backgroundImage.height)
                        imageObj.onload = function () {
                            rect.setAttr('fillPatternImage', imageObj)
                            shapeGroup.draw()
                        }
                        imageObj.src = cfg.style.mainShape.backgroundImage.src
                    }
                }
                if (cfg.style.textShape) {
                    initTextShape(shapeWrap, cfg)
                }
                rect.setOpacity(1)
                rect.setFillPriority('pattern')
                shapeGroup.setAttr('_isDrawn', true)

                shapeWrap.on('dblclick', e => {
                    stage.fire('evt_stage_element_dblclick', shapeWrap)
                })

                shapeWrap.on('mousedown', e => {
                    const domEvent = e.evt
                    if (domEvent.button === 2) {
                        stage.fire('evt_stage_element_contextmenu', {
                            event: domEvent,
                            element: shapeWrap
                        })
                    }
                })

                shapeWrap.on('mouseenter', e => {
                    stage.fire('evt_stage_element_mouseenter', shapeWrap)
                })
                shapeWrap.on('mouseleave', e => {
                    stage.fire('evt_stage_element_mouseleave', shapeWrap)
                })

                stage.fire('evt_stage_element_changed', {
                    changeType: 'add',
                    element: shapeWrap
                })
            }
        }
    }
    targetLayer.draw()

    window.plotstack.execute(new window.InsertCommand(stage, '.shapesLayer', shapeGroup))
}

function initTextShape (shapeWrap, cfg) {
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const textShapeCfg = cfg.style.textShape
    textShapeCfg.forEach(textCfg => {
        let text = new Konva.Text({
            name: 'textShape',
            draggable: false,
            ...textCfg
        })
        text.on('evt-active', initActive)
        shapeGroup.add(text)
    })
    setTextOffset(shapeGroup)
}

function applyFeature (stage, shape, option) {
    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')
    const textShape = shapeGroup.find('.textShape')

    let editCmd = new window.EditCommand(stage, '.shapesLayer')
    editCmd.setOldValue(shapeGroup)

    // shapeGroup.opacity(option.opacity)
    if (mainShape) {
        for (const key in option.mainShape) {
            if (option.mainShape.hasOwnProperty(key)) {
                const value = option.mainShape[key]
                mainShape.setAttr(key, value)
            }
        }
    }
    if (textShape) {
        for (const key in option.textShape) {
            if (option.textShape.hasOwnProperty(key)) {
                const value = option.textShape[key]
                textShape.setAttr(key, value)
            }
        }
        option.textShape.fields.forEach(field => {
            textShape.forEach(shape => {
                if (shape.getAttr('alias') === field.alias) {
                    shape.setAttr('text', field.value)
                    shape.setAttr('fontSize', field.fontSize)
                    shape.setAttr('fontStyle', field.fontStyle)
                    shape.setAttr('fontFamily', field.fontFamily)
                }
            })
        })
    }
    let targetLayer = stage.findOne('.shapesLayer')
    targetLayer.draw()

    editCmd.setNewValue(shapeGroup)
    window.plotstack.execute(editCmd)
}

function initActive (rect) {
    // const shapeCfg = rect.getAttr('_shapeCfg')
    const layer = rect.getLayer()
    const stage = rect.getStage()
    const shapeWrap = rect.findAncestor('.shapeWrap')
    const shapeGroup = rect.findAncestor('.shapeGroup')
    const textShapes = shapeGroup.find('.textShape')
    const interactiveGroup = shapeWrap.findOne('.interactiveGroup')
    if (!shapeWrap.getAttr('activable') || shapeWrap.getAttr('actived')) {
        return
    }
    hideAllInteractiveTools(stage)
    const mainShape = shapeGroup.findOne('.mainShape')
    let transformer = new Konva.Transformer({
        rotateEnabled: false,
        enabledHandlers: ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']
    })
    transformer.on('dragmove', function (e) {
        shapetransform(transformer, shapeGroup)
        textShapes.setAttr('visible', false)
        mainShape.setFillPriority('color')
        mainShape.setOpacity(0.5)
        layer.draw()
    })
    transformer.on('dragend', function (e) {
        shapetransform(transformer, shapeGroup)
        textShapes.setAttr('visible', true)
        mainShape.setFillPriority('pattern')
        mainShape.setOpacity(1)

        setTextOffset(shapeGroup)
        layer.draw()
    })
    transformer.attachTo(shapeGroup)
    interactiveGroup.add(transformer)

    shapeGroup.setDraggable(true)
    shapeWrap.setAttr('actived', true)
    switchInteractives(shapeWrap, 'show')
    redrawAllLayer(stage)
}

function reloadShape (shapeWrap) {
    const stage = shapeWrap.getStage()
    const shapeCfg = shapeWrap.getAttr('_shapeCfg')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')
    const mainShape = shapeGroup.findOne('.mainShape')
    const textShape = shapeGroup.findOne('.textShape')

    mainShape.on('evt-active', initActive)

    shapeWrap.on('dblclick', e => {
        stage.fire('evt_stage_element_dblclick', shapeWrap)
    })

    shapeWrap.on('mouseenter', e => {
        const domEvent = e.evt
        stage.fire('evt_stage_element_mouseenter', {
            event: domEvent,
            element: shapeWrap
        })
    })
    shapeWrap.on('mouseleave', e => {
        const domEvent = e.evt
        stage.fire('evt_stage_element_mouseleave', {
            event: domEvent,
            element: shapeWrap
        })
    })

    shapeWrap.on('mousedown', e => {
        const domEvent = e.evt
        if (domEvent.button === 2) {
            stage.fire('evt_stage_element_contextmenu', {
                event: domEvent,
                element: shapeWrap
            })
        }
    })
    if (textShape) {
        textShape.on('evt-active', initActive)
    }
    if (shapeCfg.style.mainShape.backgroundImage) {
        if (shapeCfg.style.mainShape.fillPatternRepeat === 'no-repeat') {
            const fillicon = shapeGroup.findOne('.fillicon')
            if (fillicon) {
                let imageObj = new Image()
                imageObj.onload = function () {
                    fillicon.image(imageObj)
                    shapeGroup.draw()
                }
                let svgSrc = shapeCfg.style.mainShape.backgroundImage.src
                // svgSrc = svgSrc.replace(/fill:.*?;/g,
                //     'fill:' + shapeCfg.style.mainShape.backgroundImage.fill + ';')
                // svgSrc = svgSrc.replace(/stroke:.*?;/g,
                //     'stroke:' + shapeCfg.style.mainShape.backgroundImage.stroke + ';')
                imageObj.src = svgSrc
            }
        } else {
            let imageObj = new Image()
            imageObj.onload = function () {
                mainShape.setAttr('fillPatternImage', imageObj)
                shapeGroup.draw()
            }
            imageObj.src = shapeCfg.style.mainShape.backgroundImage.src
        }
    }
}

function shapetransform (transformer, shapeGroup) {
}

function setTextOffset (shapeGroup) {
    const mainShape = shapeGroup.findOne('.mainShape')
    const textShapes = shapeGroup.find('.textShape')

    const scaleX = shapeGroup.getAttr('scaleX')
    const scaleY = shapeGroup.getAttr('scaleY')
    // const absolutePosition = mainShape.getAbsolutePosition()
    const mainShapeBox = {
        x: mainShape.getX(),
        y: mainShape.getY(),
        width: mainShape.getWidth(),
        height: mainShape.getHeight()
    }
    const textWidth = mainShapeBox.width - 8

    let textTotalHeight = 0
    textShapes.forEach(textItem => {
        textTotalHeight += textItem.getHeight()
        // const fontSize = textItem.getAttr('fontSize')
        textItem.setAttrs({
            width: textWidth * scaleX,
            scaleX: 1 / scaleX,
            scaleY: 1 / scaleY
        })
        // if (textItem.getAttr('verticalAlign') === 'top') {
        if (textItem.getAttr('alias') === 'code') {
            textItem.setAttrs({
                x: mainShapeBox.x + (mainShapeBox.width / 2) - (textWidth / 2),
                y: mainShapeBox.y
            })
        } else if (textItem.getAttr('alias') === 'name') {
            textItem.setAttrs({
                x: mainShapeBox.x + (mainShapeBox.width / 2) - (textWidth / 2),
                y: mainShapeBox.y + (mainShapeBox.height / 2) - (textItem.getHeight() / 2)
            })
        // } else if (textItem.getAttr('verticalAlign') === 'bottom') {
        //     textItem.setAttrs({
        //         x: mainShapeBox.x + (mainShapeBox.width / 2) - (textWidth / 2),
        //         y: mainShapeBox.y + mainShapeBox.height - textItem.getHeight()
        //     })
        }
    })
    let titleShapeIndex = textShapes.findIndex(item => {
        return item.getAttr('alias') === 'title'
    })
    if (titleShapeIndex >= 0) {
        if (mainShapeBox.height * scaleY < textTotalHeight + 20) {
            textShapes[titleShapeIndex].setAttr('visible', false)
        } else {
            textShapes[titleShapeIndex].setAttr('visible', true)
        }
    }
}

export default {
    init,
    applyFeature,
    reloadShape
}
