export default {
    state: {
        attribute: {
            show: false,
            editable: false
        },
        businessShapeData: null
    },
    actions: {
        addBusinessRecord ({ getters, commit }, data) {
            let businessShapeData = getters.componentsBusinessShapeData
            if (data) {
                businessShapeData.push(data)
                commit('updateBusinessShapeData', businessShapeData)
            }
        },
        updateBusinessRecord ({ getters, commit }, data) {
            let businessShapeData = getters.componentsBusinessShapeData
            let record = businessShapeData.find(item => {
                return item.uuid === data.uuid
            })
            if (record) {
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const value = data[key]
                        record[key] = value
                    }
                }
                commit('updateBusinessShapeData', businessShapeData)
            }
        },
        removeBusinessRecord ({ getters, commit }, data) {
            let businessShapeData = getters.componentsBusinessShapeData
            if (data) {
                let index = businessShapeData.findIndex(item => {
                    return item.uuid === data.uuid
                })
                if (index >= 0) {
                    businessShapeData.splice(index, 1)
                    commit('updateBusinessShapeData', businessShapeData)
                }
            }
        }
    },
    mutations: {
        updateBusinessShapeData (state, data) {
            state.businessShapeData = data
        }
    },
    getters: {
        componentsBusinessRecordGet: state => shapeUuid => {
            return state.businessShapeData.find(item => {
                return item.shapeUuid === shapeUuid
            })
        },
        componentsBusinessShapeData: state => state.businessShapeData
    }
}
