// Used by PFAttacks, PFFeatures, PFSheet
import _ from "underscore";
import TAS from "exports-loader?TAS!TheAaronSheet";
import * as SWUtils from "./SWUtils";
import PFConst from "./PFConst";
import * as PFUtils from "./PFUtils";
import * as PFUtilsAsync from "./PFUtilsAsync";
import * as PFMenus from "./PFMenus";
import * as PFDB from "./PFDB";
import * as PFAttackOptions from "./PFAttackOptions";
import * as PFAttackGrid from "./PFAttackGrid";
import * as PFFeatures from "./PFFeatures";
import * as PFAttacks from "./PFAttacks";
import * as PFAbility from "./PFAbility";

var optionFields = ["is_sp", "hasposrange", "hasuses", "hasattack", "abil-attacktypestr"];
var optionRepeatingHelperFields = ["ability_type", "range_numeric", "frequency", "abil-attack-type"];
var allOptionRepeatingFields = optionFields.concat(optionRepeatingHelperFields);
var otherCommandMacros = {
    "ex": " [^{extraordinary-abilities-menu}](~@{character_id}|NPCPREFIXex_button)",
    "sp": " [^{spell-like-abilities-menu}](~@{character_id}|NPCPREFIXsp_button)",
    "su": " [^{supernatural-abilities-menu}](~@{character_id}|NPCPREFIXsu_button)"
};
var events = {
    attackEventsSLA: ["damage-macro-text", "damage-type", "abil-sr", "save", "abil-attack-type", "name", "range_numeric"],
    commandMacroFields: ["name", "used", "used_max", "showinmenu", "ability_type", "frequency", "rule_category"]
};

function setClassName(id, callback, eventInfo) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var idStr = SWUtils.getRepeatingIDStr(id);
    var prefix = "repeating_ability_" + idStr;
    var clbasisField = prefix + "CL-basis";
    getAttrs([prefix + "CL-basis", prefix + "class-name", "race", "class-0-name", "class-1-name", "class-2-name", "class-3-name", "class-4-name", "class-5-name"], function(v) {
        var clBase = "";
        var setter = {};
        var match;
        try {
            if (v[clbasisField]) {
                if (v[clbasisField] === "@{level}") {
                    clBase = v.race;
                }
                else if (v[clbasisField] === "@{npc-hd-num}") {
                    clBase = v.race;
                }
                else if (parseInt(v[clbasisField], 10) === 0) {
                    clBase = "";
                }
                else {
                    match = v[prefix + "CL-basis"].match(/\d+/);
                    if (match) {
                        clBase = v["class-" + match[0] + "-name"];
                    }
                }
                if (v[prefix + "class-name"] !== clBase) {
                    setter[prefix + "class-name"] = clBase;
                }
            }
        }
        catch(err) {
            TAS.error("PFAbility.setClassName", err);
        }
        finally {
            if (_.size(setter) > 0) {
                SWUtils.setWrapper(setter, PFConst.silentParams, done);
            }
            else {
                done();
            }
        }
    });
}

function setTypeTab(callback, silently, id, eventInfo) {
    var prefix = "repeating_ability_" + SWUtils.getRepeatingIDStr(id);
    getAttrs([prefix + "frequency", prefix + "rule_category", prefix + "CL-basis", prefix + "ability_type",
        prefix + "tabcat", prefix + "tabcat2", "abilities_tab", "npc-abilities_tab"], function(v) {
        var setter = {};
        var params = PFConst.silentParams;

        setter[prefix + "tabcat2"] = v[prefix + "ability_type"] || "-1";
        SWUtils.setWrapper(setter, params);
    });
}

