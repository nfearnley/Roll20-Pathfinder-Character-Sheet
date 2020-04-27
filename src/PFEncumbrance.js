import _ from "underscore";
import TAS from "exports-loader?TAS!TheAaronSheet";
import * as SWUtils from "./SWUtils";
import PFConst from "./PFConst";
import * as PFDefense from "./PFDefense";

var load = {
    "Light": 0,
    "Medium": 1,
    "Heavy": 2,
    "Overloaded": 3,
    "OverDouble": 4
};

/**
 * Returns the carrying capacity for a given strength score and load type
 * Will recursively calculate for strength scores over 29
 * @param {int} str strength score
 * @param {int} loadToFind load val from load param
 */
function getCarryingCapacity(str, loadToFind) {
    var l;
    var m;
    var h;
    if (str >= 30) {
        return getCarryingCapacity(str - 10, loadToFind) * 4;
    }
    // https://www.reddit.com/r/Pathfinder_RPG/comments/1k5hsf/carry_capacity_how_is_it_calculated/
    switch (str) {
    case 0:
        l = 0;
        m = 0;
        h = 0;
        break;
    case 1:
        l = 3;
        m = 6;
        h = 10;
        break;
    case 2:
        l = 6;
        m = 13;
        h = 20;
        break;
    case 3:
        l = 10;
        m = 20;
        h = 30;
        break;
    case 4:
        l = 13;
        m = 26;
        h = 40;
        break;
    case 5:
        l = 16;
        m = 33;
        h = 50;
        break;
    case 6:
        l = 20;
        m = 40;
        h = 60;
        break;
    case 7:
        l = 23;
        m = 46;
        h = 70;
        break;
    case 8:
        l = 26;
        m = 53;
        h = 80;
        break;
    case 9:
        l = 30;
        m = 60;
        h = 90;
        break;
    case 10:
        l = 33;
        m = 66;
        h = 100;
        break;
    case 11:
        l = 38;
        m = 76;
        h = 115;
        break;
    case 12:
        l = 43;
        m = 86;
        h = 130;
        break;
    case 13:
        l = 50;
        m = 100;
        h = 150;
        break;
    case 14:
        l = 58;
        m = 116;
        h = 175;
        break;
    case 15:
        l = 66;
        m = 133;
        h = 200;
        break;
    case 16:
        l = 76;
        m = 153;
        h = 230;
        break;
    case 17:
        l = 86;
        m = 173;
        h = 260;
        break;
    case 18:
        l = 100;
        m = 200;
        h = 300;
        break;
    case 19:
        l = 116;
        m = 233;
        h = 350;
        break;
    case 20:
        l = 133;
        m = 266;
        h = 400;
        break;
    case 21:
        l = 153;
        m = 306;
        h = 460;
        break;
    case 22:
        l = 173;
        m = 346;
        h = 520;
        break;
    case 23:
        l = 200;
        m = 400;
        h = 600;
        break;
    case 24:
        l = 233;
        m = 466;
        h = 700;
        break;
    case 25:
        l = 266;
        m = 533;
        h = 800;
        break;
    case 26:
        l = 306;
        m = 613;
        h = 920;
        break;
    case 27:
        l = 346;
        m = 693;
        h = 1040;
        break;
    case 28:
        l = 400;
        m = 800;
        h = 1200;
        break;
    case 29:
        l = 466;
        m = 933;
        h = 1400;
        break;
    default:
        return 0;
    }

    switch (loadToFind) {
    case load.Light:
        return l;
    case load.Medium:
        return m;
    case load.Heavy:
        return h;
    }
    return 0;
}

/**
 * updateCurrentLoad-updates the current load radio button
 * @param {function} callback when done
 * @param {boolean} silently
 */
