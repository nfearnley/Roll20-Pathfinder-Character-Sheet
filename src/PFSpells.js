import _ from "underscore";
import TAS from "exports-loader?TAS!TheAaronSheet";
import PFConst from "./PFConst";
import * as SWUtils from "./SWUtils";
import * as PFUtils from "./PFUtils";
import * as PFMigrate from "./PFMigrate";
import * as PFSpellOptions from "./PFSpellOptions";
import * as PFAttackOptions from "./PFAttackOptions";
import * as PFAttackGrid from "./PFAttackGrid";
import * as PFAttacks from "./PFAttacks";
// spell levels for repeating spell sections
export var spellLevels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
// for parsing: classes without their own spell lists plus bloodrager as sorcerer, whose list is not in compendium - hunter handled special
var classesUsingOtherSpellLists = {
    "arcanist": "wizard",
    "investigator": "alchemist",
    "warpriest": "cleric",
    "skald": "bard",
    "bloodrager": "sorcerer"
};

export function resetCommandMacro(dummy, eventInfo, callback) {

    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var repeatingSpellAttrs = ["spell_level", "spellclass_number", "name", "school", "slot", "metamagic", "used", "isDomain", "isMythic"];
    var class0BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{font=@{apply_specfont_chat}@{use_specfont}}} {{scroll_desc=@{scroll-desc}}} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{spellclass-0-name} ^{spells}}} {{concentration=@{Concentration-0}}} {{casterlevel=@{spellclass-0-level-total}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-0-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-0) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}";
    var class1BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{font=@{apply_specfont_chat}@{use_specfont}}} {{scroll_desc=@{scroll-desc}}} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{spellclass-1-name} ^{spells}}} {{concentration=@{Concentration-1}}} {{casterlevel=@{spellclass-1-level-total}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-1-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-1) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}";
    var class2BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{font=@{apply_specfont_chat}@{use_specfont}}} {{scroll_desc=@{scroll-desc}}} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{spellclass-2-name} ^{spells}}} {{concentration=@{Concentration-2}}} {{casterlevel=@{spellclass-2-level-total}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-2-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-2) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}";
    var npcClass0BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{font=@{apply_specfont_chat}@{use_specfont}}} {{scroll_desc=@{scroll-desc}}} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} @{spellclass-0-name} ^{spells}}} {{concentration=@{Concentration-0}}} {{casterlevel=@{spellclass-0-level-total}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-0-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-0) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}";
    var npcClass1BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{font=@{apply_specfont_chat}@{use_specfont}}} {{scroll_desc=@{scroll-desc}}} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} @{spellclass-1-name} ^{spells}}} {{concentration=@{Concentration-1}}} {{casterlevel=@{spellclass-1-level-total}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-1-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-1) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}";
    var npcClass2BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{font=@{apply_specfont_chat}@{use_specfont}}} {{scroll_desc=@{scroll-desc}}} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} @{spellclass-2-name} ^{spells}}} {{concentration=@{Concentration-2}}} {{casterlevel=@{spellclass-2-level-total}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-2-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-2) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}";
    var pcBaseMacro = [class0BaseMacro, class1BaseMacro, class2BaseMacro];
    var npcBaseMacro = [npcClass0BaseMacro, npcClass1BaseMacro, npcClass2BaseMacro];
    function resetToDefault(configV) {
        var attrs = [];
        var i = 0;
        for (i = 0; i < 3; i++) {
            if (configV["spellclass-" + i + "-book"].slice(13) !== pcBaseMacro[i].slice(13)) {
                attrs["spellclass-" + i + "-book"] = pcBaseMacro[i];
            }
            if (configV["spellclass-" + i + "-book-npc"].slice(13) !== npcBaseMacro[i].slice(13)) {
                attrs["spellclass-" + i + "-book-npc"] = npcBaseMacro[i];
            }
        }
        if (_.size(attrs) > 0) {
            SWUtils.setWrapper(attrs, PFConst.silentParams, done);
        }
        else {
            done();
        }
    }
    getAttrs(["spellclass-0-casting_type", "spellclass-1-casting_type", "spellclass-2-casting_type", "spellclass-0-hide_unprepared",
        "spellclass-1-hide_unprepared", "spellclass-2-hide_unprepared", "spellclass-0-book", "spellclass-1-book", "spellclass-2-book",
        "spellclass-0-book-npc", "spellclass-1-book-npc", "spellclass-2-book-npc",
        "spellclass-0-show_domain_spells", "spellclass-1-show_domain_spells", "spellclass-2-show_domain_spells",
        "spellmenu_groupby_school", "spellmenu_show_uses", "mythic-adventures-show"], function(configV) {
        var isPrepared = [];
        var showDomain = [];
        var hideUnprepared = [];
        var groupBySchool = 0;
        var showUses = 0;
        var usesMythic = 0;
        try {
            isPrepared = [
                parseInt(configV["spellclass-0-casting_type"], 10) === 2,
                parseInt(configV["spellclass-1-casting_type"], 10) === 2,
                parseInt(configV["spellclass-2-casting_type"], 10) === 2];
            showDomain = [
                parseInt(configV["spellclass-0-show_domain_spells"], 10) || 0,
                parseInt(configV["spellclass-1-show_domain_spells"], 10) || 0,
                parseInt(configV["spellclass-2-show_domain_spells"], 10) || 0];
            hideUnprepared = [
                parseInt(configV["spellclass-0-hide_unprepared"], 10) || 0,
                parseInt(configV["spellclass-1-hide_unprepared"], 10) || 0,
                parseInt(configV["spellclass-2-hide_unprepared"], 10) || 0];
            groupBySchool = parseInt(configV.spellmenu_groupby_school, 10) || 0;
            showUses = parseInt(configV.spellmenu_show_uses, 10) || 0;
            usesMythic = parseInt(configV["mythic-adventures-show"], 10) || 0;
        }
        catch(outererr) {
            TAS.error("PFSpells.resetCommandMacro, error assembling global vars", outererr);
            done();
            return;
        }
        getSectionIDs("repeating_spells", function(idarray) {

            if (!idarray || idarray.length === 0) {
                resetToDefault(configV);
                return;
            }
            getAttrs(["_reporder_repeating_spells"], function(repValues) {

                var spellAttrs;
                try {
                    spellAttrs = _.chain(idarray)
                        .map(function(id) {
                            var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
                            var retVal = [];
                            _.each(repeatingSpellAttrs, function(attr) {
                                retVal.push(prefix + attr);
                            });
                            return retVal;
                        })
                        .flatten()
                        .value();
                }
                catch(errouter2) {
                    TAS.error("PFSpells.resetCommandMacro errouter", errouter2);
                    done();
                    return;
                }
                getAttrs(spellAttrs, function(values) {

                    var orderedList;
                    var repList;
                    var spellsByClass;
                    var customSorted = 0;
                    var spellsPC;
                    var spellsNPC;
                    var i;
                    var spellSchoolReg = /[^([]*/;
                    var attrs = {};
                    var rollTemplateCounter = 0;
                    var tempstr;
                    try {
                        if (!_.isUndefined(repValues._reporder_repeating_spells) && repValues._reporder_repeating_spells !== "") {
                            repList = repValues._reporder_repeating_spells.split(",");
                            repList = _.map(repList, function(ID) {
                                return ID.toLowerCase();
                            });
                            orderedList = _.intersection(_.union(repList, idarray), idarray);
                            customSorted = 1;
                        }
                        else {
                            orderedList = idarray;
                        }
                        spellsByClass = _.chain(orderedList)
                            .map(function(id) {
                                var prefix = "";
                                var metaMagic = 0;
                                var spellSlot = 0;
                                var matches;
                                var schoolForGroup = "";
                                var levelstr = "";
                                var rawlevel = 0;
                                var spellClass = "";
                                var classStr = "";
                                var isDomain = 0;
                                var isMythic = 0;
                                var uses = 0;
                                var name = "";
                                try {
                                    prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
                                    metaMagic = parseInt(values[prefix + "metamagic"], 10) || 0;
                                    spellSlot = metaMagic ? values[prefix + "slot"] || values[prefix + "spell_level"] : values[prefix + "spell_level"];
                                    schoolForGroup = values[prefix + "school"] || "";
                                    matches = spellSchoolReg.exec(values[prefix + "school"] || "");
                                    if (matches && matches[0]) {
                                        schoolForGroup = SWUtils.trimBoth(matches[0]);
                                        schoolForGroup = schoolForGroup[0].toUpperCase() + schoolForGroup.slice(1).toLowerCase();
                                    }
                                    levelstr = "^{level} " + String(spellSlot);
                                    rawlevel = parseInt(values[prefix + "spell_level"], 10) || 0;
                                    spellClass = parseInt(values[prefix + "spellclass_number"], 10) || 0;
                                    classStr = "class" + (values[prefix + "spellclass_number"] || "0");
                                    isDomain = parseInt(values[prefix + "isDomain"], 10) || 0;
                                    isMythic = usesMythic * parseInt(values[prefix + "isMythic"], 10) || 0;
                                    uses = parseInt(values[prefix + "used"], 10) || 0;
                                    name = values[prefix + "name"] || "";
                                }
                                catch(errmap) {
                                    TAS.error("PFSpells.resetCommandMacro errmap on id " + id, errmap);
                                }
                                return {
                                    "id": id,
                                    "level": spellSlot,
                                    "levelstr": levelstr,
                                    "rawlevel": rawlevel,
                                    "school": schoolForGroup,
                                    "spellClass": spellClass,
                                    "spellClassstr": classStr,
                                    "isDomain": isDomain,
                                    "isMythic": isMythic,
                                    "uses": uses,
                                    "name": name
                                };
                            })
                            .omit(function(spellObj) {
                                return hideUnprepared[spellObj.spellClass] && isPrepared[spellObj.spellClass] && spellObj.uses === 0 &&
                                    !( showDomain[spellObj.spellClass] && spellObj.isDomain );
                            })
                            .map(function(spellObj) {
                                var spellName = spellObj.name;
                                var usesStr = "";
                                var dstr = "";
                                var mystr = "";
                                var lvlstr = "";
                                var spacestr = "";
                                try {
                                    spellName = SWUtils.escapeForChatLinkButton(spellName);
                                    spellName = SWUtils.escapeForRollTemplate(spellName);
                                    spellName = SWUtils.trimBoth(spellName);
                                    usesStr = showUses ? "(" + spellObj.uses + ")" : "";
                                    if (showUses && isPrepared[spellObj.spellClass] && spellObj.isDomain) {
                                        usesStr = "";
                                    }
                                    mystr = spellObj.isMythic ? "&#x1f11c;" : "";
                                    dstr = spellObj.isDomain ? "&#x1f113;" : "";
                                    lvlstr = groupBySchool ? spellObj.level + ":" : "";
                                    spacestr = usesStr || mystr || dstr ? " " : "";
                                    spellName = " [" + lvlstr + spellName + spacestr + dstr + mystr + usesStr + "]";
                                }
                                catch(maperr) {
                                    TAS.error("PFSpells.resetCommandMacro error creating link name:", maperr);
                                }
                                spellObj.pcChatLink = spellName + "(~@{character_id}|repeating_spells_" + spellObj.id + "_roll)";
                                spellObj.npcChatLink = spellName + "(~@{character_id}|repeating_spells_" + spellObj.id + "_npc-roll)";
                                return spellObj;
                            }).value();
                        if (!customSorted) {
                            spellsByClass = _.sortBy(spellsByClass, "level");
                        }
                        spellsByClass = _.chain(spellsByClass)
                            .groupBy("spellClassstr")
                            .mapObject(function(classArray) {
                                return _.chain(classArray)
                                    .sortBy(groupBySchool ? "school" : "levelstr")
                                    .groupBy(groupBySchool ? "school" : "levelstr")
                                    .value();
                            })
                            .value();

                        // was 2 sets of 3 reduces but can do this faster with 3 each loops and populating both at once
                        spellsPC = {};
                        spellsNPC = {};
                        rollTemplateCounter = 10;
                        _.each(spellsByClass, function(groupList, classGroup) {
                            var pcstr = "";
                            var npcstr = "";
                            _.each(groupList, function(spellList, groupName) {
                                rollTemplateCounter++;
                                pcstr += " {{row" + rollTemplateCounter + "=**" + groupName + "**}}";
                                npcstr += " {{row" + rollTemplateCounter + "=**" + groupName + "**}}";
                                rollTemplateCounter++;
                                pcstr += " {{row" + rollTemplateCounter + "=";
                                npcstr += " {{row" + rollTemplateCounter + "=";
                                _.each(spellList, function(spellObj) {
                                    pcstr += spellObj.pcChatLink;
                                    npcstr += spellObj.npcChatLink;
                                });
                                pcstr += "}}";
                                npcstr += "}}";
                            });
                            spellsPC[classGroup] = pcstr;
                            spellsNPC[classGroup] = npcstr;
                        });

                        for (i = 0; i < 3; i++) {
                            tempstr = pcBaseMacro[i] + spellsPC["class" + i];
                            if (tempstr && configV["spellclass-" + i + "-book"].slice(13) !== tempstr.slice(13)) {
                                attrs["spellclass-" + i + "-book"] = tempstr;
                            }
                            else if (!tempstr && configV["spellclass-" + i + "-book"].slice(13) !== pcBaseMacro[i].slice(13)) {
                                attrs["spellclass-" + i + "-book"] = "";
                            }
                            tempstr = npcBaseMacro[i] + spellsNPC["class" + i];
                            if (tempstr && configV["spellclass-" + i + "-book-npc"].slice(13) !== tempstr.slice(13)) {
                                attrs["spellclass-" + i + "-book-npc"] = tempstr;
                            }
                            else if (!tempstr && configV["spellclass-" + i + "-book-npc"].slice(13) !== npcBaseMacro[i].slice(13)) {
                                attrs["spellclass-" + i + "-book-npc"] = "";
                            }
                        }
                        if (_.size(attrs) > 0) {
                            SWUtils.setWrapper(attrs, PFConst.silentParams, done);
                        }
                        else {
                            done();
                        }
                    }
                    catch(err) {
                        TAS.error("PFSpells.resetCommandMacro", err);
                        done();
                    }
                });
            });
        });
    });
}

/**
 * update spells if a user changes "uses" on spell row
 * @param {string} dummy normally id but not used
 * @param {map} eventInfo from event, not used
 * @param {function} callbackwhen done
 * @param {boolean} silently if you want to update silently
 */
function updateSpellsPerDay(dummy, eventInfo, callback, silently) {
    var done = _.once(function() {

        if (typeof callback === "function") {
            callback();
        }
    });
    var fields = ["total_spells_manually", "repeating_spells_used", "repeating_spells_spellclass_number", "repeating_spells_spell_level", "repeating_spells_slot", "repeating_spells_metamagic"];
    getAttrs(fields, function(v) {
        var classNum = 0;
        var spellLevel;
        var slot = 0;
        var metamagic = 0;
        var fieldname = "";
        var fieldname2 = "";
        var initialtot = {};
        try {

            if (!parseInt(v.total_spells_manually, 10)) {
                spellLevel = parseInt(v.repeating_spells_spell_level, 10) || 0;

                classNum = parseInt(v.repeating_spells_spellclass_number, 10);
                if (isNaN(classNum)) {
                    setAttrs({ "repeating_spells_spellclass_number": 0 });
                }
                metamagic = parseInt(v.repeating_spells_metamagic, 10) || 0;
                if (metamagic) {
                    slot = parseInt(v.repeating_spells_slot, 10);
                    if (!isNaN(slot)) {
                        spellLevel = slot;
                    }
                }
                // now update the spells per day for the associated class idx and spell level
                fieldname = "spellclass-" + classNum + "-level-" + spellLevel + "-spells-per-day";
                fieldname2 = "spellclass-" + classNum + "-level-" + spellLevel + "-spells-prepared";
                initialtot[fieldname] = 0;
                initialtot[fieldname2] = 0;

                TAS.repeating("spells").attrs(fieldname, fieldname2).fields("row_id", "used", "spell_level", "metamagic", "slot").reduce(function(m, r) {
                    try {
                        if (r.I.spell_level === spellLevel || (r.I.metamagic && r.I.slot === spellLevel)) {
                            m += r.I.used;
                        }
                    }
                    catch(innererr) {
                        TAS.error("PFSpells.updateSpellsPerDay innererr", innererr);
                    }
                    return m;
                }, 0, function(m, r, a) {
                    try {
                        a.S[fieldname] = m;
                        a.S[fieldname2] = m;
                    }
                    catch(erri) {
                        TAS.error("ERROR calculating spells per day!", erri);
                        if (a && a.I) {
                            a.I[fieldname] = m;
                            a.I[fieldname2] = m;
                        }
                    }
                }).execute(done);
            }
            else {
                done();
            }
        }
        catch(erro) {
            TAS.error("PFSpells.updateSpellsPerDay  ERROR", erro, eventInfo);
        }
    });
}

function getSpellTotals(ids, v, setter) {
    var doNotProcess = 0;
    var casterTypes = [0, 0, 0];
    var totalPrepped = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    var totalListed = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    try {
        doNotProcess = parseInt(v.total_spells_manually, 10) || 0;
        casterTypes[0] = parseInt(v["spellclass-0-casting_type"], 10) || 0;
        if (parseInt(v.spellclasses_multiclassed, 10)) {
            casterTypes[1] = parseInt(v["spellclass-1-casting_type"], 10) || 0;
            casterTypes[2] = parseInt(v["spellclass-2-casting_type"], 10) || 0;
        }
        _.each(ids, function(id) {
            var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
            var spellLevel;
            var classNum = 0;
            var metamagic = 0;
            var slot;
            var uses = 0;
            try {
                spellLevel = parseInt(v[prefix + "spell_level"], 10) || 0;
                classNum = parseInt(v[prefix + "spellclass_number"], 10);
                if (isNaN(classNum)) {
                    classNum = 0;
                    setter[prefix + "spellclass_number"] = 0;
                }
                metamagic = parseInt(v[prefix + "metamagic"], 10) || 0;
                slot = parseInt(v[prefix + "slot"], 10);
                if (isNaN(slot)) {
                    setter[prefix + "slot"] = spellLevel;
                }
                else if (metamagic && slot !== spellLevel) {
                    spellLevel = slot;
                }
                else if (slot !== spellLevel) {
                    slot = spellLevel;
                    setter[prefix + "slot"] = spellLevel;
                }
                totalListed[classNum][spellLevel] += 1;
                if (!doNotProcess) {
                    uses = parseInt(v[prefix + "used"], 10) || 0;
                    totalPrepped[classNum][spellLevel] += uses;
                }
            }
            catch(err2) {
                TAS.error("PFSpells.getSpellTotals err2", err2);
            }
        });

        _.each(PFConst.spellClassIndexes, function(classidx) {
            _.each(spellLevels, function(spellLevel) {
                var prefix = "spellclass-" + classidx + "-level-" + spellLevel;
                var total = 0;
                var perday = 0;
                total = parseInt(v[prefix + "-total-listed"], 10) || 0;
                if (total !== totalListed[classidx][spellLevel]) {
                    setter[prefix + "-total-listed"] = totalListed[classidx][spellLevel];
                }
                perday = parseInt(v[prefix + "-spells-per-day"], 10) || 0;
                if ( casterTypes[classidx] > 0 && !doNotProcess) {
                    if (perday !== totalPrepped[classidx][spellLevel]) {
                        setter[prefix + "-spells-per-day"] = totalPrepped[classidx][spellLevel];
                    }
                }
                else {
                    if (perday === 0) {
                        setter[prefix + "-spells-per-day"] = 0;
                    }
                }
            });
        });
    }
    catch(err) {
        TAS.error("PFSpells.getSpellTotals", err);
    }
    return setter;
}

export function resetSpellsTotals(dummy, eventInfo, callback, silently) {
    var done = _.once(function() {

        if (typeof callback === "function") {
            callback();
        }
    });
    getSectionIDs("repeating_spells", function(ids) {
        var fields = ["total_spells_manually", "spellclasses_multiclassed", "spellclass-0-casting_type", "spellclass-1-casting_type", "spellclass-2-casting_type"];
        var rowattrs = ["spellclass_number", "spell_level", "slot", "metamagic", "used"];
        try {
            _.each(ids, function(id) {
                var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
                _.each(rowattrs, function(attr) {
                    fields.push(prefix + attr);
                });
            });
            _.each(PFConst.spellClassIndexes, function(classidx) {
                _.each(spellLevels, function(spellLevel) {
                    fields.push("spellclass-" + classidx + "-level-" + spellLevel + "-total-listed");
                    fields.push("spellclass-" + classidx + "-level-" + spellLevel + "-spells-prepared");
                    fields.push("spellclass-" + classidx + "-level-" + spellLevel + "-spells-per-day");
                });
            });
            getAttrs(fields, function(v) {
                var setter = {};
                try {
                    setter = getSpellTotals(ids, v, setter);
                    if (_.size(setter)) {
                        SWUtils.setWrapper(setter, PFConst.silentParams, done);
                    }
                    else {
                        done();
                    }
                }
                catch(innererr) {
                    TAS.error("PFSpells.resetSpellsTotals innererror:", innererr);
                    done();
                }
            });
        }
        catch(err) {
            TAS.error("PFSpells.resetSpellsTotals:", err);
            done();
        }
    });
}
// ******************************** REPEATING SPELL FUNCTIONS **********************************
function setAttackEntryVals(spellPrefix, weaponPrefix, v, setter, noName) {
    var notes = "";
    var attackType = "";
    setter = setter || {};
    try {
        TAS.debug("UPDATING SPELL ATTACK: " + spellPrefix, v);
        attackType = PFUtils.findAbilityInString(v[spellPrefix + "spell-attack-type"]);
        if (v[spellPrefix + "name"]) {
            if (!noName) {
                setter[weaponPrefix + "name"] = v[spellPrefix + "name"];
            }
            setter[weaponPrefix + "source-spell-name"] = v[spellPrefix + "name"];
        }
        if (attackType) {
            setter[weaponPrefix + "attack-type"] = v[spellPrefix + "spell-attack-type"];
            if ((/CMB/i).test(attackType)) {
                setter[weaponPrefix + "vs"] = "cmd";
            }
            else {
                setter[weaponPrefix + "vs"] = "touch";
            }
        }
        if (v[spellPrefix + "range_numeric"]) {
            setter[weaponPrefix + "range"] = v[spellPrefix + "range_numeric"];
        }
        if (v[spellPrefix + "range"] && v[spellPrefix + "range_pick"] === "see_text" ) {
            notes += "Range:" + v[spellPrefix + "range"];
        }

        if (v[spellPrefix + "damage-macro-text"]) {
            setter[weaponPrefix + "precision_dmg_macro"] = v[spellPrefix + "damage-macro-text"];
            if (attackType) {
                setter[weaponPrefix + "critical_dmg_macro"] = v[spellPrefix + "damage-macro-text"];
            }
        }
        if (v[spellPrefix + "damage-type"]) {
            setter[weaponPrefix + "precision_dmg_type"] = v[spellPrefix + "damage-type"];
            if (attackType) {
                setter[weaponPrefix + "critical_dmg_type"] = v[spellPrefix + "damage-type"];
            }
        }
        if (v[spellPrefix + "save"] ) {
            notes += "Save: " + v[spellPrefix + "save"];
            if ( !(/none/).test(v[spellPrefix + "save"])) {
                notes += " DC: " + v[spellPrefix + "savedc"];
            }
        }
        if ( v[spellPrefix + "sr"]) {
            if (notes) {
                notes += ", ";
            }
            notes += "Spell resist:" + v[spellPrefix + "sr"];
        }
        if (notes) {
            setter[weaponPrefix + "notes"] = notes;
        }
    }
    catch(err) {
        TAS.error("PFSpells.setAttackEntryVals", err);
    }
    return setter;
}
// Triggered from a button in repeating spells
export function createAttackEntryFromRow(id, callback, silently, eventInfo, weaponId) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var attribList = [];
    var itemId = "";
    var idStr = "";
    var item_entry = "";
    var attributes = ["create-attack-entry", "range_pick", "range", "range_numeric", "damage-macro-text", "damage-type", "sr", "savedc", "save"];
    var commonAttributes = ["spell-attack-type", "name"];
    try {
        if (id === "DELETED") {
            done();
            return;
        }
        itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : "");
        idStr = SWUtils.getRepeatingIDStr(itemId);
        item_entry = "repeating_spells_" + idStr;

        attributes.forEach(function(attr) {
            attribList.push(item_entry + attr);
        });
        commonAttributes.forEach(function(attr) {
            attribList.push(item_entry + attr);
        });
    }
    catch(erro) {
        TAS.error("PFSpells.createAttackEntryFromRow erro:", erro, id, eventInfo);
        done();
        return;
    }

    getAttrs(attribList, function(v) {
        var newRowId = "";
        var setter = {};
        var prefix = "repeating_weapon_";
        var idStr = "";
        var spellexists = true;
        var deletedspell = false;
        var params = {};
        try {
            TAS.debug("PFSpells.createAttackEntryFromRow ##### create attack linked from spell, using ", v);
            if (_.size(v) === 0) {
                spellexists = false;
            }

            TAS.debug("PFSpells.createAttackEntryFromRow ##### spellexists = " + spellexists);
            if (spellexists) {

                if (!PFUtils.findAbilityInString(v[item_entry + "spell-attack-type"]) && !v[item_entry + "damage-macro-text"]) {
                    TAS.warn("no attack to create for spell " + v[item_entry + "name"] + ", " + itemId );
                }
                else {
                    if (!weaponId ) {
                        newRowId = generateRowID();
                    }
                    else {
                        newRowId = weaponId;
                    }
                    idStr = newRowId + "_";
                    prefix += idStr;
                    setter = setAttackEntryVals(item_entry, prefix, v, setter);
                    setter[prefix + "source-spell"] = itemId;
                    setter[prefix + "group"] = "Spell";
                    setter[prefix + "link_type"] = PFAttacks.linkedAttackType.spell;
                }
            }
            else {
                if (weaponId) {
                    setter["repeating_weapon_" + weaponId + "_source-spell"] = "DELETED";
                    deletedspell = true;
                    TAS.debug("seting deletedspell to " + deletedspell, setter);
                }
            }
        }
        catch(err) {
            TAS.error("PFSpells.createAttackEntryFromRow", err);
        }
        finally {
            if (deletedspell) {
                SWUtils.setWrapper(setter, PFConst.silentParams, done);
            }
            else if (_.size(setter) > 0) {
                setter[item_entry + "create-attack-entry"] = 0;
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
                setter[item_entry + "create-attack-entry"] = 0;
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
    var attributes = [];
    try {
        itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : "");
        item_entry = "repeating_spells_" + SWUtils.getRepeatingIDStr(itemId);
        attributes = [item_entry + "range_pick", item_entry + "range", item_entry + "range_numeric", item_entry + "damage-macro-text", item_entry + "damage-type", item_entry + "sr", item_entry + "savedc", item_entry + "save", item_entry + "spell-attack-type", item_entry + "name"];
    }
    catch(erro) {
        TAS.error("PFSpells.updateAssociatedAttack erro", erro, id, eventInfo);
        done();
        return;
    }
    getAttrs(attributes, function(spellVal) {
        getSectionIDs("repeating_weapon", function(idarray) { // get the repeating set
            var spellsourcesFields = [];
            spellsourcesFields = _.reduce(idarray, function(memo, currentID) {
                memo.push("repeating_weapon_" + currentID + "_source-spell");
                return memo;
            }, []);
            getAttrs(spellsourcesFields, function(v) {
                var setter = {};
                var params = {};
                var idlist = [];
                try {
                    _.each(idarray, function(currentID) {
                        var prefix = "repeating_weapon_" + currentID + "_";
                        if (v[prefix + "source-spell"] === itemId) {
                            idlist.push(currentID);
                            setter = setAttackEntryVals(item_entry, prefix, spellVal, setter, true);
                        }
                    });
                    if (silently) {
                        params = PFConst.silentParams;
                    }
                }
                catch(err) {
                    TAS.error("PFSpells.updateAssociatedAttack", err);
                }
                finally {
                    if (_.size(setter) > 0) {
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
function updatePreparedSpellState(id, eventInfo) {
    getAttrs(["repeating_spells_used", "repeating_spells_spellclass_number", "repeating_spells_prepared_state", "spellclass-0-hide_unprepared", "spellclass-1-hide_unprepared", "spellclass-2-hide_unprepared"], function(values) {
        var uses = parseInt(values.repeating_spells_used, 10) || 0;
        var preparedState = parseInt(values.repeating_spells_prepared_state, 10) || 0;
        var classnum = values.repeating_spells_spellclass_number;
        var isPrepared = (parseInt(values["spellclass-" + classnum + "-casting_type"], 10) || 0) === 2 ? 1 : 0;
        var hideUnprepared = isPrepared * (parseInt(values["spellclass-" + classnum + "-hide_unprepared"], 10) || 0);
        var setter = {};
        if (uses > 0 && preparedState === 0) {
            setter.repeating_spells_prepared_state = "1";
        }
        else if (uses < 1 && preparedState !== 0) {
            setter.repeating_spells_prepared_state = "0";
        }
        if (isNaN(classnum)) {
            setter.repeating_spells_spellclass_number = 0;
        }
        if (_.size(setter)) {
            if (hideUnprepared) {
                SWUtils.setWrapper(setter, PFConst.silentParams, resetCommandMacro());
            }
            else {
                SWUtils.setWrapper(setter, PFConst.silentParams);
            }
        }
    });
}
/**
 * - sets prepared_state to 1 if used has a value > 0 */
function resetSpellsPrepared() {
    getSectionIDs("repeating_spells", function(ids) {
        var fieldarray = [];
        _.each(ids, function(id) {
            var idStr = SWUtils.getRepeatingIDStr(id);
            var prefix = "repeating_spells_" + idStr;
            fieldarray.push(prefix + "used");
            fieldarray.push(prefix + "prepared_state");
        });
        getAttrs(fieldarray, function(v) {
            var setter = {};
            _.each(ids, function(id) {
                var idStr = SWUtils.getRepeatingIDStr(id);
                var prefix = "repeating_spells_" + idStr;
                var uses = parseInt(v[prefix + "used"], 10) || 0;
                var preparedState = parseInt(v[prefix + "prepared_state"], 10) || 0;
                var setter = {};
                if (uses > 0 && preparedState === 0) {
                    setter[prefix + "prepared_state"] = "1";

                }
                else if (uses < 1 && preparedState !== 0) {
                    setter[prefix + "prepared_state"] = "0";
                }
            });
            if (_.size(setter)) {
                SWUtils.setWrapper(setter, PFConst.silentParams);
            }
        });
    });
}
// ************ SPELL OPTIONS ********************
/**
 * updates all spells when level or concentration or spell penetration is updated
 * @param {int} classIdx 0..2
 * @param {object} eventInfo from on event
 * @param {function} callback when done
 */
export function updateSpellsCasterLevelRelated(classIdx, eventInfo, callback) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });

    if (!(classIdx >= 0 && classIdx <= 2) || isNaN(parseInt(classIdx, 10))) {
        done();
        return;
    }
    getAttrs(["spellclass-" + classIdx + "-level-total", "spellclasses_multiclassed", "Concentration-" + classIdx + "-misc-mod", "spellclass-" + classIdx + "-name",
        "spellclass-" + classIdx + "-SP-mod", "Concentration-" + classIdx + "-def", "Concentration-" + classIdx + "-mod"], function(vout) {
        var classLevel = parseInt(vout["spellclass-" + classIdx + "-level-total"], 10) || 0;
        var abilityMod = parseInt(vout["Concentration-" + classIdx + "-mod"], 10) || 0;
        var multiclassed = parseInt(vout.spellclasses_multiclassed, 10) || 0;
        var defMod = parseInt(vout["Concentration-" + classIdx + "-def"], 10);
        var classConcentrationMisc = parseInt(vout["Concentration-" + classIdx + "-misc-mod"], 10) || 0;
        var classSPMisc = parseInt(vout["spellclass-" + classIdx + "-SP-mod"], 10) || 0;
        var updateDefensiveCasting = eventInfo ? /-def$/i.test(eventInfo.sourceAttribute) : false;
        if (classLevel <= 0) {
            done();
            return;
        }

        getSectionIDs("repeating_spells", function(ids) {
            var rowFieldAppnd = ["casterlevel", "CL_misc", "spell_class_r", "spellclass_number", "spellclass", "range", "range_numeric", "range_pick", "SP-mod", "SP_misc", "Concentration_misc", "Concentration-mod", "spell_options"];
            var fields = _.reduce(ids, function(memo, id) {
                var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
                var row;
                row = _.map(rowFieldAppnd, function(field) {
                    return prefix + field;
                });
                return memo.concat(row);
            }, ["spellclass-0-name", "spellclass-1-name", "spellclass-2-name"]);
            getAttrs(fields, function(v) {
                var classNumSetter = {};
                var setter = {};
                try {

                    _.each(ids, function(id) {
                        var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
                        var classNum = parseInt(v[prefix + "spellclass_number"], 10);
                        var classRadio = parseInt(v[prefix + "spell_class_r"], 10);
                        var chosenRange = v[prefix + "range_pick"] || "";
                        var currRange = parseInt(v[prefix + "range_numeric"], 10) || 0;
                        var spellConcentrationMisc = parseInt(v[prefix + "Concentration_misc"], 10) || 0;
                        var optionText = v[prefix + "spell_options"];
                        var setOption = 0;
                        var tempstr = "";
                        var casterlevel = 0;
                        var newcasterlevel = 0;
                        var newConcentration = 0;
                        var newSP = 0;
                        var newClassName = "";
                        var newRange = 0;
                        try {
                            if (isNaN(classNum)) {
                                classNum = 0;
                                classNumSetter[prefix + "spellclass_number"] = 0;
                                classNumSetter[prefix + "spellclass"] = v["spellclass-0-name"] || "";
                            }
                            if (!multiclassed || classNum === classIdx) {
                                if (classNum !== classRadio || isNaN(classRadio)) {
                                    setter[prefix + "spell_class_r"] = classNum;
                                }
                                newClassName = v["spellclass-" + classNum + "-name"] || "";
                                if (newClassName !== v[prefix + "spellclass"]) {
                                    setter[prefix + "spellclass"] = newClassName;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.spellclass, PFSpellOptions.optionTemplates.spellclass.replace("REPLACE", SWUtils.escapeForRollTemplate(newClassName)));
                                        setOption = 1;
                                    }
                                }
                                casterlevel = parseInt(v[prefix + "casterlevel"], 10);
                                newcasterlevel = classLevel + (parseInt(v[prefix + "CL_misc"], 10) || 0);
                                if (newcasterlevel < 1) {
                                    newcasterlevel = 1;
                                }
                                if (newcasterlevel !== casterlevel || isNaN(casterlevel)) {
                                    casterlevel = newcasterlevel;
                                    setter[prefix + "casterlevel"] = newcasterlevel;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.casterlevel, PFSpellOptions.optionTemplates.casterlevel.replace("REPLACE", newcasterlevel));
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.casterlevel_chk, PFSpellOptions.optionTemplates.casterlevel_chk.replace("REPLACE", newcasterlevel));
                                        setOption = 1;
                                    }
                                }
                                newRange = PFUtils.findSpellRange(v[prefix + "range"], chosenRange, casterlevel) || 0;
                                if (newRange !== currRange) {
                                    setter[prefix + "range_numeric"] = newRange;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.range, PFSpellOptions.optionTemplates.range.replace("REPLACE", newRange));
                                        setOption = 1;
                                    }
                                }
                                if (updateDefensiveCasting && optionText) {
                                    if (defMod > 0) {
                                        tempstr = PFSpellOptions.optionTemplates.cast_def.replace("REPLACE", defMod);
                                    }
                                    else {
                                        tempstr = "{{cast_def=}}";
                                    }
                                    if (optionText.indexOf("{{cast_def=") >= 0) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.cast_def, tempstr);
                                    }
                                    else {
                                        optionText += tempstr;
                                    }
                                    setOption = 1;
                                }
                                newConcentration = newcasterlevel + abilityMod + classConcentrationMisc + spellConcentrationMisc;
                                if (newConcentration !== (parseInt(v[prefix + "Concentration-mod"], 10) || 0)) {
                                    setter[prefix + "Concentration-mod"] = newConcentration;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration, PFSpellOptions.optionTemplates.Concentration.replace("REPLACE", newConcentration));
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration_chk, PFSpellOptions.optionTemplates.Concentration_chk.replace("REPLACE", newConcentration));
                                        setOption = 1;
                                    }
                                }
                                newSP = classSPMisc + (parseInt(v[prefix + "SP_misc"], 10) || 0);
                                if (newSP !== (parseInt(v[prefix + "SP-mod"], 10) || 0)) {
                                    setter[prefix + "SP-mod"] = newSP;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.spellPen, PFSpellOptions.optionTemplates.spellPen.replace("REPLACE", newSP));
                                        setOption = 1;
                                    }
                                }
                                if (setOption) {
                                    setter[prefix + "spell_options"] = optionText;
                                }
                            }
                        }
                        catch(innererror) {
                            TAS.error("updateSpellsCasterLevelRelated innererror on id: " + id, innererror);
                        }
                    });

                }
                catch(err) {
                    TAS.error("updateSpellsCasterLevelRelated error:", err);
                }
                finally {
                    if (_.size(setter) > 0 || _.size(classNumSetter) > 0) {

                        if (_.size(classNumSetter) > 0) {
                            SWUtils.setWrapper(classNumSetter, {}, done);
                        }
                        if (_.size(setter) > 0) {
                            SWUtils.setWrapper(setter, PFConst.silentParams, done);
                        }
                    }
                    else {
                        done();
                    }
                }
            });
        });
    });
}
/**
 * updates all spells when caster ability or DCs are updated
 * @param {int} classIdx 0..2
 * @param {map} eventInfo from on event
 * @param {function} callback when done
 */