function setRuleTab(callback, silently, id, eventInfo) {
    var prefix = "repeating_ability_" + SWUtils.getRepeatingIDStr(id);
    getAttrs([prefix + "frequency", prefix + "rule_category", prefix + "CL-basis", prefix + "ability_type",
        prefix + "tabcat", prefix + "tabcat2", "abilities_tab", "npc-abilities_tab"], function(v) {
        var setter = {};
        var ruleForTab = "";
        var params = PFConst.silentParams;
        switch (v[prefix + "rule_category"]) {
        case "racial-traits":
            ruleForTab = "traits";
            break;
        case "monster-rule":
            ruleForTab = "other";
            break;
        default:
            ruleForTab = v[prefix + "rule_category"] || "";
            break;
        }
        if (!ruleForTab) {
            ruleForTab = "-1";
        }
        setter[prefix + "tabcat"] = ruleForTab;

        // if users changed the rule then change the tab we're checked on
        if (eventInfo ) {
            if (ruleForTab !== "-1") {
                if ( v.abilities_tab !== ruleForTab && !(/Ex|Sp|Su|99/i).test(v.abilites_tab) ) {
                    setter.abilities_tab = ruleForTab;
                }
                if ( v["npc-abilities_tab"] !== ruleForTab && !(/Ex|Sp|Su|99/i).test(v["npc-abilities_tab"]) ) {
                    setter["npc-abilities_tab"] = ruleForTab;
                }
            }
            if ( v[prefix + "rule_category"] === "class-features" &&
                (!v[prefix + "CL-basis"] || v[prefix + "CL-basis"] === "0")) {
                setter[prefix + "CL-basis"] = "@{class-0-level}";
                params = {};
            }
            else if (v[prefix + "rule_category"] === "racial-traits" &&
                (!v[prefix + "CL-basis"] || v[prefix + "CL-basis"] === "0")) {
                setter[prefix + "CL-basis"] = "@{level}";
                params = {};
            }
        }
        if (v[prefix + "rule_category"] === "spell-like-abilities") {
            v[prefix + "tabcat2"] = "Sp";
            setter[prefix + "ability_type"] = "Sp";
        }
        if (!v[prefix + "frequency"]) {
            setter[prefix + "frequency"] = "not-applicable";
        }
        if (_.size(setter)) {
            SWUtils.setWrapper(setter, params, setClassName);
        }
    });
}

// Used by PFSheet
export function setRuleTabs() {
    getSectionIDs("repeating_ability", function(ids) {
        _.each(ids, function(id) {
            setRuleTab(null, null, id);
            setTypeTab(null, null, id);
        });
    });
}

/**
 * returns all rule_category and ability_type used
 * @returns {'rules':[values of rule_category], 'types':[valuesof ability_type]} object of rules
 */
function getAbilityTypes(callback) {
    function done(typeObj) {

        if (typeof callback === "function") {
            callback(typeObj);
        }
    }
    getSectionIDs("repeating_ability", function(ids) {
        var fields = [];
        if (!ids || _.size(ids) === 0) {
            done({ "rules": [], "types": [] });
            return;
        }
        _.each(ids, function(id) {
            var prefix = "repeating_ability_" + id + "_";
            fields.push(prefix + "rule_category");
            fields.push(prefix + "showinmenu");
            fields.push(prefix + "ability_type");
        });
        getAttrs(fields, function(v) {
            var basearray = [];
            var rulearray = [];
            var typearray = [];
            basearray = _.chain(ids)
                .map(function(id) {
                    var retObj = {};
                    var prefix = "repeating_ability_" + id + "_";
                    retObj.id = id;
                    retObj.showinmenu = parseInt(v[prefix + "showinmenu"], 10) || 0;
                    retObj.rule_category = v[prefix + "rule_category"] || "";
                    retObj.ability_type = (v[prefix + "ability_type"] || "").toLowerCase();

                    return retObj;
                })
                .filter(function(o) {
                    return o.showinmenu;
                })
                .value();

            if (basearray) {
                rulearray = _.chain(basearray)
                    .groupBy("rule_category")
                    .keys()
                    .compact()
                    .value();
                typearray = _.chain(basearray)
                    .groupBy("ability_type")
                    .keys()
                    .compact()
                    .value();
            }
            if (!rulearray) {
                rulearray = [];
            }
            if (!typearray) {
                typearray = [];
            }
            done({ "rules": rulearray, "types": typearray });
        });
    });
}

function getNewAbilityAttrs(ability) {
    var setter = {};
    var id = "";
    var prefix = "";
    var matches;
    try {
        id = generateRowID();
        prefix = "repeating_ability_" + id + "_";
        setter[prefix + "row_id"] = id;
        setter[prefix + "showinmenu"] = ability.showinmenu || 0;
        setter[prefix + "name"] = ability.name || "";
        setter[prefix + "used"] = ability.used || 0;
        setter[prefix + "used_max"] = ability.used_max || 0;
        setter[prefix + "max-calculation"] = ability["max-calculation"] || "";
        setter[prefix + "short-description"] = ability["short-description"] || "";
        setter[prefix + "description"] = ability.description || "";
        setter[prefix + "rule_category"] = ability.rule_category || "";
        setter[prefix + "CL-basis"] = ability["CL-basis"] || "0";
        setter[prefix + "class-name"] = ability["class-name"] || "";
        if (ability.rule_category === "spell-like-abilities") {
            setter[prefix + "ability_type"] = "Sp";
            if (ability["spell_level-misc"]) {
                setter[prefix + "spell_level-misc"] = ability["spell_level-misc"];
                setter[prefix + "spell_level-misc-mod"] = ability["spell_level-misc-mod"];
                setter[prefix + "spell_level-basis"] = ability["spell_level-basis"];
            }
            if (ability.range_numeric) {
                setter[prefix + "range"] = ability.range;
                setter[prefix + "range_numeric"] = ability.range_numeric;
                setter[prefix + "range_pick"] = ability.range_pick;
            }
            if (ability["abil-sr"]) {
                setter[prefix + "abil-sr"] = ability["abil-sr"];
            }
            if (ability.save) {
                setter[prefix + "save"] = ability.save;
            }
        }
        else {
            matches = ability.name.match(/\b(Sp|Su|Ex)\b/i);
            if (matches && matches[1]) {
                setter[prefix + "ability_type"] = matches[0][0].toUpperCase() + matches[0][1].toLowerCase();
            }
            else {
                setter[prefix + "ability_type"] = "";
            }
        }
        setter[prefix + "macro-text"] = ability["macro-text"] || "";
    }
    catch(err) {
        TAS.error("PFAbility.getNewAbilityAttrs", err, ability);
    }
    return setter;
}

