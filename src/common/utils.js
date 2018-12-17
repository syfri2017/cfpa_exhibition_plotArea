import store from '../store/index.js'
import _constants from './constants'

export function deepClone (item) {
    if (item === null || item === undefined) {
        return item
    }

    let type = toString.call(item)
    let enumerables = ['valueOf', 'toLocaleString', 'toString', 'constructor']
    let i
    let j
    let k
    let clone
    let key

    // Date
    if (type === '[object Date]') {
        return new Date(item.getTime())
    }

    // Array & Object
    if (type === '[object Array]') {
        i = item.length

        clone = []

        while (i--) {
            clone[i] = deepClone(item[i])
        }
    } else if (type === '[object Object]' && item.constructor === Object) {
        clone = {}

        for (key in item) {
            clone[key] = deepClone(item[key])
        }

        if (enumerables) {
            for (j = enumerables.length; j--;) {
                k = enumerables[j]
                if (item.hasOwnProperty(k)) {
                    clone[k] = item[k]
                }
            }
        }
    }

    return clone || item
}

export function isArray (value) {
    return toString.call(value) === '[object Array]'
}

export function isEmpty (value, allowEmptyString) {
    return (value == null) || (!allowEmptyString ? value === '' : false) || (isArray(value) && value.length === 0)
}

export function isEmptyObj (object) {
    for (var key in object) {
        return false
    }
    return true
}

export default {
    // 秒转换成时和分时间字符串
    secondToStringHmTime (time) {
        let afterCalTime = time / 3600
        let hour = '-'
        let minute = '-'
        if (afterCalTime > 0) {
            hour = parseInt(afterCalTime)
        }
        let minuteTemp = parseInt((afterCalTime - hour) * 60)
        if (minuteTemp >= 0) {
            minute = minuteTemp < 10 ? '0' + minuteTemp : minuteTemp
        }

        return hour + ':' + minute
    },
    stringHmTimeToSecond (time) {
        let result = 0
        if (time !== null && time !== '') {
            let timeArray = time.toString().split(':')
            result = parseInt(timeArray[0]) * 3600 + parseInt(timeArray[1]) * 60
        }
        return result
    },
    resetTreeData (data) {
        for (const node of data) {
            node.selected = false
            node.checked = false
            node.childrenCheckedStatus = 0
            if (node.children && node.children.length) {
                this.resetTreeData(node.children)
            }
        }
    },
    getNodes (opt, data) {
        let result = []
        for (const node of data) {
            let temp = true
            for (const [key, value] of Object.entries(opt)) {
                if (node[key] !== value) {
                    temp = false
                    break
                }
            }
            if (temp) result.push(node)
            if (node.children && node.children.length) {
                result = result.concat(this.getNodes(opt, node.children))
            }
        }
        return result
    },
    getHttpUrl (url) {
        // return _constants.SERVER_URL + url
        return _constants.SERVER_URL + _constants.SERVER_NAME + url
    },
    getAttachmentUrl (url) {
        return _constants.SERVER_URL + _constants.ATTACHMENT_SERVER_NAME + url
    },
    setCookie: function (name, value, days) {
        let d = new Date()
        d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days)
        window.document.cookie = name + '=' + value + ';path=/;expires=' + d.toGMTString()
    },
    getCookie: function (name) {
        let v = window.document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)')
        return v ? v[2] : null
    },
    deleteCookie: function (name) {
        this.setCookie(name, '', -1)
    },
    convertObjToDateStr (dateTime) {
        let ret = null
        if (dateTime.date && dateTime.time) {
            ret = dateTime.date + ' ' + dateTime.time + ':00'
        }
        return ret
    },
    convertDateStrToObj (dataTime) {
        let ret = {
            date: '',
            time: ''
        }
        if (dataTime) {
            const str = dataTime.split(' ')
            if (str.length >= 2) {
                ret.date = str[0]
                ret.time = str[1]
            }
        }
        return ret
    },
    padLeftZero (str) {
        return ('00' + str).substr(str.length)
    },
    parseServerUrl (serverUrl) {
        const reg = /^http:\/\/(.*?)\/$/
        let str = serverUrl.match(reg)

        return str[1]
    },
    setNetWork (url) {
        _constants.SERVER_URL = 'http://' + url + '/'
    },
    convertUuidToName (items, uuid) {
        let name = ''
        if (items instanceof Array) {
            items.forEach(function (item) {
                if (item.uuid === uuid) {
                    name = item.name
                    return false
                }
            })
        }
        return name
    },
    getItemByUuid (items, uuid) {
        let ret = null
        if (items instanceof Array) {
            items.forEach(function (item) {
                if (item.uuid === uuid) {
                    ret = item
                    return false
                }
            })
        }
        return ret
    },
    getDicByClassification (classification) {
        let items = []
        if (store.getters.appDictionary instanceof Array) {
            store.getters.appDictionary.forEach(function (item) {
                if (item.classification === classification) {
                    items.push(item)
                }
            })
        }
        return items
    },
    parseTimeStamp (timeStamp) {
        const mimuteUnit = 1000 * 60
        let hour = this.pad(parseInt(timeStamp / (mimuteUnit * 60)), 2)
        let mimute = this.pad(parseInt((timeStamp % (mimuteUnit * 60) / mimuteUnit)), 2)
        return hour + ':' + mimute
    },
    pad (num, n) {
        var len = num.toString().length
        while (len < n) {
            num = '0' + num
            len++
        }
        return num
    },
    pushRepeatArrayByUuid (array, items) {
        const me = this
        if (array instanceof Array && items instanceof Array) {
            items.forEach(function (item) {
                if (me.findItemByUuid(array, item.uuid) === -1) {
                    array.push(item)
                }
            })
        }
    },
    findItemByUuid (array, uuid) {
        let ret = -1
        for (let index = 0; index < array.length; ++index) {
            if (array[index].uuid === uuid) {
                ret = index
                break
            }
        }
        return ret
    },
    getItemsByParentUuid (array, uuid) {
        let ret = []
        for (let index = 0; index < array.length; ++index) {
            if (array[index].parentUuid === uuid) {
                ret.push(array[index])
            }
        }
        return ret
    },
    setTitle (title) {
        title = title ? title + ' - ' + _constants.APP_NAME : _constants.APP_NAME

        window.document.title = title
    }
}