export function updateSpellsCasterAbilityRelated(classIdx, eventInfo, callback) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });

    if (!(classIdx >= 0 && classIdx <= 2) || isNaN(parseInt(classIdx, 10))) {
        done();
        return;
    }
    getAttrs(["spellclass-" + classIdx + "-level-total", "Concentration-" + classIdx + "-mod", "Concentration-" + classIdx + "-misc-mod", "spellclasses_multiclassed"], function(vout) {
        var abilityMod;
        var classConcentrationMisc;
        var multiclassed;
        try {
            abilityMod = parseInt(vout["Concentration-" + classIdx + "-mod"], 10) || 0;
            classConcentrationMisc = parseInt(vout["Concentration-" + classIdx + "-misc-mod"], 10) || 0;
            multiclassed = parseInt(vout.spellclasses_multiclassed, 10) || 0;
            if (!parseInt(vout["spellclass-" + classIdx + "-level-total"], 10)) {
                done();
                return;
            }
            getSectionIDs("repeating_spells", function(ids) {
                var fields = [];
                _.each(ids, function(id) {
                    var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
                    fields = fields.concat([prefix + "spellclass_number", prefix + "spell_level", prefix + "spell_level_r", prefix + "spellclass_number",
                        prefix + "casterlevel", prefix + "DC_misc", prefix + "savedc", prefix + "Concentration-mod", prefix + "Concentration_misc", prefix + "spell_options"]);
                });
                getAttrs(fields, function(v) {
                    var newConcentration = 0;
                    var casterlevel = 0;
                    var setter = {};
                    try {
                        _.each(ids, function(id) {
                            var spellLevel = 0;
                            var spellLevelRadio = 0;
                            var newDC = 0;
                            var setOption = 0;
                            var currDC = 0;
                            var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
                            var optionText = v[prefix + "spell_options"];
                            var classNumber;
                            var spellConcentrationMisc = parseInt(v[prefix + "Concentration_misc"], 10) || 0;
                            try {
                                classNumber = parseInt(v[prefix + "spellclass_number"], 10);
                                if (isNaN(classNumber)) {
                                    classNumber = 0;
                                    setter[prefix + "spellclass_number"] = 0;
                                }
                                if (!multiclassed || classNumber === classIdx) {
                                    spellLevel = parseInt(v[prefix + "spell_level"], 10);
                                    spellLevelRadio = parseInt(v[prefix + "spell_level_r"], 10);
                                    if (isNaN(spellLevel)) {
                                        spellLevel = 0;
                                        setter[prefix + "spell_level"] = 0;
                                        TAS.warn("spell level was NaN for " + prefix);
                                    }
                                    if (spellLevel !== spellLevelRadio || isNaN(spellLevelRadio)) {
                                        setter[prefix + "spell_level_r"] = spellLevel;
                                    }
                                    newDC = 10 + spellLevel + abilityMod + (parseInt(v[prefix + "DC_misc"], 10) || 0);
                                    currDC = parseInt(v[prefix + "savedc"], 10) || 0;
                                    if (newDC !== currDC) {
                                        setter[prefix + "savedc"] = newDC;
                                        if (optionText) {
                                            optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.dc, PFSpellOptions.optionTemplates.dc.replace("REPLACE", newDC));
                                            setOption = 1;
                                        }
                                    }
                                    casterlevel = parseInt(v[prefix + "casterlevel"], 10) || 0;
                                    if (!isNaN(casterlevel)) {
                                        newConcentration = casterlevel + abilityMod + classConcentrationMisc + spellConcentrationMisc;
                                        if (newConcentration !== (parseInt(v[prefix + "Concentration-mod"], 10) || 0)) {
                                            setter[prefix + "Concentration-mod"] = newConcentration;
                                            if (optionText) {
                                                optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration, PFSpellOptions.optionTemplates.Concentration.replace("REPLACE", newConcentration));
                                                optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration_chk, PFSpellOptions.optionTemplates.Concentration_chk.replace("REPLACE", newConcentration));
                                                setOption = 1;
                                            }
                                        }
                                        if (setOption && optionText) {
                                            setter[prefix + "spell_options"] = optionText;
                                        }
                                    }
                                    else {
                                        TAS.warn("spell casterlevel is NaN for " + prefix);
                                    }

                                }
                            }
                            catch(innererror) {
                                TAS.error("updateSpellsCasterAbilityRelated innererror on id:" + id, innererror);
                            }
                        });
                    }
                    catch(miderr) {
                        TAS.error("updateSpellsCasterAbilityRelated miderr :", miderr);
                    }
                    finally {
                        if (_.size(setter) > 0) {

                            SWUtils.setWrapper(setter, PFConst.silentParams, done());
                        }
                        else {
                            done();
                        }
                    }
                });
            });
        }
        catch(err) {
            TAS.error("updateSpellsCasterAbilityRelated outer error:", err);
        }
    });
}

