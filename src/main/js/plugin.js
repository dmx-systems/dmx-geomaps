export default {

  storeModule: {
    name: 'geomaps',
    module: require('./geomaps').default
  },

  topicmapType: {
    uri: 'dmx.geomaps.geomap',
    name: "Geomap",
    renderer: () => import('./dm5-geomap-renderer' /* webpackChunkName: "dm5-geomap-renderer" */)
  },

  topicmapCommands: {
    "dmx.geomaps.geomap": [
      require('./components/dm5-geomap-delete').default
    ]
  }
}
