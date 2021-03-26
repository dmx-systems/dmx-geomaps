export default ({dmx}) => {

  const state = {
    geomap: undefined,      // the rendered geomap (Geomap, see geomaps-service.js)
                            // {
                            //   id:
                            //   viewProps:
                            //   geoMarkers: [
                            //     {
                            //       geoCoordTopic: {}
                            //       domainTopics: []
                            //     }
                            //   ]
                            // }
    writable: false         // if the rendered geomap is writable by the current user (Boolean)
  }

  const actions = {
    // WebSocket messages

    _addDomainTopic (_, {toGeoCoord, domainTopic}) {
      const dt = new dmx.Topic(domainTopic)
      console.log('ADD DOMAIN TOPIC')
      if (state.geomap) {
        addTopic(toGeoCoord, dt)
      } else {
        console.log('No geomap loaded')
      }
    },

    _removeDomainTopic (_, {fromGeoCoord, domainTopicId}) {
      if (state.geomap) {
        console.log('REMOVE DOMAIN TOPIC')
        removeTopic(fromGeoCoord, domainTopicId)
      } else {
        console.log('No geomap loaded')
      }
    },

    _removeFromAll (_, {domainTopicId}) {
      if (state.geomap) {
        console.log('REMOVE FROM ALL DOMAIN TOPIC')
        removeFromAll(domainTopicId)
      } else {
        console.log('No geomap loaded')
      }
    },

    _moveDomainTopic (_, {fromGeoCoord, toGeoCoord, domainTopic}) {
      const dt = new dmx.Topic(domainTopic)
      console.log('MOVE DOMAIN TOPIC')
      if (state.geomap) {
        addTopic(toGeoCoord, dt)
        removeTopic(fromGeoCoord, dt.id)
      } else {
        console.log('No geomap loaded')
      }
    }
  }

  /**  finds the geoCoord Id
   * @returns the index of the geoCoord
   */
  function findIndex (geoCoordId) {
    for (let i = 0; i < state.geomap.geoMarkers.length; i++) {
      if (state.geomap.geoMarkers[i].geoCoordTopic.id === geoCoordId) {
        return i
      }
    }
    return -1
  }

  // add a new domainTopic in a geoMarker or creates a new geoMarker
  function addTopic (geoCoord, domainTopic) {
    const i = findIndex(geoCoord.id)
    if (i >= 0) {
      state.geomap.geoMarkers[i].domainTopics.unshift(domainTopic)
    } else {
      const marker = {
        geoCoordTopic: geoCoord,
        domainTopics: [domainTopic]
      }
      state.geomap.geoMarkers.push(marker)
    }
  }

  // removes the domainTopic from a geoMarker
  function removeTopic (geoCoord, domainTopicId) {
    const i = findIndex(geoCoord.id)
    filterDomainTopics(i, domainTopicId)
  }

  // removes the domainTopic in all geoMarkers
  function removeFromAll (domainTopicId) {
    for (let i = 0; i < state.geomap.geoMarkers.length; i++) {
      if (state.geomap.geoMarkers[i].domainTopics.find(elem => elem.id === domainTopicId)) {
        filterDomainTopics(i, domainTopicId)
      }
    }
  }

  /**
   * @returns the remain domainTopics in the geoMarker
   */
  function filterDomainTopics (i, domainTopicId) {
    const remainDomainTopics = state.geomap.geoMarkers[i].domainTopics = state.geomap.geoMarkers[i].domainTopics.filter(
      elem => elem.id !== domainTopicId)
    return remainDomainTopics
  }

  return {
    state,
    actions
  }
}
