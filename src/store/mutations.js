// import _utils from '../common/utils'

// export const UPDATE_EXTRA_MESSAGE = 'updateExtraMessage'
export const UPDATE_PLOTER_CONFIG = 'updatePloterCongig'
export const UPDATE_STAGE_DATA = 'updateStageData'
export const UPDATE_STAGE_SIZE = 'updateStageSize'
export const UPDATE_STAGE_ELEMENTS = 'updateStageElements'

export default {
    // [UPDATE_EXTRA_MESSAGE]: (state, payload) => {
    //     state.extraMessage = payload
    // },
    [UPDATE_PLOTER_CONFIG]: (state, payload) => {
        state.ploterCfg = payload
    },
    [UPDATE_STAGE_DATA]: (state, payload) => {
        state.stageData = payload
    },
    [UPDATE_STAGE_SIZE]: (state, payload) => {
        state.stageSize = payload
    },
    [UPDATE_STAGE_ELEMENTS]: (state, payload) => {
        state.stageElements = payload
    }
}
