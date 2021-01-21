const state = {
  geomap: undefined,      // the rendered geomap (Geomap, see geomaps-service.js)
                          // {
                            // id:
                            // viewProps:
                            // geoMarkers: [
                            //   {
                            //     geoCoordTopic: {}
                            //     domainTopics: []
                            //    }
                            // ]
                          // }
  writable: false         // if the rendered geomap is writable by the current user (Boolean)
}

const actions = {

  // WebSocket messages

  _newGeoCoord ({rootState}, {geoCoordTopic}) {
    if (state.geomap) {

      const marker = {
        geoCoordTopic: geoCoordTopic,
        domainTopics: [rootState.object]
      }

      state.geomap.geoMarkers.push(marker)
      console.log('_newGeoCoord', marker)

    } else {
      // Note: if the geomap is not loaded no update is required
      console.log('No geomap loaded')
    }
  }
}

export default {
  state,
  actions
}