// Used by PFFeatures
export function copyToAbilities(callback, abilities) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var setter = {};

    if (_.size(abilities)) {
        _.each(abilities, function(ability) {
            var xtra = getNewAbilityAttrs(ability);

            _.extend(setter, xtra);
        });

    }
    if (_.size(setter)) {
        SWUtils.setWrapper(setter, PFConst.silentParams, done);
    }
    else {
        done();
    }
}

/**
 * resetTopCommandMacro sets all-abilities_buttons_macro (menu of ability menus)
 */
function getTopOfMenu(callback, isNPC) {
    function done(str) {

        if (typeof callback === "function") {
            callback(str);
        }
    }
    var newMacro = "";
    try {
        newMacro = " @{orig_ability_header_macro}";
        getAbilityTypes(function(used) {
            var addlMacros = "";
            var prefix = "";
            try {
                if (isNPC) {
                    prefix = "NPC-";
                }
                if (used.types ) {
                    _.each(used.types, function(type) {
                        if (otherCommandMacros[type]) {
                            addlMacros += otherCommandMacros[type].replace("NPCPREFIX", prefix);
                        }
                        else if (type) {
                            TAS.warn("cound not find top macro for " + type);
                        }
                    });
                }
                if (addlMacros) {
                    newMacro += " {{row03=^{ability-menus}}} {{row04=" + addlMacros + "}}";
                }

            }
            catch(innererr) {
                TAS.error("PFAbility.getTopOfMenu innererr", innererr);
            }
            finally {
                done(newMacro);
            }
        });
    }
    catch(err) {
        TAS.error("PFAbility.getTopOfMenu", err);
        done(newMacro);
    }
}

// Used by PFSheet
export function resetCommandMacro(callback) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var doneOne = _.after(8, done);

    getTopOfMenu( function(header) {
        PFMenus.resetOneCommandMacro("ability", true, doneOne, header);
    }, true);
    getTopOfMenu( function(header) {
        PFMenus.resetOneCommandMacro("ability", false, doneOne, header);
    }, false);
    PFMenus.resetOneCommandMacro("ex", true, doneOne);
    PFMenus.resetOneCommandMacro("sp", true, doneOne);
    PFMenus.resetOneCommandMacro("su", true, doneOne);
    PFMenus.resetOneCommandMacro("ex", false, doneOne);
    PFMenus.resetOneCommandMacro("sp", false, doneOne);
    PFMenus.resetOneCommandMacro("su", false, doneOne);
}

