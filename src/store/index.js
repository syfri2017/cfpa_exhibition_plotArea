import Vue from 'vue'
import Vuex from 'vuex'
import Actions from './actions.js'
import Mutations from './mutations.js'
import Getters from './getters.js'

import Components from './modules/components/index.js'

Vue.use(Vuex)

const state = {
    // extraMessage: null,
    ploterCfg: null,
    stageData: null,
    stageSize: {
        width: 800,
        height: 600
    },
    stageElements: null
}

export default new Vuex.Store({
    state,
    mutations: Mutations,
    actions: Actions,
    getters: Getters,
    modules: {
        ...Components
    }
})
