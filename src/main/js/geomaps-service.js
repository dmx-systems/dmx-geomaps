export default function GeomapsService (dmx, http) {

  this.getGeomap = geomapId => {
    return http.get(`/geomaps/${geomapId}`).then(response =>
      new Geomap(response.data)
    )
  }

  this.getDomainTopics = (geoCoordId, includeChildren, includeAssocChildren) => {
    return http.get(`/geomaps/coord/${geoCoordId}`, {
      params: {
        children: includeChildren,
        assocChildren: includeAssocChildren
      }
    }).then(response =>
      dmx.utils.instantiateMany(response.data, dmx.Topic)
    )
  }

  this.setGeomapState = dmx.utils.debounce((geomapId, lon, lat, zoom) => {
    // console.log('setGeomapState', lon, lat, zoom)
    http.put(`/geomaps/${geomapId}/center/${lon}/${lat}/zoom/${zoom}`)
  }, 3000)

  //

  // Note: Geomap was supposed to extend dmx.Topic. That works when built on my dev system (also in production mode)
  // but fails at runtime when built via GitLab CI/CD: "TypeError: Cannot call a class constructor without |new|".
  // As a workaround we don't extend. Actually no Topic features are needed, just the "id".
  class Geomap /* extends dmx.Topic */ {

    constructor (geomap) {
      // super(geomap.topic)
      this.id = geomap.topic.id
      this.viewProps = geomap.viewProps
      this.geoMarkers = this.instDomainTopics(geomap.geoMarkers)
    }

    instDomainTopics (array) {
      for (let i = 0; i < array.length; i++) {
        array[i].domainTopics = dmx.utils.instantiateMany(array[i].domainTopics, dmx.Topic)
      }
      return array
    }

    // Topicmap Panel protocol

    updateTopic (topic) {
    }

    updateAssoc (assoc) {
    }

    removeTopic (id) {
    }

    removeAssoc (id) {
    }
  }
}