/**
 * updates a spell
 * @param {string} id optional, pass id if looping through list of IDs. Null if context is row itself.
 * @param {eventInfo} eventInfo ACTUALLY USED : if not present forces recalc of everything
 * @param {function} callback - to call when done.
 * @param {bool} doNotUpdateTotals - if true do NOT call resetSpellsTotals() and resetCommandMacro() at end, otherwise do.
 */
function updateSpell(id, eventInfo, callback, doNotUpdateTotals) {
    var spellLevelUndefined = false;
    var done = _.once(function() {
        //
        // these asynchronous functions can be called at same time as callback.
        if (!spellLevelUndefined) {
            PFSpellOptions.resetOption(id, eventInfo);
            if (!doNotUpdateTotals) {
                resetSpellsTotals();
                resetCommandMacro();
            }
        }
        if (typeof callback === "function") {
            callback();
        }
    });
    var idStr = "";
    var prefix = "";
    var classNameField = "";
    var classRadioField = "";
    var classNumberField = "";
    var casterlevelField = "";
    var spellLevelField = "";
    var spellLevelRadioField = "";
    var dcMiscField = "";
    var currDCField = "";
    var fields = [];
    var updateClass = false;
    var updateClassLevel = false;
    var updateRange = false;
    var updateSP = false;
    var updateConcentration = false;
    var updateSpellLevel = false;
    var updateDC = false;
    var updateSlot = false;
    var updateStr = "";
    var tempMatches;

    if (!(eventInfo && eventInfo.sourceAttribute)) {
        updateClass = true;
        updateSpellLevel = true;
    }
    else {
        updateStr = eventInfo.sourceAttribute.toLowerCase();
        tempMatches = updateStr.match(/name|lvlstr|category|meta|range_pick|range|sp_misc|cl_misc|spellclass_number|spell_level|dc_misc|concen|slot/);
        if (tempMatches && tempMatches[0]) {
            switch (tempMatches[0]) {
            case "name":
                // only for first time
                updateClass = true;
                updateSpellLevel = true;
                break;
            case "range_pick":
            case "range":
                updateRange = true;
                break;
            case "sp_misc":
                updateSP = true;
                break;
            case "cl_misc":
                updateClassLevel = true;
                updateRange = true;
                updateConcentration = true;
                break;
            case "spellclass_number":
                updateClass = true;
                break;
            case "concen":
                updateConcentration = true;
                break;
            case "spell_level":
                updateSpellLevel = true;
                break;
            case "dc_misc":
                updateDC = true;
                break;
            case "slot":
            case "meta":
                updateSlot = true;
                break;
            case "lvlstr":
            case "category":
                updateClass = true;
                updateSpellLevel = true;
                break;
            default:
                updateClass = true; // unknown just update all
                updateSpellLevel = true;
            }
        }
        else {
            // if we called from importFromCompendium then it's lvlstr
            TAS.warn("Unimportant field updated, do not update row: " + eventInfo.sourceAttribute);
            if (typeof callback === "function") {
                callback();
            }
            return;
        }
        idStr = SWUtils.getRepeatingIDStr(id);
        prefix = "repeating_spells_" + idStr;
        classNameField = prefix + "spellclass";
        classRadioField = prefix + "spell_class_r";
        classNumberField = prefix + "spellclass_number";
        casterlevelField = prefix + "casterlevel";
        spellLevelField = prefix + "spell_level";
        spellLevelRadioField = prefix + "spell_level_r";
        dcMiscField = prefix + "DC_misc";
        currDCField = prefix + "savedc";
    }
    fields = [classNumberField, classRadioField, classNameField, casterlevelField, prefix + "CL_misc",
        prefix + "range_pick", prefix + "range", prefix + "range_numeric",
        prefix + "SP-mod", prefix + "SP_misc", prefix + "Concentration_misc", prefix + "Concentration-mod",
        prefix + "spell_options", prefix + "used", prefix + "slot", prefix + "metamagic", spellLevelField,
        spellLevelRadioField, dcMiscField, currDCField,
        "spellclass-0-level-total", "spellclass-1-level-total", "spellclass-2-level-total",
        "spellclass-0-SP-mod", "spellclass-1-SP-mod", "spellclass-2-SP-mod",
        "Concentration-0-mod", "Concentration-1-mod", "Concentration-2-mod",
        "Concentration-0-misc-mod", "Concentration-1-misc-mod", "Concentration-2-misc-mod",
        "Concentration-0-def", "Concentration-1-def", "Concentration-2-def",
        "spellclass-0-name", "spellclass-1-name", "spellclass-2-name"];

    getAttrs(fields, function(v) {
        var setter = {};
        var baseClassNum;
        var classNum = 0;
        var classRadio = 0;
        var className = "";
        var baseSpellLevel;
        var spellLevel = 0;
        var spellSlot;
        var metaMagic = 0;
        var spellLevelRadio = 0;
        var currCasterLevel;
        var casterlevel = 0;
        var spellAbilityMod = 0;
        var newDC = 10;
        var currRange = 0;
        var currChosenRange = "";
        var newSP = 0;
        var newConcentration = 0;
        var newRange = 0;
        try {
            baseClassNum = parseInt(v[classNumberField], 10);
            if (isNaN(baseClassNum)) {
                baseClassNum = 0;
                setter[classNumberField] = 0;
                setter[classRadioField] = 0;
                updateClass = true;
            }
            baseSpellLevel = parseInt(v[spellLevelField], 10);
            spellSlot = parseInt(v[prefix + "slot"], 10);
            if (isNaN(baseSpellLevel)) {
                spellLevelUndefined = true;
                baseSpellLevel = 0;
                spellSlot = 0;
                setter[spellLevelRadioField] = 0;
                setter[prefix + "slot"] = 0;
                setter[spellLevelField] = 0;
                updateSpellLevel = true;
            }
            if (updateClass || updateClassLevel || updateConcentration || updateDC || updateRange || updateSP) {
                classNum = baseClassNum || 0;
                classRadio = parseInt(v[classRadioField], 10);
            }
            if (updateSpellLevel || updateDC || updateSlot || updateClass) {
                spellLevel = baseSpellLevel || 0;
                metaMagic = parseInt(v[prefix + "metamagic"], 10) || 0;
                spellLevelRadio = parseInt(v[spellLevelRadioField], 10);
            }

            if (updateClass || updateClassLevel || updateConcentration || updateRange ) {
                currCasterLevel = parseInt(v[casterlevelField], 10);
                if (isNaN(currCasterLevel)) {
                    updateClassLevel = true;
                    updateRange = true;
                    updateConcentration = true;
                }
                else {
                    casterlevel = currCasterLevel;
                }
            }
            if (updateClass || updateConcentration || updateDC || updateSpellLevel) {
                spellAbilityMod = parseInt(v["Concentration-" + classNum + "-mod"], 10) || 0;
            }
            if (updateClass || updateRange || updateClassLevel) {
                currRange = parseInt(v[prefix + "range_numeric"], 10) || 0;
                currChosenRange = v[prefix + "range_pick"] || "blank";
            }

            if (updateClass) {
                if (classNum !== classRadio) {
                    setter[classRadioField] = classNum;
                }
                className = v["spellclass-" + classNum + "-name"] || "";
                if (v[classNameField] !== className) {

                    setter[classNameField] = className;
                }
            }

            if (updateSpellLevel || updateSlot ) {
                if (!metaMagic) {
                    if (spellLevel !== spellLevelRadio) {
                        setter[spellLevelRadioField] = spellLevel;
                        setter.spells_tab = spellLevel;
                    }
                    if (spellLevel !== spellSlot) {
                        setter[prefix + "slot"] = spellLevel;
                        spellSlot = spellLevel;
                    }
                }
                else {
                    if (spellSlot !== spellLevelRadio) {
                        setter[spellLevelRadioField] = spellSlot;
                        setter.spells_tab = spellSlot;
                    }
                }
            }
            // set caster level
            if (updateClassLevel || updateClass) {
                casterlevel = (parseInt(v["spellclass-" + classNum + "-level-total"], 10) || 0) + (parseInt(v[prefix + "CL_misc"], 10) || 0);
                if (casterlevel < 1) {
                    casterlevel = 1;
                }
                if (currCasterLevel !== casterlevel || isNaN(currCasterLevel)) {
                    setter[prefix + "casterlevel"] = casterlevel;
                }
            }
            if (updateDC || updateSpellLevel) {
                newDC = 10 + spellLevel + spellAbilityMod + (parseInt(v[dcMiscField], 10) || 0);
                if (newDC !== (parseInt(v[currDCField], 10) || 0)) {
                    setter[currDCField] = newDC;
                }
            }
            if (updateConcentration || updateClassLevel || updateClass) {
                newConcentration = casterlevel + spellAbilityMod + (parseInt(v["Concentration-" + classNum + "-misc-mod"], 10) || 0) + (parseInt(v[prefix + "Concentration_misc"], 10) || 0);
                if (newConcentration !== (parseInt(v[prefix + "Concentration-mod"], 10) || 0)) {
                    setter[prefix + "Concentration-mod"] = newConcentration;
                }
            }
            if ( updateRange || updateClassLevel || updateClass) {
                newRange = PFUtils.findSpellRange(v[prefix + "range"], currChosenRange, casterlevel) || 0;
                if (newRange !== currRange) {
                    setter[prefix + "range_numeric"] = newRange;
                }
            }
            if ( updateSP || updateClass ) {
                newSP = (parseInt(v["spellclass-" + classNum + "-SP-mod"], 10) || 0) + (parseInt(v[prefix + "SP_misc"], 10) || 0);
                if (newSP !== (parseInt(v[prefix + "SP-mod"], 10) || 0)) {
                    setter[prefix + "SP-mod"] = newSP;
                }
            }
        }
        catch(err) {
            TAS.error("PFSpells.updateSpell:" + id, err);
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

function toggleMetaMagic(id, eventInfo, callback) {
    function done() {
        if (typeof callback === "function") {
            callback();
        }
    }
    var idStr = SWUtils.getRepeatingIDStr(id);
    var prefix = "repeating_spells_" + idStr;
    var spellLevelRadioField = prefix + "spell_level_r";
    var spellSlotField = prefix + "slot";
    var spellLevelField = prefix + "spell_level";
    var metamagicField = prefix + "metamagic";
    getAttrs([spellSlotField, spellLevelField, metamagicField, spellLevelRadioField], function(v) {
        var slot;
        var level;
        var metamagic;
        var spellLevelRadio;
        var callUpdateSpell = false;
        var setter = {};
        try {
            slot = parseInt(v[spellSlotField], 10);
            level = parseInt(v[spellLevelField], 10);
            metamagic = parseInt(v[metamagicField], 10) || 0;
            spellLevelRadio = parseInt(v[spellLevelRadioField], 10) || 0;
            if (isNaN(level)) {
                level = 0;
                setter[spellLevelField] = 0;
                setter[spellSlotField] = 0;
            }
            if (isNaN(slot)) {
                slot = level;
                setter[spellSlotField] = level;
            }
            if (metamagic) {
                if (slot !== level) {
                    setter[spellLevelRadioField] = slot;
                    setter.spells_tab = slot;
                    callUpdateSpell = true;
                }
            }
            else if (spellLevelRadio !== level) {
                setter[spellLevelRadioField] = level;
                callUpdateSpell = true;
            }
        }
        catch(err) {
            TAS.error("PFSpells.toggleMetaMagic", err);
        }
        finally {
            if (_.size(setter)) {
                SWUtils.setWrapper(setter, PFConst.silentParams, function() {
                    if (callUpdateSpell) {
                        updateSpell(id, eventInfo, callback);
                    }
                    else {
                        done();
                    }
                });
            }
            else {
                done();
            }
        }

    });
}

/**
 * Updates all spells
 * @param {function} callback when done
 * @param {silently} if should call SWUtils.setWrapper with {silent:true}
 * @param {object} eventInfo not used
 */
function updateSpells(callback, silently, eventInfo) {
    var done = _.once(function() {

        if (typeof callback === "function") {
            callback();
        }
    });
    var doneOne = _.after(3, done);
    getAttrs(["use_spells", "spellclass-0-exists", "spellclass-1-exists", "spellclass-2-exists"], function(v) {

        if (parseInt(v.use_spells, 10)) {
            _.times(3, function(n) {

                if (parseInt(v["spellclass-" + n + "-exists"], 10)) {
                    updateSpellsCasterAbilityRelated(n, null, function() {
                        updateSpellsCasterLevelRelated(n, null, doneOne);
                    });
                }
                else {
                    doneOne();
                }
            });
        }
        else {
            done();
        }
    });
}

/**
 * gets level and class from repeating_spells_spell_lvlstr then updates spell
 * matches class name in compendium against current spell classes in this order:
 * spell class already selected by spell dropdown, spellclass0, spellclass1, spellclass2
 * then sets spell level to the matching level for that class
 * if it cannot find then sets class name to the class level string and updates silently.
 * @param {string} id the id of the row
 * @param {object} eventInfo used to find row id since id param will be null
 */
function importFromCompendium(id, eventInfo) {
    if (eventInfo) {
        if (!id) {
            id = SWUtils.getRowId(eventInfo.sourceAttribute);
        }
    }
    getAttrs(["repeating_spells_compendium_category", "repeating_spells_spell_lvlstr", "spellclass-0-name", "spellclass-1-name", "spellclass-2-name", "repeating_spells_range_from_compendium", "repeating_spells_target_from_compendium", "repeating_spells_area_from_compendium", "repeating_spells_effect_from_compendium", "repeating_spells_description", "repeating_spells_cast-time"], function(v) {
        var levelStrBase = v.repeating_spells_spell_lvlstr;
        var rangeText = v.repeating_spells_range_from_compendium;
        var areaEffectText = (v.repeating_spells_target_from_compendium || "") + (v.repeating_spells_area_from_compendium || "") + (v.repeating_spells_effect_from_compendium || "");
        var classesInital = [];
        var classes = [];
        var originalClasses = ["", "", ""];
        var classMatch = "";
        var level = 0;
        var idx = -1;
        var foundMatch = false;
        var setSilent = {};
        var i = 0;
        var classesToMatch = {};
        var tempclassname = "";
        var newRangeSettings;
        var hasHunter = false;
        var hasDruid = false;
        var hasRanger = false;
        var minHunterSpellLevel = 99;
        var hunterIdx = 99;
        var levels;
        TAS.info("at pfspells.importFromCompendium", v);
        if (!(/spell/i).test(v.repeating_spells_compendium_category)) {
            setSilent.repeating_spells_name = "Cannot parse " + v.repeating_spells_compendium_category;
            setAttrs(setSilent, PFConst.silentParams);
            return;
        }
        if (levelStrBase) {
            try {
                levelStrBase = levelStrBase.toLowerCase();
                // get first word in names of classes (since users may put archetypes or other variables in)
                if (v["spellclass-0-name"]) {
                    tempclassname = v["spellclass-0-name"].toLowerCase().replace(/^\s+/, "").match(/\w+/)[0];
                    classesToMatch[tempclassname] = 0;
                    originalClasses[0] = tempclassname;
                    if (/hunter/.test(tempclassname)) {
                        hasHunter = true;
                        hunterIdx = 0;
                    }
                    else if (/druid/.test(tempclassname)) {
                        hasDruid = true;
                    }
                    else if (/ranger/.test(tempclassname)) {
                        hasRanger = true;
                    }
                }
                if (v["spellclass-1-name"]) {
                    tempclassname = v["spellclass-1-name"].toLowerCase().replace(/^\s+/, "").match(/\w+/)[0];
                    classesToMatch[tempclassname] = 1;
                    originalClasses[1] = tempclassname;
                    if (/hunter/.test(tempclassname)) {
                        hasHunter = true;
                        hunterIdx = 1;
                    }
                    else if (/druid/.test(tempclassname)) {
                        hasDruid = true;
                    }
                    else if (/ranger/.test(tempclassname)) {
                        hasRanger = true;
                    }
                }
                if (v["spellclass-2-name"]) {
                    tempclassname = v["spellclass-2-name"].toLowerCase().replace(/^\s+/, "").match(/\w+/)[0];
                    classesToMatch[tempclassname] = 2;
                    originalClasses[2] = tempclassname;
                    if (/hunter/.test(tempclassname)) {
                        hasHunter = true;
                        hunterIdx = 2;
                    }
                    else if (/druid/.test(tempclassname)) {
                        hasDruid = true;
                    }
                    else if (/ranger/.test(tempclassname)) {
                        hasRanger = true;
                    }
                }
                if (!(hasHunter && (hasDruid || hasRanger))) {
                    // if user is hunter AND other class it's based on then can't tell.
                    if (_.size(classesToMatch) > 0) {
                        // add the translated classes from classesUsingOtherSpellLists
                        _.each(classesToMatch, function(classindex, classname) {
                            _.each(classesUsingOtherSpellLists, function(toclass, fromclass) {
                                if (classname.indexOf(fromclass) >= 0) {
                                    classesToMatch[toclass] = classindex;
                                }
                            });
                        });
                        // from spell: first split on comma between classes, then on spaces between classname and level
                        classesInital = levelStrBase.split(/\s*,\s*/);
                        classes = _.map(classesInital, function(a) {
                            return a.split(/\s+/);
                        });
                        for (i = 0; i < classes.length; i++) {
                            classes[i][1] = parseInt(classes[i][1], 10) || 0;
                        }
                        // classes example: [["sorcerer/wizard","2"],["summoner","1"],["inquisitor","3"],["magus","2"]]
                        if (hasHunter) {
                            for (i = 0; i < classes.length; i++) {
                                if (/druid|ranger/.test(classes[i][0]) && classes[i][1] < minHunterSpellLevel) {
                                    minHunterSpellLevel = classes[i][1];
                                    classMatch = classes[i][0];
                                }
                            }
                            if (minHunterSpellLevel < 99) {
                                foundMatch = true;
                                level = minHunterSpellLevel;
                                idx = hunterIdx;
                            }
                        }
                        _.each(classesToMatch, function(classindex, classname) {
                            for (i = 0; i < classes.length; i++) {
                                // classes on left because it can be longer and have multiple class names such as cleric/druid
                                if (classes[i][0].indexOf(classname) >= 0) {
                                    if (!foundMatch) {
                                        classMatch = originalClasses[classindex];
                                        level = classes[i][1];
                                        idx = classindex;
                                        foundMatch = true;
                                    }
                                }
                            }
                        });
                    }
                }
            }
            catch(err2) {
                TAS.error("PFSpells.importfromCompendium err2:", err2);
                classMatch = "";
                foundMatch = 0;
            }
            try {
                if (!foundMatch) {
                    TAS.warn("importFromCompendium: did not find class match");
                    setSilent.repeating_spells_description = "Original spell level:" + v.repeating_spells_spell_lvlstr + " \r\n" + v.repeating_spells_description;
                    // If the levels/classes is an array get mode and use that for level
                    levels = _.map(classes, function(oneclass) {
                        return oneclass[1];
                    });
                    level = _.chain(levels).countBy().pairs().max(_.last).head().value() || 0;
                    idx = 0;
                    classMatch = originalClasses[0];
                }
                else {
                    setSilent.repeating_spells_description = SWUtils.trimBoth(v.repeating_spells_description);
                }
            }
            catch(err3) {
                TAS.error("PFSpells.importFromCompendium err3", err3);
            }
            finally {
                level = level || 0;
                idx = idx || 0;
                classMatch = classMatch || originalClasses[0] || "Sorceror";
                foundMatch = true;
            }
            if (v["repeating_spells_cast-time"] ) {
                setSilent["repeating_spells_cast-time"] = v["repeating_spells_cast-time"].replace(/standard action/i, "S.A.");
            }
            setSilent.repeating_spells_spell_level = level;
            setSilent.repeating_spells_slot = level;
            setSilent.repeating_spells_spell_level_r = level;
            setSilent.repeating_spells_spellclass_number = idx;
            setSilent.repeating_spells_spell_class_r = idx;
            setSilent.repeating_spells_spellclass = classMatch;
            // change tab so spell doesn't disappear.
            setSilent.spells_tab = level;
        }
        if (rangeText) {
            try {
                newRangeSettings = PFUtils.parseSpellRangeText(rangeText, areaEffectText);
                setSilent.repeating_spells_range_pick = newRangeSettings.dropdown;
                setSilent.repeating_spells_range = newRangeSettings.rangetext;
                if (newRangeSettings.dropdown === "touch" ) {
                    setSilent["repeating_spells_spell-attack-type"] = "attk-melee";
                }
                else if ( (/ranged touch|ray\s/i).test(v.repeating_spells_description) ) {
                    setSilent["repeating_spells_spell-attack-type"] = "attk-ranged";
                }
            }
            catch(err2) {
                TAS.error(err2);
                setSilent.repeating_spells_range = rangeText.replace(/\s*\(..*/, "");
                setSilent.repeating_spells_range_pick = "unknownrange";
            }
        }
        if (areaEffectText) {
            setSilent.repeating_spells_targets = areaEffectText;
        }
        setSilent.repeating_spells_spell_lvlstr = "";
        setSilent.repeating_spells_range_from_compendium = "";
        setSilent.repeating_spells_target_from_compendium = "";
        setSilent.repeating_spells_area_from_compendium = "";
        setSilent.repeating_spells_effect_from_compendium = "";
        if (_.size(setSilent) > 0) {
            SWUtils.setWrapper(setSilent, PFConst.silentParams, function() {
                updateSpell(id, eventInfo);
            });
        }
    });
}

export function migrate(callback) {
    PFMigrate.migrateSpellRanges(callback);
}

export function recalculate(callback, silently, oldversion) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var recalcTotals = _.once(function() {
        resetSpellsPrepared();
        resetSpellsTotals(null, null, null, silently);
        resetCommandMacro();
        PFSpellOptions.resetOptions();
        done();
    });
    var callUpdateSpells = _.once(function() {
        getAttrs(["use_spells"], function(v) {
            if (parseInt(v.use_spells, 10)) {
                updateSpells(recalcTotals, silently);
            }
            else {
                done();
            }
        });
    });
    migrate(callUpdateSpells);
}

var events = {
    // events for spell repeating rows
    repeatingSpellUpdatesPlayer:
        ["DC_misc", "Concentration_misc", "range", "range_pick", "CL_misc", "SP_misc", "spellclass_number", "spell_level"],
    repeatingSpellEventsPlayer: {
        "change:repeating_spells:compendium_category": [importFromCompendium],
        "change:repeating_spells:used": [updateSpellsPerDay, updatePreparedSpellState, resetCommandMacro],
        "change:repeating_spells:metamagic": [toggleMetaMagic],
        "change:repeating_spells:name": [updateSpell]
    },
    repeatingSpellMenuUpdatePlayer:
        ["name", "spellclass_number", "spell_level", "slot", "used", "school", "metamagic", "isDomain", "isMythic"],
    repeatingSpellAttackEventsPlayer: ["range_pick", "range", "damage-macro-text", "damage-type", "save", "spell-attack-type", "name"],
    repeatingSpellAttackEventsAuto: ["range_numeric", "sr", "savedc"]
};
function registerEventHandlers() {
    var tempstr = "";
    tempstr = _.reduce(events.repeatingSpellUpdatesPlayer, function(memo, attr) {
        memo += "change:repeating_spells:" + attr + " ";
        return memo;
    }, "");
    on(tempstr, TAS.callback(function playerUpdateSpell(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" ) {
            updateSpell(null, eventInfo);
        }
    }));
    _.each(events.repeatingSpellEventsPlayer, function(functions, eventToWatch) {
        _.each(functions, function(methodToCall) {
            on(eventToWatch, TAS.callback(function eventRepeatingSpellsPlayer(eventInfo) {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                    methodToCall(null, eventInfo);
                }
            }));
        });
    });
    on("remove:repeating_spells", TAS.callback(function eventUpdateRemoveSpell(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            PFAttacks.removeLinkedAttack(null, PFAttacks.linkedAttackType.spell, SWUtils.getRowId(eventInfo.sourceAttribute));
            resetCommandMacro();
            resetSpellsTotals();
        }
    }));

    on("change:spellmenu_groupby_school change:spellmenu_show_uses change:spellclass-0-hide_unprepared change:spellclass-1-hide_unprepared change:spellclass-2-hide_unprepared change:spellclass-0-show_domain_spells change:spellclass-1-show_domain_spells change:spellclass-2-show_domain_spells", TAS.callback(function eventOptionChange(eventInfo) {
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            resetCommandMacro();
        }
    }));
    tempstr = _.reduce(events.repeatingSpellMenuUpdatePlayer, function(memo, attr) {
        memo += "change:repeating_spells:" + attr + " ";
        return memo;
    }, "");
    on(tempstr, TAS.callback(function eventRepeatingSpellMenuUpdate(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" ) {
            updateSpell(null, eventInfo);
        }
    }));
    on("change:_reporder_repeating_spells", TAS.callback(function eventReorderRepeatingspells(eventInfo) {
        if (eventInfo.sourceType === "player" ) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            resetCommandMacro();
        }
    }));
    on("change:repeating_spells:spellclass_number change:repeating_spells:spell_level", TAS.callback(function eventRepeatingSpellsTotals(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            resetSpellsTotals();
        }
    }));
    on("change:repeating_spells:create-attack-entry", TAS.callback(function eventcreateAttackEntryFromSpell(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            createAttackEntryFromRow(null, null, false, eventInfo);
        }
    }));
    tempstr = _.reduce(events.repeatingSpellAttackEventsPlayer, function(memo, attr) {
        memo += "change:repeating_spells:" + attr + " ";
        return memo;
    }, "");
    on(tempstr, TAS.callback(function eventupdateAssociatedSpellAttack(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
        SWUtils.getAttributeName(eventInfo.sourceAttribute);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" ) {
            updateAssociatedAttack(null, null, null, eventInfo);
        }
    }));
    tempstr = _.reduce(events.repeatingSpellAttackEventsAuto, function(memo, attr) {
        memo += "change:repeating_spells:" + attr + " ";
        return memo;
    }, "");
    on(tempstr, TAS.callback(function eventupdateAssociatedSpellAttack(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
        SWUtils.getAttributeName(eventInfo.sourceAttribute);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
            updateAssociatedAttack(null, null, null, eventInfo);
        }
    }));
}
registerEventHandlers();
