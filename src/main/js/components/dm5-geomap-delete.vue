<template>
  <el-button type="text" class="fa fa-times-circle-o" title="Delete this Geomap…" @click="deleteGeomap"></el-button>
</template>

<script>
export default {

  inject: ['dm5'],

  computed: {
    topicmapId () {
      return this.$store.getters.topicmapId
    }
  },

  methods: {

    deleteGeomap () {
      this.confirmDeletion().then(() => {
        // update client state + sync view (for immediate visual feedback)
        this.$store.dispatch('_deleteTopic', this.topicmapId)
        // update server state
        this.dm5.restClient.deleteTopic(this.topicmapId).then(response => {
          this.$store.dispatch('_processDirectives', response.directives)
        })
      }).catch(() => {})    // suppress unhandled rejection on Cancel
    },

    confirmDeletion () {
      return this.$confirm('You\'re about to delete this Geomap!', 'Warning', {
        type: 'warning',
        confirmButtonText: 'Delete this Geomap',
        confirmButtonClass: 'el-button--danger',
        showClose: false
      })
    }
  }
}
</script>
