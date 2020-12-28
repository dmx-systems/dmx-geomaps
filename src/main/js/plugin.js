export default {

  storeModule: {
    name: 'geomaps',
    module: require('./geomaps').default
  },

  topicmapType: {
    uri: 'dmx.geomaps.geomap',
    name: 'Geomap',
    renderer: () => import('./dmx-geomap-renderer' /* webpackChunkName: "dmx-geomap-renderer" */)
  },

  topicmapCommands: {
    'dmx.geomaps.geomap': [
      require('./components/dmx-geomap-delete').default
    ]
  }
}
