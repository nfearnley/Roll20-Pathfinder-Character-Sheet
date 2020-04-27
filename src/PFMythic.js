import _ from "underscore";
import TAS from "exports-loader?TAS!TheAaronSheet";
import * as SWUtils from "./SWUtils";
import PFConst from "./PFConst";

/* updateMythicPathHP
* Updates total at bottom of Mythic Path Information grid */
function updateMythicPathHP(callback, silently) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    getAttrs(["mythic-tier", "mythic-hp", "total-mythic-hp"], function(values) {
        var tot = 0;
        var currTot = 0;
        var setter = {};
        var params = {};
        try {
            tot = (parseInt(values["mythic-tier"], 10) || 0) * (parseInt(values["mythic-hp"], 10) || 0);
            currTot = parseInt(values["total-mythic-hp"], 10) || 0;
            if (currTot !== tot) {
                setter["total-mythic-hp"] = tot;
            }
        }
        catch(err) {
            TAS.error("PFMythic.updateTierMythicPower error", err);
        }
        finally {
            if (_.size(setter) > 0) {
                if (silently) {
                    params = PFConst.silentParams;
                }
                SWUtils.setWrapper(setter, params, done);
            }
            else {
                done();
            }
        }
    });
}
/* updateTierMythicPower sets tier mp*/
function updateTierMythicPower(callback, silently) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });

    getAttrs(["tier-mythic-power", "mythic-tier"], function(values) {
        var totalTier;
        var curr;
        var setter = {};
        var params = {};
        try {
            totalTier = 3 + 2 * (parseInt(values["mythic-tier"], 10) || 0);
            curr = parseInt(values["tier-mythic-power"], 10) || 0;

            if (curr !== totalTier) {
                setter["tier-mythic-power"] = totalTier;
            }
        }
        catch(err) {
            TAS.error("PFMythic.updateTierMythicPower error", err);
        }
        finally {
            if (_.size(setter) > 0) {
                if (silently) {
                    params = PFConst.silentParams;
                }
                SWUtils.setWrapper(setter, params, done);
            }
            else {
                done();
            }
        }
    });
}

export function recalculate(callback, silently, oldversion) {
    var done = _.once(function() {
        TAS.info("leaving PFMythic.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    });
    getAttrs(["mythic-adventures-show"], function(v) {
        try {
            if (parseInt(v["mythic-adventures-show"], 10) === 1) {
                updateMythicPathHP(done, silently);
                updateTierMythicPower();
            }
            else {
                done();
            }
        }
        catch(err2) {
            TAS.error("PFMythic.recalculate", err2);
            done();
        }
    });
}

function registerEventHandlers() {
    // mythic path and power
    on("change:mythic-tier change:mythic-hp", TAS.callback(function eventupdateMythicPathHP(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateMythicPathHP();
            updateTierMythicPower();
        }
    }));
    // mythic path
    on("change:mythic-hp", TAS.callback(function eventUpdateTierMythicPower(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateMythicPathHP();
        }
    }));
    on("change:misc-mythic-power change:tier-mythic-power", TAS.callback(function eventUpdateMythicPower(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api" && eventInfo.sourceAttribute === "tier-mythic-power")) {
            SWUtils.updateRowTotal(["mythic-power_max", "tier-mythic-power", "misc-mythic-power"]);
        }
    }));
}
registerEventHandlers();