function importFromCompendium(callback, eventInfo) {
    var done = _.once(function() {
        resetCommandMacro();

        if (typeof callback === "function") {
            callback();
        }
    });
    var id = SWUtils.getRowId(eventInfo.sourceAttribute); // row doesn't really exist yet so get id from event
    var prefix = "repeating_ability_" + id + "_";

    getAttrs(["is_undead", prefix + "name", prefix + "compendium_category", prefix + "rule_category", prefix + "ability_type_compendium", prefix + "ability_type", prefix + "description",
        prefix + "range_from_compendium", prefix + "target_from_compendium", prefix + "area_from_compendium", prefix + "effect_from_compendium"], function(v) {
        var compcat = "";
        var abilitytype = "";
        var ability_basis = "";
        var location = "";
        var setter = {};
        var newcat = "";
        var abilname = "";
        var silentSetter = {};
        var match;
        var areaEffectText = "";
        var newRangeSettings;
        try {

            if (v[prefix + "ability_type_compendium"]) {
                abilitytype = v[prefix + "ability_type_compendium"];
                setter[prefix + "ability_type"] = abilitytype;
                silentSetter[prefix + "ability_type_compendium"] = "";
            }
            compcat = v[prefix + "compendium_category"];
            silentSetter[prefix + "compendium_category"] = "";
            if (compcat) {
                compcat = compcat.toLowerCase();
                if (compcat === "feats") {
                    newcat = "feats";
                }
                else if (compcat === "monster rule") {
                    newcat = "monster-rule";
                }
                else if (compcat === "spell") {
                    newcat = "spell-like-abilities";
                }
                if (newcat === "monster-rule") {
                    if ( v[prefix + "description"]) {
                        match = v[prefix + "description"].match(/Location:\s*(.*)$/i);

                        if (match && match[1]) {
                            location = SWUtils.trimBoth(match[1].toLowerCase());
                            match = location.match(/special qual|sq|special att|special abil|defens|spell/i);
                            if (match) {
                                switch (match[0]) {
                                case "special qual":
                                case "sq":
                                    newcat = "special-qualities";
                                    break;
                                case "special att":
                                    newcat = "special-attacks";
                                    break;
                                case "special abil":
                                    newcat = "special-abilities";
                                    break;
                                case "defens":
                                    newcat = "defensive-abilities";
                                    break;
                                case "spell":
                                    newcat = "spell-like-abilities";
                                    break;
                                }
                            }
                        }
                    }
                }
                if (abilitytype === "Sp" && !newcat) {
                    newcat = "spell-like-abilities";
                }
                if (!abilitytype && newcat === "spell-like-abilities") {
                    abilitytype = "Sp";
                    setter[prefix + "ability_type"] = "Sp";
                }
                else if (abilitytype === "Sp" && !newcat) {
                    newcat = "spell-like-abilities";
                }

                if (newcat) {
                    setter[prefix + "rule_category"] = newcat;
                }
                if (abilitytype === "Sp") {
                    areaEffectText = v[prefix + "target_from_compendium"] ||
                        v[prefix + "area_from_compendium"] || v[prefix + "effect_from_compendium"] || "";
                    setter[prefix + "targets"] = areaEffectText;
                    if (v[prefix + "range_from_compendium"]) {
                        newRangeSettings = PFUtils.parseSpellRangeText(v[prefix + "range_from_compendium"], areaEffectText);
                        setter[prefix + "range_pick"] = newRangeSettings.dropdown;
                        setter[prefix + "range"] = newRangeSettings.rangetext;
                    }
                    setter[prefix + "ability-basis"] = "@{CHA-mod}";

                }
                else if ( v[prefix + "name"]) {
                    abilname = v[prefix + "name"].tolowercase();
                    abilname = abilname.match(/^[^(]+/);
                    if (PFDB.specialAttackDCAbilityBase[abilname]) {
                        ability_basis = PFDB.specialAttackDCAbilityBase[abilname];
                    }
                    else {
                        ability_basis = "CON";
                    }
                    if (ability_basis === "CON" && parseInt(v.is_undead, 10)) {
                        ability_basis = "CHA";
                    }
                    ability_basis = "@{" + ability_basis + "}";
                    setter[prefix + "ability-basis"] = ability_basis;
                }
            }
        }
        catch(err) {
            TAS.error("PFAbility.importFromCompendium", err);
        }
        finally {
            if (_.size(silentSetter) > 0) {
                SWUtils.setWrapper(silentSetter, PFConst.silentParams);
            }

            if (_.size(setter) > 0) {
                SWUtils.setWrapper(setter, {}, done);
            }
            else {
                done();
            }
        }
    });
}

function setAttackEntryVals(spellPrefix, weaponPrefix, v, setter, noName) {
    var notes = "";
    var attackType = "";
    setter = setter || {};
    try {
        attackType = PFUtils.findAbilityInString(v[spellPrefix + "abil-attack-type"]);
        if (v[spellPrefix + "name"]) {
            if (!noName) {
                setter[weaponPrefix + "name"] = v[spellPrefix + "name"];
            }
            setter[weaponPrefix + "source-ability-name"] = v[spellPrefix + "name"];
        }
        if (attackType) {
            setter[weaponPrefix + "attack-type"] = v[spellPrefix + "abil-attack-type"];
            if ((/CMB/i).test(attackType)) {
                setter[weaponPrefix + "vs"] = "cmd";
            }
            else if ((/ranged/i).test(attackType)) {
                setter[weaponPrefix + "vs"] = "touch";
                setter[weaponPrefix + "isranged"] = 1;
                setter[weaponPrefix + "range"] = v[spellPrefix + "range_numeric"] || 0;
            }
            else {
                setter[weaponPrefix + "vs"] = "touch";
                setter[weaponPrefix + "range"] = 0;
            }
        }

        if (v[spellPrefix + "damage-macro-text"]) {
            setter[weaponPrefix + "precision_dmg_macro"] = v[spellPrefix + "damage-macro-text"];
            if (attackType) {
                setter[weaponPrefix + "critical_dmg_macro"] = v[spellPrefix + "damage-macro-text"];
            }
            else {
                setter[weaponPrefix + "critical_dmg_macro"] = "";
            }
        }
        if (v[spellPrefix + "damage-type"]) {
            setter[weaponPrefix + "precision_dmg_type"] = v[spellPrefix + "damage-type"];
            if (attackType) {
                setter[weaponPrefix + "critical_dmg_type"] = v[spellPrefix + "damage-type"];
            }
            else {
                setter[weaponPrefix + "critical_dmg_type"] = "";
            }
        }

        if (v[spellPrefix + "save"]) {
            if (notes) {
                notes += ", ";
            }
            notes += "Save: " + v[spellPrefix + "save"] + " DC: [[@{" + spellPrefix + "savedc}]]";
        }
        if ( v[spellPrefix + "abil-sr"]) {
            if (notes) {
                notes += ", ";
            }
            notes += "Spell resist:" + v[spellPrefix + "abil-sr"];
        }
        if (notes) {
            setter[weaponPrefix + "notes"] = notes;
        }
    }
    catch(err) {
        TAS.error("PFAbility.setAttackEntryVals", err);
    }
    return setter;
}

// Used by PFAttacks, PFSheet
/**
 * Triggered from a button in repeating spells
 * @param {string} id the row id or null
 * @param {string} weaponId if updating existing row
 */
export function createAttackEntryFromRow(id, callback, silently, eventInfo, weaponId) {
    var done = _.once(function() {

        if (typeof callback === "function") {
            callback();
        }
    });
    var attribList = [];
    var itemId;
    var item_entry;
    var slaPrefix;
    var attributes = ["range_numeric", "damage-macro-text", "damage-type", "abil-sr", "savedc", "save", "abil-attack-type", "name"]
    ;
    if (id === "DELETED") {
        done();
        return;
    }
    itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : "");
    item_entry = "repeating_ability_" + SWUtils.getRepeatingIDStr(itemId);
    slaPrefix = item_entry;
    if (!itemId) {
        TAS.warn("Cannot create usable attack entry from SLA since we cannot identify the row id");
        done();
        return;
    }
    attributes.forEach(function(attr) {
        attribList.push(slaPrefix + attr);
    });

    getAttrs(attribList, function(v) {
        var newRowId = "";
        var setter = {};
        var prefix = "repeating_weapon_";
        var idStr = "";
        var abilityexists = true;
        var deletedability = false;
        var params = {};
        try {
            if (_.size(v) === 0) {
                abilityexists = false;
            }
            if (abilityexists) {

                if (!PFUtils.findAbilityInString(v[slaPrefix + "abil-attack-type"]) && !v[slaPrefix + "damage-macro-text"]) {
                    TAS.warn("no attack to create for ability " + v[slaPrefix + "name"] + ", " + itemId );
                }
                else {
                    if (!weaponId) {
                        newRowId = generateRowID();
                    }
                    else {
                        newRowId = weaponId;
                    }
                    idStr = newRowId + "_";
                    prefix += idStr;
                    setter = setAttackEntryVals(slaPrefix, prefix, v, setter, weaponId);
                    setter[prefix + "source-ability"] = itemId;
                    setter[prefix + "group"] = "Special";
                    setter[prefix + "link_type"] = PFAttacks.linkedAttackType.ability;
                }
            }
            else if (weaponId) {
                setter["repeating_weapon_" + weaponId + "_source-ability"] = "DELETED";
                deletedability = true;
            }
        }
        catch(err) {
            TAS.error("PFAbility.createAttackEntryFromRow", err);
        }
        finally {
            if (deletedability) {
                SWUtils.setWrapper(setter, params, done);
            }
            else if (_.size(setter) > 0) {
                setter[slaPrefix + "create-attack-entry"] = 0;
                if (silently) {
                    params = PFConst.silentParams;
                }

                SWUtils.setWrapper(setter, params, function() {
                    // can do these in parallel

                    PFAttackOptions.resetOption(newRowId);
                    PFAttackGrid.resetCommandMacro();
                    done();
                });
            }
            else {
                setter[slaPrefix + "create-attack-entry"] = 0;
                SWUtils.setWrapper(setter, PFConst.silentParams, done);
            }
        }
    });
}

