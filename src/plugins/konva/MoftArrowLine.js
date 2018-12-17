import Konva from 'konva'
(function (Konva) {
    'use strict'
    Konva.MoftArrowLine = function (config) {
        this.____init(config)
    }

    Konva.MoftArrowLine.prototype = {
        ____init: function (config) {
            if (config.moftArrowStyle) {
                if (config.moftArrowStyle.opacity) {
                    config.opacity = config.moftArrowStyle.opacity
                }
            } else {
                config.opacity = 1
            }

            Konva.Line.call(this, config)
            this.className = 'MoftArrowLine'
        },
        _sceneFunc: function (ctx) {
            Konva.Line.prototype._sceneFunc.apply(this, arguments)
            var moftArrowStyle = this.moftArrowStyle()
            var moftArrowName = moftArrowStyle.name
            var moftArrowNames = ['moftNormal', 'moftSpare', 'moftEvacuate', 'moftEvacuateSpare', 'moftSearch', 'moftNormalArrow', 'moftSwallowArrow']
            if (moftArrowNames.indexOf(moftArrowName) === -1) {
                return
            }
            var PI2 = Math.PI * 2
            var points = this.points()
            var n = points.length / 2
            var moftArrowWidth = moftArrowStyle.width
            if (!moftArrowWidth) {
                moftArrowWidth = 30
                if ((moftArrowName === 'moftSearch') || (moftArrowName === 'moftNormalArrow') || (moftArrowName === 'moftSwallowArrow')) {
                    moftArrowWidth = 10
                }
            }
            var moftLineHeight = moftArrowStyle.height
            if (!moftLineHeight) {
                if (moftArrowName === 'moftSwallowArrow') {
                    moftLineHeight = 5
                } else {
                    moftLineHeight = 0
                }
            }
            var moftTriWidth = moftArrowWidth * 0.45
            var moftTriHeight = moftArrowWidth * 0.65
            var moftMidSpace = moftArrowWidth * 0.04
            var moftRectFWidth = moftArrowWidth * 0.06
            var moftRectSWidth = moftArrowWidth * 0.14
            // var moftRectTWidth = moftArrowWidth * 0.27
            var moftRectWidth = moftArrowWidth * 0.55
            var moftRectHeight = moftArrowWidth * 0.25
            var moftArrowTail = moftArrowWidth * 0.67
            var moftArrowHead = moftArrowWidth * 0.33
            var moftSpace = moftArrowStyle.space
            if (!moftSpace) {
                moftSpace = 10
                if (moftArrowName === 'moftSearch') {
                    moftSpace = 20
                }
            }
            if (moftArrowName === 'moftEvacuate') {
                moftSpace = 0
            }
            var arrowTotal = moftSpace + moftArrowWidth
            ctx.save()
            ctx.beginPath()
            for (var i = 0; i < (n - 1); i++) {
                var dx = points[2 * i + 2] - points[2 * i]
                var dy = points[2 * i + 3] - points[2 * i + 1]
                var radians = (Math.atan2(dy, dx) + PI2) % PI2
                var lineLength = Math.sqrt(dx * dx + dy * dy)
                var startPoint = 0
                if (moftArrowName === 'moftNormalArrow') {
                    ctx.translate(points[2], points[3])
                    ctx.rotate(radians)
                    ctx.moveTo(moftArrowWidth / 2, 0)
                    ctx.lineTo(-moftArrowWidth / 2, moftArrowWidth / 2)
                    ctx.lineTo(-moftArrowWidth / 6, 0)
                    ctx.lineTo(-moftArrowWidth / 2, -moftArrowWidth / 2)
                    ctx.closePath()
                    ctx.moveTo(moftArrowWidth / 2, 0)
                    ctx.lineTo(-lineLength, 0)
                    ctx.restore()
                } else if (moftArrowName === 'moftSwallowArrow') {
                    ctx.translate(points[2], points[3])
                    ctx.rotate(radians)
                    ctx.moveTo(moftArrowWidth / 2, 0)
                    ctx.lineTo(-moftArrowWidth / 2, moftArrowWidth / 2)
                    ctx.lineTo(-moftArrowWidth / 2, moftLineHeight / 2)
                    ctx.lineTo(-moftLineHeight / 2 - lineLength, moftLineHeight / 2)
                    ctx.lineTo(-lineLength, 0)
                    ctx.lineTo(-moftLineHeight / 2 - lineLength, -moftLineHeight / 2)
                    ctx.lineTo(-moftArrowWidth / 2, -moftLineHeight / 2)
                    ctx.lineTo(-moftArrowWidth / 2, -moftArrowWidth / 2)
                    ctx.closePath()
                    ctx.restore()
                } else if (moftArrowName === 'moftSearch') {
                    if (lineLength > (moftArrowWidth / 2)) {
                        startPoint = (lineLength - moftArrowWidth) / 2
                        if (lineLength > arrowTotal) {
                            startPoint = moftSpace / 2
                        }
                        ctx.save()
                        ctx.translate(points[2 * i], points[2 * i + 1])
                        ctx.rotate(radians)
                        ctx.moveTo(lineLength - startPoint, 0)
                        ctx.lineTo(lineLength - startPoint - moftArrowWidth, moftArrowWidth / 2)
                        ctx.lineTo(lineLength - startPoint - moftArrowWidth / 2, 0)
                        ctx.lineTo(lineLength - startPoint - moftArrowWidth, -moftArrowWidth / 2)
                        ctx.closePath()
                        ctx.moveTo(startPoint, 0)
                        ctx.lineTo(lineLength - startPoint - moftArrowWidth / 4, 0)
                        ctx.restore()
                    } else {
                        ctx.save()
                        ctx.translate(points[2 * i], points[2 * i + 1])
                        ctx.rotate(radians)
                        ctx.moveTo(moftArrowWidth / 2, 0)
                        ctx.lineTo(lineLength - startPoint - moftArrowWidth, moftArrowWidth / 2)
                        ctx.lineTo(lineLength - startPoint - moftArrowWidth / 2, 0)
                        ctx.lineTo(lineLength - startPoint - moftArrowWidth, -moftArrowWidth / 2)
                        ctx.closePath()
                        ctx.moveTo(startPoint, 0)
                        ctx.lineTo(lineLength - startPoint - moftArrowWidth / 4, 0)
                        ctx.restore()
                    }
                } else {
                    var arrowCount = Math.floor((lineLength + moftSpace) / arrowTotal)
                    var startBlankLength = ((lineLength + moftSpace) - (arrowTotal) * arrowCount) / 2
                    if (arrowCount > 0) {
                        if (moftArrowName === 'moftEvacuate') {
                            ctx.save()
                            ctx.translate(points[2 * i], points[2 * i + 1])
                            ctx.rotate(radians)
                            ctx.moveTo(0, 0)
                            ctx.lineTo(startBlankLength, 0)
                            ctx.moveTo(lineLength - startBlankLength, 0)
                            ctx.lineTo(lineLength, 0)
                            ctx.restore()
                        }
                        for (var j = 0; j < arrowCount; j++) {
                            startPoint = startBlankLength + arrowTotal * j
                            ctx.save()
                            ctx.translate(points[2 * i], points[2 * i + 1])
                            ctx.rotate(radians)
                            if (moftArrowName === 'moftNormal') {
                                ctx.moveTo(startPoint, moftRectHeight / 2)
                                ctx.lineTo(moftRectFWidth + startPoint, moftRectHeight / 2)
                                ctx.lineTo(moftRectFWidth + startPoint, -moftRectHeight / 2)
                                ctx.lineTo(startPoint, -moftRectHeight / 2)
                                ctx.closePath()
                                ctx.moveTo(startPoint + moftRectFWidth + moftMidSpace, moftRectHeight / 2)
                                ctx.lineTo(startPoint + moftRectFWidth + moftMidSpace + moftRectSWidth, moftRectHeight / 2)
                                ctx.lineTo(startPoint + moftRectFWidth + moftMidSpace + moftRectSWidth, -moftRectHeight / 2)
                                ctx.lineTo(startPoint + moftRectFWidth + moftMidSpace, -moftRectHeight / 2)
                                ctx.closePath()
                                ctx.moveTo(startPoint + moftRectFWidth + moftMidSpace * 2 + moftRectSWidth, moftRectHeight / 2)
                                ctx.lineTo(startPoint + moftArrowWidth - moftTriWidth, moftRectHeight / 2)
                                ctx.lineTo(startPoint + moftArrowWidth - moftTriWidth, moftTriHeight / 2)
                                ctx.lineTo(startPoint + moftArrowWidth, 0)
                                ctx.lineTo(startPoint + moftArrowWidth - moftTriWidth, -moftTriHeight / 2)
                                ctx.lineTo(startPoint + moftArrowWidth - moftTriWidth, -moftRectHeight / 2)
                                ctx.lineTo(startPoint + moftRectFWidth + moftMidSpace * 2 + moftRectSWidth, -moftRectHeight / 2)
                                ctx.closePath()
                                ctx.restore()
                            } else if (moftArrowName === 'moftSpare') {
                                ctx.moveTo(startPoint, moftRectHeight / 2)
                                ctx.lineTo(moftRectWidth + startPoint, moftRectHeight / 2)
                                ctx.lineTo(moftRectWidth + startPoint, moftTriHeight / 2)
                                ctx.lineTo(moftRectWidth + startPoint + moftTriWidth, 0)
                                ctx.lineTo(moftRectWidth + startPoint, -moftTriHeight / 2)
                                ctx.lineTo(moftRectWidth + startPoint, -moftRectHeight / 2)
                                ctx.lineTo(startPoint, -moftRectHeight / 2)
                                ctx.closePath()
                                ctx.restore()
                            } else if ((moftArrowName === 'moftEvacuate') || (moftArrowName === 'moftEvacuateSpare')) {
                                ctx.moveTo(startPoint + moftArrowWidth, 0)
                                ctx.lineTo(startPoint + moftArrowTail, moftArrowHead)
                                ctx.moveTo(startPoint + moftArrowWidth, 0)
                                ctx.lineTo(startPoint + moftArrowTail, -moftArrowHead)
                                ctx.moveTo(startPoint + moftArrowWidth, 0)
                                ctx.lineTo(startPoint, 0)
                                ctx.restore()
                            }
                        }
                    } else {
                        ctx.save()
                        ctx.translate(points[2 * i], points[2 * i + 1])
                        ctx.rotate(radians)
                        if ((moftArrowName === 'moftNormal') || (moftArrowName === 'moftSpare')) {
                            if (lineLength > moftTriWidth) {
                                startPoint = (lineLength - moftTriWidth) / 2
                            }
                            ctx.moveTo(startPoint, moftTriHeight / 2)
                            ctx.lineTo(startPoint + moftTriWidth, 0)
                            ctx.lineTo(startPoint, -moftTriHeight / 2)
                            ctx.closePath()
                            ctx.restore()
                        } else if ((moftArrowName === 'moftEvacuate') || (moftArrowName === 'moftEvacuateSpare')) {
                            ctx.moveTo(lineLength, 0)
                            ctx.lineTo(lineLength - moftArrowHead, moftArrowHead)
                            ctx.moveTo(lineLength, 0)
                            ctx.lineTo(lineLength - moftArrowHead, -moftArrowHead)
                            ctx.moveTo(lineLength, 0)
                            ctx.lineTo(0, 0)
                            ctx.restore()
                        }
                    }
                }
            }
            var stroke = this.attrs.stroke
            var fill = this.attrs.fill
            var strokeWidth = this.attrs.strokeWidth
            var lineCap = this.attrs.lineCap
            var lineJoin = this.attrs.lineJoin
            var moftStroke = moftArrowStyle.stroke
            if (!moftStroke) {
                moftStroke = 'red'
                if (moftArrowName === 'moftSearch') {
                    moftStroke = 'blue'
                }
            }
            var moftFill = moftArrowStyle.fill
            if (!moftFill) {
                moftFill = 'red'
                if ((moftArrowName === 'moftEvacuate') || (moftArrowName === 'moftEvacuateSpare') || (moftArrowName === 'moftSearch')) {
                    moftStroke = 'blue'
                }
            }
            var moftStrokeWidth = moftArrowStyle.strokeWidth
            if (!moftStrokeWidth) {
                moftStrokeWidth = 3
                if (moftArrowName === 'moftSpare') {
                    moftStrokeWidth = 1
                }
            }
            if (moftArrowName === 'moftSpare') {
                ctx.setLineDash([4, 4])
                this.attrs.stroke = moftStroke
                this.attrs.strokeWidth = moftStrokeWidth
                this.attrs.fill = null
            } else if (moftArrowName === 'moftNormal') {
                this.attrs.stroke = null
                this.attrs.strokeWidth = 0
                this.attrs.fill = moftFill
            } else if ((moftArrowName === 'moftEvacuate') || (moftArrowName === 'moftEvacuateSpare')) {
                this.attrs.stroke = moftStroke
                this.attrs.strokeWidth = moftStrokeWidth
                this.attrs.fill = null
            } else if ((moftArrowName === 'moftSearch') || (moftArrowName === 'moftNormalArrow') || (moftArrowName === 'moftSwallowArrow')) {
                this.attrs.stroke = moftStroke
                this.attrs.strokeWidth = moftStrokeWidth
                this.attrs.fill = moftStroke
            }
            this.attrs.lineCap = 'round'
            this.attrs.lineJoin = 'round'
            ctx.fillStrokeShape(this)

            this.attrs.stroke = stroke
            this.attrs.strokeWidth = strokeWidth
            this.attrs.lineCap = lineCap
            this.attrs.lineJoin = lineJoin
            this.attrs.fill = fill
        }
    }

    Konva.Util.extend(Konva.MoftArrowLine, Konva.Line)
    Konva.Factory.addGetterSetter(Konva.MoftArrowLine, 'moftArrowStyle', {})
    Konva.Collection.mapMethods(Konva.MoftArrowLine)
})(Konva)
