<template>
  <l-map class="dmx-geomap-renderer" :center.sync="center" :zoom.sync="zoom" :options="options" ref="geomapRef" @ready="ready">
    <l-tile-layer :url="url"></l-tile-layer>
    <l-marker v-for="item in markers" :key="item.id" :lat-lng="item.coords" :icon="item.iconMarker"
        @popupopen="popupOpen(item.domainTopics, $event)">

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
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'
import dmx from 'dmx-api'

// No longer needed
// stupid hack so that leaflet's images work after going through webpack
// https://github.com/PaulLeCam/react-leaflet/issues/255
// delete L.Icon.Default.prototype._getIconUrl
// L.Icon.Default.mergeOptions({
//     iconUrl:       require('leaflet/dist/images/marker-icon.png'),
//     iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//     shadowUrl:     require('leaflet/dist/images/marker-shadow.png')
// })

let popup

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
      this.createIcons()
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
      domainTopic: undefined,     // has precedence
      domainTopics: [],
      loading: undefined,

      // markers
      defaultIcon: {
        icon: '\uf041',
        iconColor: '#4B87C3',
      },
      customIcon: undefined,
      markers: [],
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
        this.createIcons()
      }
    },

    createIcons() {
      for(let i = 0; i < this.geoMarkers.length; i++){
        dmx.icons.ready.then(() => {
          if (this.geoMarkers[i].domainTopics != null) {
            switch (true) {
              // Multiple domainTopics
              case this.geoMarkers[i].domainTopics.length > 1:
                  this.getSVGUrl(this.defaultIcon)
                  this.pushMarker(this.geoMarkers[i])
                  break;
              // NewGeoCoord, the domainTopic does not have association
              case (this.geoMarkers[i].domainTopics.length === 1) && (!this.geoMarkers[i].domainTopics[0].assoc):
                  this.$store.dispatch('_getDomainTopics', this.geoMarkers[i].geoCoordTopic.id).then(topics => {
                    this.geoMarkers[i].domainTopics = topics
                    this.getSVGUrl(topics[0])
                    this.pushMarker(this.geoMarkers[i])
                  })
                  break;
              // Single domainTopic
              default:
                  this.getSVGUrl(this.geoMarkers[i].domainTopics[0])
                  this.pushMarker(this.geoMarkers[i])
            }

          }
        })
      }
    },

    getSVGUrl (topic){
      this.customIcon = []
      const glyph = dmx.icons.faGlyph(topic.icon)
      const iconWidth = 0.009 * glyph.width
      const width = iconWidth + 8
      const height = 20
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                  <path d="${glyph.path}" fill="${topic.iconColor}" transform="scale(0.009 -0.009) translate(600 -2080)"></path>
                  </svg>`
      const svgURL = 'data:image/svg+xml,' + encodeURIComponent(svg)
      this.customIcon = new L.Icon ({
          iconSize: [width, height],
          iconAnchor: [width/2, height/2],
          iconUrl: svgURL
      })
    },

    pushMarker(item) {
      this.markers.push({
        id: item.geoCoordTopic.id,
        coords: L.latLng(this.latLng(item)),
        iconMarker: this.customIcon,
        domainTopics: item.domainTopics
      })
    },

    popupOpen (domainTopics, event) {
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
    LMap, LTileLayer, LMarker, LPopup, LIcon
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