function updateAssociatedAttack(id, callback, silently, eventInfo) {
    var done = _.once(function() {

        if (typeof callback === "function") {
            callback();
        }
    });
    var itemId = "";
    var item_entry = "";
    var attrib = "";
    var attributes = [];
    itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : "");
    item_entry = "repeating_ability_" + SWUtils.getRepeatingIDStr(itemId);
    attrib = eventInfo ? SWUtils.getAttributeName(eventInfo.sourceAttribute) : "";
    attributes = [];

    if (attrib) {
        attributes = [item_entry + attrib];
        if ((/range/i).test(attrib)) {
            attributes = [item_entry + "range_pick", item_entry + "range", item_entry + "range_numeric"];
        }
        else {
            attributes = [item_entry + "range_pick", item_entry + "range", item_entry + "range_numeric", item_entry + "damage-macro-text", item_entry + "damage-type", item_entry + "sr", item_entry + "savedc", item_entry + "save", item_entry + "abil-attack-type", item_entry + "name"];
        }
    }
    else {
        attributes = [item_entry + "range_pick", item_entry + "range", item_entry + "range_numeric", item_entry + "damage-macro-text", item_entry + "damage-type", item_entry + "sr", item_entry + "savedc", item_entry + "save", item_entry + "abil-attack-type", item_entry + "name"];
    }
    getAttrs(attributes, function(spellVal) {
        getSectionIDs("repeating_weapon", function(idarray) { // get the repeating set
            var spellsourcesFields = [];
            spellsourcesFields = _.reduce(idarray, function(memo, currentID) {
                memo.push("repeating_weapon_" + currentID + "_source-ability");
                return memo;
            }, []);
            getAttrs(spellsourcesFields, function(v) {
                var setter = {};
                var params = {};
                var idlist = [];
                try {
                    _.each(idarray, function(currentID) {
                        var prefix = "repeating_weapon_" + currentID + "_";
                        if (v[prefix + "source-ability"] === itemId) {
                            idlist.push(currentID);
                            setter = setAttackEntryVals(item_entry, prefix, spellVal, setter);
                        }
                    });
                }
                catch(err) {
                    TAS.error("PFAbility.updateAssociatedAttack", err);
                }
                finally {
                    if (_.size(setter) > 0) {
                        if (silently) {
                            params = PFConst.silentParams;
                        }
                        SWUtils.setWrapper(setter, params, function() {
                            PFAttackOptions.resetSomeOptions(idlist);
                        });
                    }
                    else {
                        done();
                    }
                }
            });
        });
    });
}

