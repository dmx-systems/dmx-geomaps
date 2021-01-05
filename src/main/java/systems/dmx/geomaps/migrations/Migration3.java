package systems.dmx.geomaps.migrations;

import static systems.dmx.contacts.Constants.*;
import systems.dmx.geomaps.GeomapsService;

import systems.dmx.core.Topic;
import systems.dmx.core.service.Inject;
import systems.dmx.core.service.Migration;



/**
 * Add geo coords to existing Address topics when plugin is installed.
 * <p>
 * Part of DMX Geomaps 0.3
 * Runs only on CLEAN_INSTALL
 */
public class Migration3 extends Migration {

    // ---------------------------------------------------------------------------------------------- Instance Variables

    @Inject
    private GeomapsService gs;

    // -------------------------------------------------------------------------------------------------- Public Methods

    @Override
    public void run() {
        for (Topic address : dmx.getTopicsByType(ADDRESS)) {
            gs.geocodeAndStoreFacet(address);
        }
    }
}
