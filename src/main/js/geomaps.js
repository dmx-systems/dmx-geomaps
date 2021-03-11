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

  // Test action from webclient to delete topic
  _processDirectives ({dispatch}, directives) {
    if (state.geomap) {
      directives.forEach(dir => {
        if (dir.type === 'DELETE_TOPIC') {
          console.log('domainTopicId', dir.arg.id)
          deleteTopic(dir.arg.id)
        }
      })
    } else {
      console.log('No geomap loaded')
    }
  },

  // WebSocket messages

  _addDomainTopic (_, {toGeoCoord, domainTopic}) {
    console.log('ADD DOMAIN TOPIC')
    if (state.geomap) {
      addTopic(toGeoCoord, domainTopic)
    } else {
      console.log('No geomap loaded')
    }
  },

  _removeDomainTopic (_, {fromGeoCoord, domainTopicId}) {
    console.log('REMOVE DOMAIN TOPIC')
    if (state.geomap) {
      removeTopic(fromGeoCoord, domainTopicId)
    } else {
      console.log('No geomap loaded')
    }
  },

  _moveDomainTopic (_, {fromGeoCoord, toGeoCoord, domainTopic}) {
    console.log('MOVE DOMAIN TOPIC')
    if (state.geomap) {
      addTopic(toGeoCoord, domainTopic)
      removeTopic(fromGeoCoord, domainTopic.id)
    } else {
      console.log('No geomap loaded')
    }
  }
}

function addTopic (geoCoord, domainTopic) {
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

function removeTopic (geoCoord, domainTopicId) {
  for (let i = 0; i < state.geomap.geoMarkers.length; i++) {
    if (state.geomap.geoMarkers[i].geoCoordTopic.id === geoCoord.id) {
      state.geomap.geoMarkers[i].domainTopics = state.geomap.geoMarkers[i].domainTopics.filter(
        data => data.id !== domainTopicId)
    }
  }
}

function deleteTopic (domainTopicId) {
  for (let i = 0; i < state.geomap.geoMarkers.length; i++) {
    if (state.geomap.geoMarkers[i].domainTopics.find(elem => elem.id === domainTopicId)) {
      if (state.geomap.geoMarkers[i].domainTopics.length === 1) {
        console.log('index', i)
        state.geomap.geoMarkers.splice(i, 1)
      } else {
        removeTopic(state.geomap.geoMarkers[i].geoCoordTopic, domainTopicId)
      }
    }
  }
}

export default {
  state,
  actions
}