function updateCharLevel(id, callback, eventInfo) {
    var done = _.once(function() {

        if (typeof callback === "function") {
            callback();
        }
    });
    var idStr = SWUtils.getRepeatingIDStr(id);
    var prefix = "repeating_ability_" + idStr;
    getAttrs([prefix + "CL-misc-mod", prefix + "CL-basis-mod", prefix + "casterlevel", prefix + "ability_type", "buff_CasterLevel-total", "CasterLevel-Penalty"], function(v) {
        var clBase = 0;
        var cl = 0;
        var misc = 0;
        var pen = 0;
        var isSP = 0;
        var setter = {};
        try {
            isSP = parseInt(v[prefix + "ability_type"], 10) || 0;
            clBase = parseInt(v[prefix + "CL-basis-mod"], 10) || 0;
            misc = parseInt(v[prefix + "CL-misc-mod"], 10) || 0;
            pen = parseInt(v["CasterLevel-Penalty"], 10) || 0;
            cl = clBase + misc + pen;
            if (isSP) {
                cl += parseInt(v["buff_CasterLevel-total"], 10) || 0;
            }
            if (cl !== parseInt(v[prefix + "casterlevel"], 10)) {
                setter[prefix + "casterlevel"] = cl;
            }
        }
        catch(err) {
            TAS.error("PFAbility.updateCharLevel", err);
        }
        finally {
            if (_.size(setter)) {
                SWUtils.setWrapper(setter, PFConst.silentParams, done);
            }
            else {
                done();
            }
        }
    });
}

function updateAbilityRange(id, callback, silently, eventInfo) {
    var done = _.once(function() {

        if (typeof callback === "function") {
            callback();
        }
    });
    var idStr = SWUtils.getRepeatingIDStr(id);
    var prefix = "repeating_ability_" + idStr;
    getAttrs([prefix + "range_pick", prefix + "range", prefix + "range_numeric", prefix + "casterlevel", prefix + "ability_type"], function(v) {
        var newRange = 0;
        var currRange = 0;
        var cl = 0;
        var setter = {};
        var isSP = 0;
        var currPosRange = 0;
        try {
            isSP = v[prefix + "ability_type"] === "Sp" ? 1 : 0;
            currRange = parseInt(v[prefix + "range_numeric"], 10) || 0;
            if (isSP) {
                cl = parseInt(v[prefix + "casterlevel"], 10) || 0;
                newRange = PFUtils.findSpellRange(v[prefix + "range"], v[prefix + "range_pick"], cl) || 0;
            }
            else {
                newRange = parseInt(SWUtils.trimBoth(v[prefix + "range"]), 10) || 0;
            }
            if (newRange !== currRange) {

                setter[prefix + "range_numeric"] = newRange;
            }
            currPosRange = parseInt(v[prefix + "hasposrange"], 10) || 0;
            if (newRange > 0 && !currPosRange) {
                setter[prefix + "hasposrange"] = 1;
            }
            else if (currPosRange) {
                setter[prefix + "hasposrange"] = 0;
            }
        }
        catch(err) {
            TAS.error("updateAbilityRange", err);
        }
        finally {
            if (_.size(setter)) {
                SWUtils.setWrapper(setter, {}, done);
            }
            else {
                done();
            }
        }
    });
}

