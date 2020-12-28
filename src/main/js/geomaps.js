import dmx from 'dmx-api'

const state = {
  geomap: undefined,      // the rendered geomap (Geomap, see geomaps-service.js)
  writable: false         // if the rendered geomap is writable by the current user (Boolean)
}

const actions = {

  // WebSocket messages

  _newGeoCoord (_, {geoCoordTopic}) {
    if (state.geomap) {
      const geoMarkers = []
      const domains = []
      dmx.rpc.getTopic(_.rootState.object.id, true, true).then(topic => {
        domains.push(topic)
      })

      geoMarkers.geoCoordTopic = geoCoordTopic
      geoMarkers.domainTopics = domains
      state.geomap.geoMarkers.push(geoMarkers)

      console.log('_newGeoCoord', geoMarkers)

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
