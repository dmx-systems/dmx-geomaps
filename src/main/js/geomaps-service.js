export default function GeomapsSerive (dm5, http) {

  this.getGeomap = geomapId => {
    return http.get(`/geomap/${geomapId}`).then(response =>
      new Geomap(response.data)
    )
  }

  this.getDomainTopics = (geoCoordId, includeChildren, includeAssocChildren) => {
    return http.get(`/geomap/coord/${geoCoordId}`, {params: {
      children: includeChildren,
      assoc_children: includeAssocChildren
    }}).then(response =>
      dm5.utils.instantiateMany(response.data, dm5.Topic)
    )
  }

  this.setGeomapState = dm5.utils.debounce((geomapId, lon, lat, zoom) => {
    console.log('setGeomapState', lon, lat, zoom)
    http.put(`/geomap/${geomapId}/center/${lon}/${lat}/zoom/${zoom}`)
  }, 3000)

  //

  class Geomap extends dm5.Topic {

    constructor (geomap) {
      super(geomap.topic)
      this.viewProps = geomap.viewProps
      this.geoCoordTopics = geomap.geoCoordTopics     // instantiating dm5.Topic objects not required at the moment
    }

    removeTopic (id) {
      // TODO; skeleton needed by dm5-topicmap-panel contract
    }

    removeAssoc (id) {
      // TODO; skeleton needed by dm5-topicmap-panel contract
    }
  }
}