/**
 * to use in calls to _.invoke or otherwise, sets switch variables to setter for given row
 * @param {jsobj} setter to pass in first var of SWUtils.setWrapper
 * @param {string} id the id of this row, or null if we are within the row context already
 * @param {jsobj} v the values needed returned by getAttrs
 */
function resetOption(setter, id, v, eventInfo) {
    var idStr = SWUtils.getRepeatingIDStr(id);
    var prefix = "repeating_ability_" + idStr;
    var isSP = "";
    var posRange = "";
    var hasUses = "";
    var hasFrequency = "";
    var hasAttack = "";
    var atkstr = "";
    var attackStrForDisplay = "";
    setter = setter || {};
    try {
        if (!v) {
            return setter;
        }
        isSP = v[prefix + "ability_type"] === "Sp" ? "1" : "";

        if (isSP !== v[prefix + "is_sp"]) {
            setter[prefix + "is_sp"] = isSP;
        }
        posRange = (parseInt(v[prefix + "range_numeric"], 10) || 0) > 0 ? "1" : "";
        if (posRange !== v[prefix + "hasposrange"]) {
            setter[prefix + "hasposrange"] = posRange;
        }
        if (v[prefix + "frequency"] && v[prefix + "frequency"] !== "not-applicable") {
            hasFrequency = "1";
            switch (v[prefix + "frequency"]) {
            case "perday":
            case "permonth":
            case "hexfreq":
            case "other":
                hasUses = "1";
                break;
            }
        }
        if (hasFrequency !== v[prefix + "hasfrequency"]) {
            setter[prefix + "hasfrequency"] = hasFrequency;
        }
        if (hasUses !== v[prefix + "hasuses"]) {
            setter[prefix + "hasuses"] = hasUses;
        }
        if (PFUtils.findAbilityInString(v[prefix + "abil-attack-type"])) {
            hasAttack = "1";
        }
        if (hasAttack !== v[prefix + "hasattack"]) {
            setter[prefix + "hasattack"] = hasAttack;
        }
        if (hasAttack) {
            atkstr = v[prefix + "abil-attack-type"].toLowerCase();
            if (atkstr.indexOf("melee") >= 0) {
                attackStrForDisplay = "touch";
            }
            else if (atkstr.indexOf("range") >= 0) {
                attackStrForDisplay = "ranged-touch-ray";
            }
            else if (atkstr.indexOf("cmb") >= 0) {
                attackStrForDisplay = "combat-maneuver-bonus-abbrv";
            }
        }
        if (attackStrForDisplay !== v[prefix + "abil-attacktypestr"]) {
            setter[prefix + "abil-attacktypestr"] = attackStrForDisplay;
        }
    }
    catch(err) {
        TAS.error("PFAbility.recalcAbilities", err);
    }
    return setter;
}

function resetOptionAsync(id, callback, eventInfo) {
    var done = _.once(function() {

        if (typeof callback === "function") {
            callback();
        }
    });
    var idStr = SWUtils.getRepeatingIDStr(id);
    var prefix = "repeating_ability_" + idStr;
    var fields = [];
    fields = _.map(allOptionRepeatingFields, function(attr) {
        return prefix + attr;
    });
    getAttrs(fields, function(v) {
        var setter = {};
        try {
            setter = resetOption(setter, id, v);
        }
        catch(err) {
            TAS.error("PFAbility.recalcAbilities", err);
        }
        finally {
            if (_.size(setter)) {
                SWUtils.setWrapper(setter, PFConst.silentParams, done, eventInfo);
            }
            else {
                done();
            }
        }
    });
}

function recalcAbilities(callback, silently, eventInfo, levelOnly) {
    var done = _.once(function() {

        if (typeof callback === "function") {
            callback();
        }
    });
    getSectionIDs("repeating_ability", function(ids) {
        var numids = _.size(ids);
        var doneOne;
        var calllevel;
        if (numids === 0) {
            done();
            return;
        }
        doneOne = _.after(numids, done);
        // refactor to do all rows at once
        calllevel = function(id) {
            PFUtilsAsync.setRepeatingDropdownValue("ability", id, "CL-basis", "CL-basis-mod", function() {
                updateCharLevel(id, function() {
                    setClassName(id);
                    updateAbilityRange(id, function() {
                        doneOne();
                    });
                });
            }, true, true);
        };
        _.each(ids, function(id) {
            calllevel(id);
            if (!levelOnly) {
                resetOptionAsync(id);
            }
        });
    });
}

// Used by PFSheet
export function migrate(callback) {
    if (typeof callback === "function") {
        callback();
    }
}

