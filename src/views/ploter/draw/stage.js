// import drawLib from './draw'
import store from '@/store'
import uuidV1 from 'uuid/v1'

export function prepareStageData (data) {
    let dataObj = data
    if (typeof dataObj === 'string') {
        dataObj = JSON.parse(data)
    }
    prepareStageElements(dataObj)
    let layers = dataObj.children
    let shapesLayer = layers.find(item => {
        return item.attrs.name === 'shapesLayer'
    })
    let elements = shapesLayer.children
    elements.forEach(element => {
        const attrs = element.attrs
        if (attrs && attrs.name === 'shapeWrap' && !attrs.shapeUuid) {
            attrs.shapeUuid = uuidV1()
        }
    })
    return dataObj
}

export function prepareStageElements (stageData) {
    let layers = stageData.children
    let shapesLayer = layers.find(item => {
        return item.attrs.name === 'shapesLayer'
    })
    let list = []
    let elements = shapesLayer.children
    elements.forEach(element => {
        list.push(element)
    })
    store.commit('updateStageElements', list)
}

export function getShapeOnStage (shapeUuid) {
    const stage = window.ploterStage
    const shapesLayer = stage.findOne('.shapesLayer')
    let shape = null
    if (shapesLayer.children) {
        for (let index = 0; index < shapesLayer.children.length; index++) {
            const shapeItem = shapesLayer.children[index]
            let itemUuid = shapeItem.getAttr('shapeUuid')
            if (itemUuid === shapeUuid) {
                shape = shapeItem
            }
        }
    }
    return shape
}

// export default {
//     prepareStageData,
//     prepareStageElements,
//     getShapeOnStage
// }
