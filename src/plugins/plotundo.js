function init () {
    window.plotstack = new Undo.Stack()
    window.InsertCommand = Undo.Command.extend({
        constructor: function (stage, layer, shapeGroup) {
            this.stage = stage
            this.layer = layer
            this.shapeGroup = shapeGroup
            this.shapeWrapOld = shapeGroup.findAncestor('.shapeWrap')
            this.targetLayer = stage.findOne(this.layer)
            this.shapeWrap = null
        },
        execute: function () {
        },
        undo: function () {
            this.shapeWrap = this.shapeWrapOld.clone()

            let deleteShapes = []
            this.shapeWrapOld.children.forEach(group => {
                group.children.forEach(shape => {
                    deleteShapes.push(shape)
                })
                deleteShapes.push(group)
            })
            for (let i = 0; i < deleteShapes.length; i++) {
                deleteShapes[i].destroy()
            }
            this.shapeWrapOld.destroy()
            this.targetLayer.draw()

            if (this.layer !== '.legendLayer') {
                this.stage.fire('evt_update_legend')
            }
        },
        redo: function () {
            if (!this.shapeWrap) return

            this.targetLayer.add(this.shapeWrap)
            this.targetLayer.draw()

            if (this.layer !== '.legendLayer') {
                this.stage.fire('evt_update_legend')
            }

            this.shapeWrapOld = this.shapeWrap
        }
    })
    window.EditCommand = Undo.Command.extend({
        constructor: function (stage, layer) {
            this.stage = stage
            this.layer = layer
            this.shapeGroupOld = null
            this.shapeGroupNew = null
            this.shapeGroup = null
        },
        setOldValue: function (shapeGroupOld) {
            this.shapeGroupOld = shapeGroupOld.clone()
        },
        setNewValue: function (shapeGroup) {
            this.shapeGroup = shapeGroup
        },
        execute: function () {
        },
        undo: function () {
            if (!this.shapeGroup) return
            if (!this.shapeGroupOld) return

            this.shapeGroupNew = this.shapeGroup.clone()

            for (let i = 0; i < this.shapeGroup.children.length; i++) {
                const shape = this.shapeGroup.children[i]
                const oldShape = this.shapeGroupOld.children[i]
                shape.setAttrs(oldShape.getAttrs())
            }
            this.shapeGroup.setAttrs(this.shapeGroupOld.getAttrs())

            const targetLayer = this.stage.findOne(this.layer)
            targetLayer.draw()
        },
        redo: function () {
            if (!this.shapeGroup) return
            if (!this.shapeGroupNew) return

            for (let i = 0; i < this.shapeGroup.children.length; i++) {
                const shape = this.shapeGroup.children[i]
                const oldShape = this.shapeGroupNew.children[i]
                shape.setAttrs(oldShape.getAttrs())
            }
            this.shapeGroup.setAttrs(this.shapeGroupNew.getAttrs())

            const targetLayer = this.stage.findOne(this.layer)
            targetLayer.draw()
        }
    })
    window.DeleteCommand = Undo.Command.extend({
        constructor: function (stage, layer, shapeGroup) {
            this.stage = stage
            this.layer = layer
            this.shapeGroup = shapeGroup
            this.shapeWrapOld = shapeGroup.findAncestor('.shapeWrap')
            this.targetLayer = stage.findOne(this.layer)
            this.shapeWrap = null
        },
        execute: function () {
            this.shapeWrap = this.shapeWrapOld.clone()
        },
        undo: function () {
            if (!this.shapeWrap) return

            this.targetLayer.add(this.shapeWrap)
            this.targetLayer.draw()
            this.stage.fire('evt_update_legend')

            this.shapeWrapOld = this.shapeWrap
        },
        redo: function () {
            this.shapeWrap = this.shapeWrapOld.clone()

            let deleteShapes = []
            this.shapeWrapOld.children.forEach(group => {
                group.children.forEach(shape => {
                    deleteShapes.push(shape)
                })
                deleteShapes.push(group)
            })
            for (let i = 0; i < deleteShapes.length; i++) {
                deleteShapes[i].destroy()
            }
            this.shapeWrapOld.destroy()
            this.targetLayer.draw()
            this.stage.fire('evt_update_legend')
        }
    })
}

export default {
    init
}
