<template>
  <l-map class="dmx-geomap-renderer" :center.sync="center" :zoom.sync="zoom" :options="options" ref="geomapRef"
        @ready="ready">
    <l-tile-layer :url="url"></l-tile-layer>
    <l-marker v-for="marker in markers" :key="marker.id" :lat-lng="marker.coords"
      :icon="marker.iconMarker"
        @popupopen="popupOpen(marker.domainTopics, marker.id, $event)">

        <l-popup v-loading="loading">
          <dmx-object-renderer v-if="domainTopic" :object="domainTopic" :quill-config="quillConfig">
          </dmx-object-renderer>
          <dmx-topic-list v-else :topics="domainTopics" no-sort-menu @topic-click="showDetails">
          </dmx-topic-list>
        </l-popup>

    </l-marker>
  </l-map>
</template>

<script>
import {LMap, LTileLayer, LMarker, LPopup} from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'

let popup
const ICON_SCALING = 0.022 // max value = 0.026 (without being crop)

export default {

  created () {
    // console.log('dmx-geomap-renderer created')
  },

  mounted () {
    // console.log('dmx-geomap-renderer mounted')
  },

  destroyed () {
    // console.log('dmx-geomap-renderer destroyed')
  },

  inject: ['dmx'],

  props: {
    quillConfig: Object
  },

  watch: {
    geomap () {
      this.initMarkers()
    }
  },

  data () {
    return {
      // map
      url: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
      options: {
        zoomControl: false,
        zoomSnap: 0,
        attributionControl: false
      },
      // popup
      domainTopic: undefined,     // domain topic (e.g. Person, Organization, Event) that correspond to a Geo Coordinate
                                  // - has precedence
      domainTopics: [],           // Group of domainTopics of an specific marker
      loading: undefined,

      // markers
      markers: []                 // Group of map markers with id, coords, icon, domainTopics
    }
  },

  computed: {

    geomap () {
      const geomap = this.$store.state.geomaps.geomap
      // Note: the geomap might not be available yet as it is loaded *after* the topicmap renderer is installed
      if (!geomap) {
        // console.log('### Geomap not yet available')
        return
      }
      return geomap
    },

    center: {
      get () {
        if (this.geomap) {
          const viewProps = this.geomap.viewProps
          return [
            viewProps['dmx.geomaps.latitude'],
            viewProps['dmx.geomaps.longitude']
          ]
        }
      },
      set (center) {
        // console.log('set center', center, this.center)
        const viewProps = this.geomap.viewProps
        viewProps['dmx.geomaps.latitude']  = center.lat
        viewProps['dmx.geomaps.longitude'] = center.lng
        this.storeGeomapState()
      }
    },

    zoom: {
      get () {
        return this.geomap && this.geomap.viewProps['dmx.geomaps.zoom']
      },
      set (zoom) {
        this.geomap.viewProps['dmx.geomaps.zoom'] = zoom
        this.storeGeomapState()
      }
    },

    geoMarkers () {
      return this.geomap && this.geomap.geoMarkers
    }
  },

  methods: {
    ready () {
      if (this.geomap) {
        this.initMarkers()
      }
    },

    initMarkers () {
      this.dmx.icons.ready.then(() => {
        for (let i = 0; i < this.geoMarkers.length; i++) {
          // NOSPOT (remove marker)
          if (this.geoMarkers[i].domainTopics.length === 0) {
            this.markers.splice(i, 1)
          // SINGLESPOT
          } else if (this.geoMarkers[i].domainTopics.length > 1) {
            this.pushMarker(this.geoMarkers[i], '\uf041', '#3c90ce')
          // MULTISPOT
          } else if (this.geoMarkers[i].domainTopics.length === 1) {
            this.pushMarker(this.geoMarkers[i],
              this.geoMarkers[i].domainTopics[0].icon,
              this.geoMarkers[i].domainTopics[0].iconColor)
          }
        }
      })
      // console.log('markers', this.markers)
    },

    createLeafletIcon (icon, color) {
      const glyph = this.dmx.icons.faGlyph(icon)
      const iconWidth = ICON_SCALING * glyph.width
      const width = iconWidth + 4
      const height = 40
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                  <path d="${glyph.path}" fill="${color}" transform="scale(${ICON_SCALING} -${ICON_SCALING})
                  translate(100 -1400)"></path></svg>`
      const svgURL = 'data:image/svg+xml,' + encodeURIComponent(svg)
      return new L.Icon({/* eslint no-undef: "off" */
        iconSize: [width, height],
        iconAnchor: [width / 2, height / 4],
        iconUrl: svgURL
      })
    },

    pushMarker (marker, icon, color) {
      this.markers.push({
        id: marker.geoCoordTopic.id,
        coords: L.latLng(this.latLng(marker)),
        iconMarker: this.createLeafletIcon(icon, color),
        domainTopics: marker.domainTopics
      })
    },

    popupOpen (domainTopics, geoCoordId, event) {
      // console.log('popupOpen', geoCoordId, event.popup)
      popup = event.popup
      this.domainTopic = undefined    // clear popup
      this.domainTopics = []          // clear popup
      this.loading = true

      switch (domainTopics.length) {
      case 0:
        throw Error(`no domain topics for geo coord topic ${geoCoordId}`)
      case 1:
        this.showDetails(domainTopics[0]); break
      default:
        this.domainTopics = domainTopics
        this.loading = false
        this.updatePopup()
      }
    },

    showDetails (topic) {
      this.loading = true
      this.dmx.rpc.getTopic(topic.id, true, true).then(topic => {
        this.domainTopic = topic
        this.loading = false
        // this.updatePopup()
      })

    },

    updatePopup () {
      setTimeout(() => popup.update(), 300)
      /* does not work
      this.$nextTick()
        .then(() => {
          console.log('showDetail', popup)
          popup.update()
        })
      */
    },

    latLng (geoMarker) {
      // Note: Leaflet uses lat-lon order while most other tools (including DMX) and formats use lon-lat order.
      // For exhaustive background information on this topic see https://macwright.org/lonlat/
      return [
        geoMarker.geoCoordTopic.children['dmx.geomaps.latitude'].value,
        geoMarker.geoCoordTopic.children['dmx.geomaps.longitude'].value
      ]
    },

    storeGeomapState () {
      this.$store.dispatch('_storeGeomapState', {
        center: this.center,
        zoom:   this.zoom
      })
    }
  },

  components: {
    LMap, LTileLayer, LMarker, LPopup
  }
}
</script>

<style>
/* Leaflet overrides */

.leaflet-container {
  font: unset;
}

.leaflet-popup-content {
  min-width:  200px;
  min-height:  42px;     /* see --loading-spinner-size in element-ui/packages/theme-chalk/src/common/var.scss */
}
</style>
