import uuidV1 from 'uuid/v1'

export function initShapeWrap (cfg) {
    let shapeWrap = new Konva.Group({
        name: 'shapeWrap',
        _shapeCfg: cfg,
        draggable: false,
        shapeUuid: uuidV1()
    })
    let shapeGroup = new Konva.Group({
        name: 'shapeGroup',
        draggable: false
    })
    let interactiveGroup = new Konva.Group({
        name: 'interactiveGroup',
        draggable: false
    })

    shapeWrap.add(shapeGroup, interactiveGroup)
    return shapeWrap
}

export function getRotation360 (rotation) {
    let result = 0
    if (rotation <= 360) {
        result = rotation
    } else {
        result = 360 * ('0.' + (rotation / 360 + '').split('.')[1])
    }
    return result
}

export function getTargetId (id) {
    let target = id.split('_')[0]
    return target.replace(/^\S/, (s) => {
        return s.toUpperCase()
    })
}

export function getTargetLayer (tool, stage) {
    return stage.findOne('.shape' + getTargetId(tool.id) + 'Layer')
}

export function getGroup (shape) {
    let group = null
    if (shape.parent.getAttr('name') === 'shapeGroup') {
        group = shape.parent
    }
    return group
}

export function getDrawingGroup (stage) {
    const shapeGroups = stage.find('.shapeGroup')
    let drawingGroup = null
    shapeGroups.forEach((item) => {
        const isDrawn = item.getAttr('_isDrawn')
        if (isDrawn === false) {
            drawingGroup = item
            return false
        }
    })

    return drawingGroup
}

export function exitPlotTool (stage) {
    stage.off('evt-draw')
    stage.off('evt-stop')

    stopDraw(stage)
}

export function stopDraw (stage) {
    let drawingGroup = getDrawingGroup(stage)
    if (drawingGroup) {
        drawingGroup.setAttr('_isDrawn', true)
    }

    hideAllInteractiveTools(stage)
    redrawAllLayer(stage)
}

export function hideAllInteractiveTools (stage) {
    // 变形工具
    let transformer = stage.find('Transformer')
    transformer.destroy()
    // 锚点
    let anchors = stage.find('.shapeAnchor')
    anchors.hide()
    // 辅助线
    let subline = stage.find('.shapeSubline')
    subline.hide()

    let shapeWraps = stage.find('.shapeWrap')
    shapeWraps.forEach((item) => {
        if (item.getAttr('actived')) {
            item.setAttr('actived', false)
        }
    })

    let shapeGroups = stage.find('.shapeGroup')
    shapeGroups.forEach((item) => {
        if (item.getDraggable()) {
            item.setDraggable(false)
        }
    })
}

export function switchInteractives (group, value) {
    const layer = group.getLayer()
    let points = group.find('.shapeAnchor')
    points[value]()
    let subline = group.find('.shapeSubline')
    subline[value]()
    let transformer = group.find('Transformer')
    transformer[value]()
    layer.draw()
}

export function redrawAllLayer (stage) {
    stage.children.forEach(layer => {
        layer.draw()
    })
}

export function deleteShape (shape) {
    if (!shape) return
    const stage = shape.getStage()
    const layer = shape.getLayer()
    const shapeWrap = shape.findAncestor('.shapeWrap')
    const shapeGroup = shapeWrap.findOne('.shapeGroup')

    let layerName = '.' + layer.getAttr('name')
    window.plotstack.execute(new window.DeleteCommand(stage, layerName, shapeGroup))

    if (shapeWrap) {
        shapeWrap.destroy()
        layer.draw()
    } else {
        shape.destroy()
    }

    stage.fire('evt_update_elements', {
        type: 'delete',
        element: shapeWrap
    })
    stage.fire('evt_update_legend')
}

export function pasteShape (shape) {
    if (!shape) return
    const layer = shape.getLayer()
    const shapeWrap = shape.findAncestor('.shapeWrap')

    let newShapeWrap = shapeWrap.clone()
    layer.add(newShapeWrap)
    newShapeWrap.move({
        x: 20,
        y: 20
    })
    layer.draw()

    const stage = shape.getStage()
    stage.fire('evt_update_legend')

    let layerName = '.' + layer.getAttr('name')
    const shapeGroup = newShapeWrap.findOne('.shapeGroup')
    window.plotstack.execute(new window.InsertCommand(stage, layerName, shapeGroup))
}

export function downloadURI (uri, name) {
    let link = document.createElement('a')
    link.download = name
    link.style.display = 'none'

    let byteString = atob(uri.split(',')[1])
    let mimeString = uri.split(',')[0].split(':')[1].split(';')[0]
    let ab = new ArrayBuffer(byteString.length)
    let ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([ab], {type: mimeString})

    link.href = window.URL.createObjectURL(blob)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    link.remove()
}

export function downloadBlob (content, name) {
    let link = document.createElement('a')
    link.download = name
    link.style.display = 'none'
    const blob = new Blob([content])
    link.href = window.URL.createObjectURL(blob)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    link.remove()
}