// Used by PFFeatures, PFSheet
export function recalculate(callback, silently, oldversion) {
    var done = _.once(function() {
        TAS.info("leaving PFAbility.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    });
    function doneWithList() {
        resetCommandMacro();
        done();
    }
    function callRecalcAbilities() {

        recalcAbilities(doneWithList);
        setRuleTabs();
    }
    try {

        migrate(callRecalcAbilities);
    }
    catch(err) {
        TAS.error("PFAbility.recalculate, ", err);
        done();
    }
}

function registerEventHandlers() {
    var eventToWatch = "";
    var macroEvent = "remove:repeating_ability ";
    var singleEvent = "change:repeating_ability:";

    on("remove:repeating_ability", function eventRemoveAbility(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        PFAttacks.removeLinkedAttack(null, PFAttacks.linkedAttackType.ability, SWUtils.getRowId(eventInfo.sourceAttribute));
    });
    macroEvent = _.reduce(events.commandMacroFields, function(m, a) {
        m += singleEvent + a + " ";
        return m;
    }, macroEvent);
    on(macroEvent, function eventRepeatingAbilityCommandMacroUpdate(eventInfo) {
        if ( eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (/used_max/i).test(eventInfo.sourceAttribute)) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            PFFeatures.resetTopCommandMacro(null, eventInfo);
            resetCommandMacro();
        }
    });
    on("change:repeating_ability:CL-basis", function eventAbilityClassDropdown(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        SWUtils.evaluateAndSetNumber("repeating_ability_CL-basis", "repeating_ability_CL-basis-mod");
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" ) {
            setClassName(null, null, eventInfo);
        }
    });
    eventToWatch = _.reduce(optionRepeatingHelperFields, function(m, a) {
        m += "change:repeating_ability:" + a + " ";
        return m;
    }, "");
    on(eventToWatch, function eventChangeAbilityTypeFrequencyOrRange(eventInfo) {
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (/range/i).test(eventInfo.sourceAttribute) ) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            resetOptionAsync();
        }
    });
    on("change:repeating_ability:CL-misc change:repeating_ability:spell_level-misc",
        function eventSLAEquationMacro(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            SWUtils.evaluateAndSetNumber(eventInfo.sourceAttribute, eventInfo.sourceAttribute + "-mod");
        });
    on("change:buff_CasterLevel-total change:CasterLevel-Penalty",
        function eventAbilityLevelChange(eventInfo) {
            if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api" ) {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                recalcAbilities(null, null, eventInfo, true);
            }
        });
    on("change:repeating_ability:CL-basis-mod change:repeating_ability:CL-misc-mod",
        function eventAbilityLevelChange(eventInfo) {
            if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api" ) {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                updateCharLevel(null, null, eventInfo);
            }
        });
    on("change:repeating_ability:compendium_category", function eventAbilityCompendium(eventInfo) {
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            importFromCompendium(null, eventInfo);
        }
    });
    on("change:repeating_ability:create-attack-entry", function eventcreateAttackEntryFromSLA(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            createAttackEntryFromRow(null, null, false, eventInfo);
        }
    });
    on("change:repeating_ability:CL-misc-mod change:repeating_ability:CL-basis-mod change:repeating_ability:range_pick change:repeating_ability:range",
        function eventClassRangeMod(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            // cl-misc-mod, cl-basis-mod  is sheetworker, range_pick and range must be player
            if ( ((/range/i).test(eventInfo.sourceAttribute) && (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" )) ||
            ((/CL/i).test(eventInfo.sourceAttribute) && eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") ) {
                updateAbilityRange(null, null, false, eventInfo);
            }
        });
    eventToWatch = _.reduce(events.attackEventsSLA, function(memo, attr) {
        memo += "change:repeating_ability:" + attr + " ";
        return memo;
    }, "");
    on(eventToWatch, function eventupdateAssociatedSLAttackAttack(eventInfo) {
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (/range_numeric/i).test(eventInfo.sourceAttribute) ) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            updateAssociatedAttack(null, null, null, eventInfo);
        }
    });
    on("change:repeating_ability:rule_category", function eventUpdateAbilityRule(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        setRuleTab(null, null, null, eventInfo);
    });
    on("change:repeating_ability:ability_type", function eventUpdateAbilityType(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        setTypeTab(null, null, null, eventInfo);
    });
    // toggles the chat menu Show option for all repeating abilities
    on("change:showinmenu_all_abilities", function() {
        getSectionIDs("repeating_ability", function(idArray) {
            const fieldNames = idArray.map(id => `repeating_ability_${id}_showinmenu`);
            getAttrs(["showinmenu_all_abilities"], function(values) {
                const toggle = +values.showinmenu_all_abilities || 0;
                const settings = fieldNames.reduce((obj, item) => (obj[item] = toggle, obj), {});
                setAttrs(settings);
                PFAbility.recalculate();
            });
        });
    });
}
registerEventHandlers();
