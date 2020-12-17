package systems.dmx.geomaps;

import systems.dmx.core.JSONEnabled;
import systems.dmx.core.model.TopicModel;
import systems.dmx.core.model.topicmaps.ViewProps;
import systems.dmx.core.util.DMXUtils;

import org.codehaus.jettison.json.JSONObject;

import java.util.Iterator;
import java.util.Map;
import java.util.logging.Logger;

import java.util.List; // gevlish
import org.codehaus.jettison.json.JSONArray;



/**
 * A geomap model: a collection of Geo Coordinate topics.
 * <p>
 * Features:
 * - Serialization to JSON.
 */
public class Geomap implements Iterable<TopicModel>, JSONEnabled {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    private TopicModel geomapTopic;
    private ViewProps viewProps;
    private Map<Long, TopicModel> geoCoords;

    // key: geoCoord ID, value: a list of domain topics
    private Map<Long, List<TopicModel>> domainTopics;

    private Logger logger = Logger.getLogger(getClass().getName());

    // ---------------------------------------------------------------------------------------------------- Constructors

    Geomap(TopicModel geomapTopic, ViewProps viewProps, Map<Long, TopicModel> geoCoords, Map<Long, List<TopicModel>> domainTopics) {
        this.geomapTopic = geomapTopic;
        this.viewProps = viewProps;
        this.geoCoords = geoCoords;
        this.domainTopics = domainTopics;

    }

    // -------------------------------------------------------------------------------------------------- Public Methods

    public long getId() {
        return geomapTopic.getId();
    }

    // ### TODO: needed?
    public boolean containsTopic(long geoCoordId) {
        return geoCoords.get(geoCoordId) != null;
    }

    // ---

    @Override
    public JSONObject toJSON() {
        try {
            return new JSONObject()
                .put("topic", geomapTopic.toJSON())
                .put("viewProps", viewProps.toJSON())
                // .put("geoCoordTopics", DMXUtils.toJSONArray(geoCoords.values())) // single geoCoords list
                // .put("domainTopics", listToJSON(domainTopics)) // single domainTopics list
                .put("geoMarkers", geoMarkersJSON(geoCoords, domainTopics));
        } catch (Exception e) {
            throw new RuntimeException("Serialization failed", e);
        }
    }

    @Override
    public Iterator<TopicModel> iterator() {
        return geoCoords.values().iterator();
    }

    @Override
    public String toString() {
        return "geomap " + getId();
    }

    // -------------------------------------------------------------------------------------------------- Private Methods

    // domainTopics to JSON no needed at this time
    private Object listToJSON(Map<Long, List<TopicModel>> domainTopics){
        JSONArray domainList = new JSONArray();
        for(List domainTopic : domainTopics.values()){
            domainList.put(DMXUtils.toJSONArray(domainTopic));
        }
        return domainList;
    }


    private Object geoMarkersJSON(Map<Long, TopicModel> geoCoords, Map<Long, List<TopicModel>> domainTopics) {
        JSONArray geoMarkers = new JSONArray();
        for(TopicModel item : geoCoords.values()){
            JSONObject json = new JSONObject();
            // Object value = DMXUtils.findById(item.getId(), geoCoords.values());
            List domain = domainTopics.get(item.getId());

            try {
              json.put("geoCoordTopic", item.toJSON());
              json.put("domainTopics", DMXUtils.toJSONArray(domain));
              geoMarkers.put(json);
            } catch (Exception e) {
                  throw new RuntimeException("Serialization failed", e);
            }
        }

        return geoMarkers;
    }

}
