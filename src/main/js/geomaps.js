export default ({dmx}) => {

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

    _addDomainTopic (_, {toGeoCoord, domainTopic}) {
      const dt = new dmx.Topic(domainTopic)
      console.log('ADD DOMAIN TOPIC')
      if (state.geomap) {
        addTopic(state, toGeoCoord, dt)
      } else {
        console.log('No geomap loaded')
      }
    },

    _removeDomainTopic (_, {fromGeoCoord, domainTopicId}) {
      if (state.geomap) {
        if (!fromGeoCoord) {
          console.log('DELETE DOMAIN TOPIC')
          deleteTopic(state, domainTopicId)
        } else {
          console.log('REMOVE DOMAIN TOPIC')
          removeTopic(state, fromGeoCoord, domainTopicId)
        }
      } else {
        console.log('No geomap loaded')
      }
    },

    _moveDomainTopic (_, {fromGeoCoord, toGeoCoord, domainTopic}) {
      const dt = new dmx.Topic(domainTopic)
      console.log('MOVE DOMAIN TOPIC')
      if (state.geomap) {
        addTopic(state, toGeoCoord, dt)
        removeTopic(state, fromGeoCoord, dt.id)
      } else {
        console.log('No geomap loaded')
      }
    }
  }

  return {
    state,
    actions
  }
}

function addTopic (state, geoCoord, domainTopic) {
  let geoMarkerExist = false
  let geoMarkerIndex = -1
  for (let i = 0; i < state.geomap.geoMarkers.length; i++) {
    if (state.geomap.geoMarkers[i].geoCoordTopic.id === geoCoord.id) {
      geoMarkerExist = true
      geoMarkerIndex = i
      break
    }
  }

  if (geoMarkerExist) {
    // console.log("Found index", geoMarkerIndex)
    state.geomap.geoMarkers[geoMarkerIndex].domainTopics.unshift(domainTopic)
  } else {
    const marker = {
      geoCoordTopic: geoCoord,
      domainTopics: [domainTopic]
    }
    state.geomap.geoMarkers.push(marker)
    console.log('_newGeoCoord', marker)
  }

}

function deleteTopic (state, domainTopicId) {
  for (let i = 0; i < state.geomap.geoMarkers.length; i++) {
    if (state.geomap.geoMarkers[i].domainTopics.find(elem => elem.id === domainTopicId)) {
      if (state.geomap.geoMarkers[i].domainTopics.length === 1) {
        // console.log('index', i)
        state.geomap.geoMarkers.splice(i, 1)
      } else {
        removeTopic(state.geomap.geoMarkers[i].geoCoordTopic, domainTopicId)
      }
    }
  }
}

function removeTopic (state, geoCoord, domainTopicId) {
  for (let i = 0; i < state.geomap.geoMarkers.length; i++) {
    if (state.geomap.geoMarkers[i].geoCoordTopic.id === geoCoord.id) {
      state.geomap.geoMarkers[i].domainTopics = state.geomap.geoMarkers[i].domainTopics.filter(
        elem => elem.id !== domainTopicId)
    }
  }
}
