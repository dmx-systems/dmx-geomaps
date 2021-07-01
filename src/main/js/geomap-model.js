import GeomapsService from './geomaps-service'

export default ({dmx, axios: http}) => {

  const service = new GeomapsService(dmx, http)

  return {
    actions: {

      // Topicmap Panel protocol

      fetchTopicmap (_, id) {
        // console.log('fetchTopicmap', id, '(geomap-model)')
        return service.getGeomap(id)
      },

      fetchTopicmapAppendix (_, topicmap) {
      },

      renderTopicmap ({rootState}, {topicmap, writable, selection}) {
        // console.log('renderTopicmap', topicmap.viewProps)
        rootState.geomaps.geomap = topicmap
        rootState.geomaps.writable = writable
        // TODO: return value?
      },

      clearTopicmap () {
      },

      // Geomap specific actions (module internal, dispatched from dmx-geomap-renderer component)

      _getDomainTopics (_, geoCoordId) {
        return service.getDomainTopics(geoCoordId)
      },

      _storeGeomapState ({rootState}, {center, zoom}) {
        // console.log('_storeGeomapState', rootState.geomaps.writable)
        // update server
        if (rootState.geomaps.writable) {
          service.setGeomapState(rootState.geomaps.geomap.id, center[1], center[0], zoom)
        }
      }
    }
  }
}