function updateCurrentLoad(callback, silently) {
    function done() {
        if (typeof callback === "function") {
            callback();
        }
    }
    getAttrs(["load-light", "load-medium", "load-heavy", "load-max", "current-load", "carried-total", "max-dex-source"], function(v) {
        var curr = 0;
        var carried = 0;
        var light = 0;
        var medium = 0;
        var heavy = 0;
        var max = 0;
        var maxDexSource = 0;
        var ignoreEncumbrance = 0;
        var newLoad = 0;
        var setter = {};
        var params = {};
        try {
            maxDexSource = parseInt(v["max-dex-source"], 10) || 0;
            ignoreEncumbrance = maxDexSource === 1 || maxDexSource === 3 ? 1 : 0;
            curr = parseInt(v["current-load"], 10) || 0;
            if (ignoreEncumbrance) {
                newLoad = load.Light;
            }
            else {
                carried = parseInt(v["carried-total"], 10) || 0;
                light = parseInt(v["load-light"], 10) || 0;
                medium = parseInt(v["load-medium"], 10) || 0;
                heavy = parseInt(v["load-heavy"], 10) || 0;
                max = heavy * 2;

                if (carried <= light) {

                    newLoad = load.Light;
                }
                else if (carried <= medium) {

                    newLoad = load.Medium;
                }
                else if (carried <= heavy) {

                    newLoad = load.Heavy;
                }
                else if (carried <= max) {

                    newLoad = load.Overloaded;
                }
                else if (carried > max) {

                    newLoad = load.OverDouble;
                }
            }
            if (curr !== newLoad) {
                setter["current-load"] = newLoad;
            }
        }
        catch(err) {
            TAS.error("PFEncumbrance.updateCurrentLoad", err);
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
/**
 * updates the load and lift numbers
 * @param {function} callback when done
 * @param {boolean} silently
 */
export function updateLoadsAndLift(callback, silently) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    getAttrs(["STR", "size", "size-multiplier", "legs", "load-light", "load-medium", "load-heavy", "load-max",
        "lift-above-head", "lift-off-ground", "lift-drag-and-push", "load-str-bonus", "load-multiplier",
        "total-load-multiplier", "load-misc"], function(v) {
        var str = 10;
        var size = 1;
        var sizeMult = 1;
        var currSizeMult = 1;
        var currTotalLoadMult = 1;
        var legs = 2;
        var light = 0;
        var medium = 0;
        var heavy = 0;
        var max = 0;
        var aboveHead = 0;
        var offGround = 0;
        var drag = 0;
        var strMod = 0;
        var loadMult = 1;
        var mult = 1;
        var misc = 0;
        var l = 0;
        var m = 0;
        var h = 0;
        var a = 0;
        var o = 0;
        var d = 0;
        var setter = {};
        var params = {};
        try {
            str = parseInt(v.STR, 10) || 0;
            size = parseInt(v.size, 10) || 0;
            sizeMult = parseInt(v["size-multiplier"], 10) || 0;
            currSizeMult = sizeMult;
            currTotalLoadMult = parseInt(v["total-load-multiplier"], 10) || 0;
            legs = parseInt(v.legs, 10) || 0;
            if (legs !== 4) {
                legs = 2;
            }
            light = parseInt(v["load-light"], 10) || 0;
            medium = parseInt(v["load-medium"], 10) || 0;
            heavy = parseInt(v["load-heavy"], 10) || 0;
            max = parseInt(v["load-max"], 10) || 0;
            aboveHead = parseInt(v["lift-above-head"], 10) || 0;
            offGround = parseInt(v["lift-off-ground"], 10) || 0;
            drag = parseInt(v["lift-drag-and-push"], 10) || 0;
            strMod = parseInt(v["load-str-bonus"], 10) || 0;
            loadMult = parseInt(v["load-multiplier"], 10) || 0;
            mult = 1;
            misc = parseInt(v["load-misc"], 10) || 0;
            l = getCarryingCapacity(str + strMod, load.Light) + misc;
            m = getCarryingCapacity(str + strMod, load.Medium) + misc;
            h = getCarryingCapacity(str + strMod, load.Heavy) + misc;
            if (loadMult < 1) {
                loadMult = 1;
            }
            loadMult--;

            if (legs !== 4 ) {
                switch (size) {
                case -8:
                    sizeMult = 16;
                    break;
                case -4:
                    sizeMult = 8;
                    break;
                case -2:
                    sizeMult = 4;
                    break;
                case -1:
                    sizeMult = 2;
                    break;
                case 1:
                    sizeMult = 3 / 4;
                    break;
                case 2:
                    sizeMult = 1 / 2;
                    break;
                case 4:
                    sizeMult = 1 / 4;
                    break;
                case 8:
                    sizeMult = 1 / 8;
                    break;
                default:
                    sizeMult = 1;
                }
            }
            else if (legs === 4) {
                switch (size) {
                case -8:
                    sizeMult = 24;
                    break;
                case -4:
                    sizeMult = 12;
                    break;
                case -2:
                    sizeMult = 6;
                    break;
                case -1:
                    sizeMult = 3;
                    break;
                case 0:
                    sizeMult = 1.5;
                    break;
                case 1:
                    sizeMult = 1;
                    break;
                case 2:
                    sizeMult = 3 / 4;
                    break;
                case 4:
                    sizeMult = 1 / 2;
                    break;
                case 8:
                    sizeMult = 1 / 4;
                    break;
                default:
                    sizeMult = 1.5;
                }
            }
            mult += loadMult;
            mult *= sizeMult;
            l *= mult;
            m *= mult;
            h *= mult;
            a = h;
            o = h * 2;
            d = h * 5;

            if (currSizeMult !== sizeMult) {
                setter["size-multiplier"] = sizeMult;
            }
            if (currTotalLoadMult !== mult) {
                setter["total-load-multiplier"] = mult;
            }
            if (light !== l) {
                setter["load-light"] = l;
            }
            if (medium !== m) {
                setter["load-medium"] = m;
            }
            if (heavy !== h) {
                setter["load-heavy"] = h;
            }
            if (max !== (h * 2)) {
                setter["load-max"] = h * 2;
            }
            if (aboveHead !== a) {
                setter["lift-above-head"] = a;
            }
            if (offGround !== o) {
                setter["lift-off-ground"] = o;
            }
            if (drag !== d) {
                setter["lift-drag-and-push"] = d;
            }
        }
        catch(err) {
            TAS.error("updateLoadsAndLift", err);
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
/**
 * updates the modified speed and run values
 *  do not round to 5 since if it's 2.5, then double move allows one more square.
 * always updates silently
 * @param {function} callback when done
 */
export function updateModifiedSpeed(callback) {
    var attribList = ["current-load", "speed-base", "speed-modified", "speed-run",
        "is_dwarf", "max-dex-source", "run-mult", "buff_speed-total", "condition-Slowed", "run_cond_applied",
        "condition-Entangled", "condition-Fatigued", "condition-Exhausted" ];
    _.each(PFDefense.defenseArmorShieldRows, function(row) {
        attribList.push(row + "-equipped");
        attribList.push(row + "-type");
    });
    getAttrs(attribList, function(v) {
        var currLoad = parseInt(v["current-load"], 10) || 0;
        var base = parseInt(v["speed-base"], 10) || 0;
        var speedDropdown = parseInt(v["max-dex-source"], 10) || 0;
        var origRunMult = isNaN(parseInt(v["run-mult"], 10)) ? 4 : parseInt(v["run-mult"], 10);
        var buff = parseInt(v["buff_speed-total"], 10) || 0;
        var slowed = 0;
        var cannotRun = 0;
        var newSpeed = base;
        var runMult = origRunMult;
        var newRun = base * runMult;
        var combinedLoad = 0;
        var isDwarf = false;
        var armor3Equipped = 0;
        var armorLoad = 0;
        var setter = {};
        try {
            base = base + buff;
            // speed penalties stack: http://paizo.com/pathfinderRPG/prd/coreRulebook/combat.html#special-movement-rules
            if (parseInt(v["condition-Entangled"], 10) === 2 ) {
                slowed = 1;
                base = base / 2;
                cannotRun = 1;
            }
            if (parseInt(v["condition-Exhausted"], 10) === 3) {
                slowed = 1;
                base = base / 2;
                cannotRun = 1;
            }
            newSpeed = base;
            if (parseInt(v["condition-Fatigued"], 10) === 1 ) {
                cannotRun = 1;
            }
            if (buff < 0) {
                slowed = 1;
            }

            // #0: Armor, Shield & Load
            // #1: Armor & Shield only
            // #2: Load only
            // #3: None
            if (speedDropdown !== 3) {
                armor3Equipped = parseInt(v["armor3-equipped"], 10) || 0;
                // dwarf base speed not lowered but run multiplier can be.
                isDwarf = parseInt(v.is_dwarf, 10) || 0;
                if (armor3Equipped && (speedDropdown === 0 || speedDropdown === 1)) {
                    if (v["armor3-type"] === "Heavy") {
                        armorLoad = 2;
                    }
                    else if (v["armor3-type"] === "Medium" ) {
                        armorLoad = 1;
                    }
                }
                combinedLoad = Math.max(armorLoad, currLoad);
                if (combinedLoad === load.OverDouble) {
                    newSpeed = 0;
                    newRun = 0;
                    cannotRun = 1;
                }
                else if (!isDwarf && combinedLoad > load.Light) {
                    if (combinedLoad === load.Overloaded) {
                        newSpeed = 2.5;
                        newRun = 0;
                        cannotRun = 1;
                    }
                    else if (combinedLoad === load.Heavy || combinedLoad === load.Medium) {
                        if (base <= 5) {
                            newSpeed = 5;
                        }
                        else if (base % 15 === 0) {
                            newSpeed = base * 2 / 3;
                        }
                        else if ((base + 5) % 15 === 0) {
                            newSpeed = (base + 5) * 2 / 3;
                        }
                        else {
                            newSpeed = ((base + 10) * 2 / 3) - 5;
                        }
                        if (combinedLoad === load.Heavy) {
                            runMult--;
                        }
                    }
                }
            }
            if (cannotRun) {
                runMult = 0;
            }
            if (slowed) {
                // round to 3 decimal places
                newSpeed = Math.floor(newSpeed * 1000) / 1000;
            }
            newRun = newSpeed * runMult;
            if (newSpeed !== (parseInt(v["speed-modified"], 10) || 0) ) {
                setter["speed-modified"] = newSpeed;
            }
            if (newRun !== (parseInt(v["speed-run"], 10) || 0) ) {
                setter["speed-run"] = newRun;
            }
            if (slowed !== (parseInt(v["condition-Slowed"], 10) || 0) ) {
                setter["condition-Slowed"] = slowed;
            }
            if (origRunMult > runMult) {
                cannotRun = 1;// for flag even if can run
            }
            if (cannotRun !== (parseInt(v.run_cond_applied, 10) || 0) ) {
                setter.run_cond_applied = cannotRun;
            }
        }
        catch(err) {
            TAS.error("PFEncumbrance.updateModifiedSpeed", err);
        }
        finally {
            if (_.size(setter) > 0) {
                SWUtils.setWrapper(setter, PFConst.silentParams, callback);
            }
            else if (typeof callback === "function") {
                callback();
            }
        }
    });
}
export function migrate(callback) {
    function done() {
        if (typeof callback === "function") {
            callback();
        }
    }
    getAttrs(["max-dex-source"], function(v) {
        var val = parseInt(v["max-dex-source"], 10);
        if (isNaN(val)) {
            SWUtils.setWrapper({ "max-dex-source": 0 }, PFConst.silentParams, done);
        }
        else {
            done();
        }
    });

}
export function recalculate(callback, silently, oldversion) {
    var done = _.once(function() {
        TAS.info("leaving PFEncumbrance.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    });
    var setSpeedWhenDone = _.once(function() {
        updateModifiedSpeed(done);
    });
    var setEncumbrance = _.once(function() {
        updateCurrentLoad(setSpeedWhenDone);
    });
    var setLoadCapability = _.once(function() {
        updateLoadsAndLift(setEncumbrance, silently);
    });
    try {
        migrate(setLoadCapability);
    }
    catch(err) {
        TAS.error("PFEncumbrance.recalculate", err);
        done();
    }
}

function registerEventHandlers() {
    on("change:speed-base change:race change:armor3-equipped change:max-dex-source change:run-mult", TAS.callback(function eventUpdateSpeedPlayer(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateModifiedSpeed();
        }
    }));
    on("change:is_dwarf change:current-load change:armor3-equipped change:armor3-type", TAS.callback(function eventUpdateSpeedAuto(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
            updateModifiedSpeed();
        }
    }));

    on("change:load-light change:carried-total", TAS.callback(function eventUpdateCurrentLoad(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
            updateCurrentLoad();
        }
    }));
    on("change:size-multiplier change:legs change:load-str-bonus change:load-multiplier change:load-misc", TAS.callback(function eventUpdateLoadsAndLiftPlayer(eventInfo) {
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            updateLoadsAndLift();
        }
    }));
    on("change:STR change:size", TAS.callback(function eventUpdateLoadsAndLiftAuto(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
            updateLoadsAndLift();
        }
    }));
}
registerEventHandlers();
