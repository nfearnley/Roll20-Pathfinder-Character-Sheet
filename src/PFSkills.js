import _ from "underscore";
import TAS from "exports-loader?TAS!TheAaronSheet";
import PFConst from "./PFConst";
import * as SWUtils from "./SWUtils";
import * as PFMigrate from "./PFMigrate";

var regularCoreSkills = ["Appraise", "Acrobatics", "Bluff", "Climb", "Diplomacy", "Disable-Device", "Disguise", "Escape-Artist", "Fly", "Handle-Animal", "Heal", "Intimidate", "Linguistics", "Perception", "Ride", "Sense-Motive", "Sleight-of-Hand", "Spellcraft", "Stealth", "Survival", "Swim", "Use-Magic-Device"];
var regularBackgroundSkills = ["Appraise", "Handle-Animal", "Linguistics", "Sleight-of-Hand"];
var regularAdventureSkills = ["Acrobatics", "Bluff", "Climb", "Diplomacy", "Disable-Device", "Disguise", "Escape-Artist", "Fly", "Heal", "Intimidate", "Perception", "Ride", "Sense-Motive", "Spellcraft", "Stealth", "Survival", "Swim", "Use-Magic-Device"];
var regularBackgroundSkillsPlusKnow = regularBackgroundSkills.concat(["Knowledge-Engineering", "Knowledge-Geography", "Knowledge-History", "Knowledge-Nobility"]).sort();
var regularAdventurePlusKnow = regularAdventureSkills.concat(["Knowledge-Arcana", "Knowledge-Dungeoneering", "Knowledge-Local", "Knowledge-Nature", "Knowledge-Planes", "Knowledge-Religion"]).sort();
// number that is appended to 10 versions of skills with subskills.
var skillAppendNums = ["", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
// same but for misc-skill
var miscSkillAppendNums = ["-0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9"];
export var coreSkillsWithFillInNames = ["Craft", "Misc-Skill", "Perform", "Profession"];
var backgroundOnlySkillsWithFillinNames = ["Artistry", "Lore"];
var skillsWithFillInNames = coreSkillsWithFillInNames.concat(backgroundOnlySkillsWithFillinNames).concat(["CS-Misc-Skill"]).sort();
var backgroundOnlySkills = SWUtils.cartesianAppend(backgroundOnlySkillsWithFillinNames, skillAppendNums);
var knowledgeSubSkills = ["Arcana", "Dungeoneering", "Engineering", "Geography", "History", "Local", "Nature", "Nobility", "Planes", "Religion"];
var coreSkillsWithSubSkills = coreSkillsWithFillInNames.concat(["Knowledge"]).sort();
export var skillsWithSubSkills = skillsWithFillInNames.concat(["Knowledge"]).sort();
var knowledgeSkillAppends = _.map(knowledgeSubSkills, function(subskill) {
    return "-" + subskill;
});
// for each skill array of the possible skills {"Craft":["Craft","Craft2"...],"Perform":["Perform","Perform2"...] }
var subskillArrays = _.reduce(skillsWithSubSkills, function(memo, skill) {
    memo[skill] = SWUtils.cartesianAppend([skill], skillAppendNums);
    return memo;
}, {});
var backgroundCoreSkills = regularBackgroundSkillsPlusKnow.concat(subskillArrays.Craft).concat(subskillArrays.Perform).concat(subskillArrays.Profession).concat(["Misc-Skill-5", "Misc-Skill-6", "Misc-Skill-7", "Misc-Skill-8", "Misc-Skill-9"]).sort();
var adventureSkills = regularAdventurePlusKnow.concat(["Misc-Skill-0", "Misc-Skill-1", "Misc-Skill-2", "Misc-Skill-3", "Misc-Skill-4"]).sort();
var checkRTArray = ["-ReqTrain", "-ranks"];
var baseGenMacro = "&{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{font=@{apply_specfont_chat}@{use_specfont}}} {{scroll_desc=@{scroll-desc}}} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} ";
var skillHeaderMacro = "{{name=^{REPLACELOWER} ^{skills} }} ";
var npcSkillHeaderMacro = "{{name=^{npc} ^{REPLACELOWER} ^{skills} }} ";
//  1 is the normal size modifier in size_skill, 2 is size_skill_double
var sizeSkills = {
    "Fly": 1,
    "Stealth": 2,
    "CS-Stealth": 2
};
// these are for building the macros
var knowledgeSubSkillsTranslateKeys = _.map(knowledgeSubSkills, function(key) {
    return key.toLowerCase();
});
export var knowledgeSkills = _.map(knowledgeSubSkills, function(subskill) {
    return "Knowledge-" + subskill;
});
export var allCoreSkills = adventureSkills.concat(backgroundCoreSkills).sort();
var consolidatedSkills = ["CS-Acrobatics", "CS-Athletics", "CS-Finesse", "CS-Influence", "CS-Nature", "CS-Perception", "CS-Performance", "CS-Religion", "CS-Society", "CS-Spellcraft", "CS-Stealth", "CS-Survival"];
var consolidatedMiscSkills = ["CS-Misc-Skill-0", "CS-Misc-Skill-1", "CS-Misc-Skill-2", "CS-Misc-Skill-3", "CS-Misc-Skill-4", "CS-Misc-Skill-5", "CS-Misc-Skill-6", "CS-Misc-Skill-7", "CS-Misc-Skill-8", "CS-Misc-Skill-9"];
var allNonFillInSkills = regularCoreSkills.concat(knowledgeSkills).concat(consolidatedSkills).sort();
var nonMiscFillInSkillsInstances = SWUtils.cartesianAppend(["Craft", "Perform", "Profession", "Artistry", "Lore"], skillAppendNums);
var miscFillInSkillsInstances = SWUtils.cartesianAppend(["Misc-Skill"], miscSkillAppendNums).concat(consolidatedMiscSkills);
export var allFillInSkillInstances = nonMiscFillInSkillsInstances.concat(miscFillInSkillsInstances).sort();
export var allTheSkills = allNonFillInSkills.concat(allFillInSkillInstances).sort();
var globalSkillModAttrs = ["enforce_requires_training", "size_skill", "size_skill_double", "acp", "Phys-skills-cond",
    "Perception-cond", "STR-mod", "DEX-mod", "CON-mod", "INT-mod", "WIS-mod", "CHA-mod",
    "buff_STR_skills-total", "buff_DEX_skills-total", "buff_CON_skills-total",
    "buff_INT_skills-total", "buff_WIS_skills-total", "buff_CHA_skills-total",
    "checks-cond", "buff_Check-total", "buff_check_skills-total"];
var skillNameAppends = ["", "-cs", "-ranks", "-ability", "-racial", "-trait", "-feat", "-item", "-misc-mod", "-ReqTrain", "-ut"];
// ability based skill buffs events located in PFBuffs
var events = {
    skillGlobalPhysEventAuto: "change:phys-skills-cond change:acp",
    skillEventsAuto: "change:REPLACE-misc-mod",
    skillEventsPlayer: "change:REPLACE-ability change:REPLACE-ranks change:REPLACE-racial change:REPLACE-trait change:REPLACE-feat change:REPLACE-item change:REPLACE-ReqTrain"
};

/**appendToSubSkills - util to append the string to all 10 names of one type of skill (perform, craft, knowledge, etc)
 * adds the numbers from 0-9 or 1-10 or knowledge, then appends the string , to generate all 10 versions.
 * @param {string} skilllist The name of the skill in, member of skillsWithSubSkills
 * @param {string} appendToEnd The string to append.
 * @returns {Array[string]} array of skill names
 */
function appendToSubSkills(skilllist, appendToEnd) {
    return _.reduce(skilllist, function(memo, skill) {
        var appendnums = skill === "Misc-Skill" ? miscSkillAppendNums : skill === "CS-Misc-Skill" ? miscSkillAppendNums : skill === "Knowledge" ? knowledgeSkillAppends : skillAppendNums;
        var appendArray = SWUtils.cartesianAppend([skill], appendnums, appendToEnd);
        return memo.concat(appendArray);
    }, []);
}
/**
 * updateMaxSkills Calculates and sets maximum skill ranks. Minimum 1 per level.
 * divides by 2 if using consolidated skills
 * @param {event} eventInfo - from event
 * @callback {function} - callback when done
 */
function updateMaxSkills(eventInfo, callback) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var fields = ["total-skill", "total-fcskill", "INT-mod", "level", "Max-Skill-Ranks-mod", "Max-Skill-Ranks",
        "unchained_skills-show", "BG-Skill-Use", "npc-skill", "npc-hd-num",
        "class-0-skill", "class-1-skill", "class-2-skill", "class-3-skill", "class-4-skill", "class-5-skill",
        "class-0-level", "class-1-level", "class-2-level", "class-3-level", "class-4-level", "class-5-level"
    ];
    getAttrs(fields, function(v) {
        var intMod = parseInt(v["INT-mod"], 10) || 0;
        var level = parseInt(v.level, 10) || 0;
        var fcSkills = parseInt(v["total-fcskill"], 10) || 0;
        var extra = parseInt(v["Max-Skill-Ranks-mod"], 10) || 0;
        var currSkills = parseInt(v["Max-Skill-Ranks"], 10) || 0;
        var i = 0;
        var thislvl = 0;
        var classPlusInt = 0;
        var thisSkill = 0;
        var totAllSkills = 0;
        var isConsolidated = 0;
        var setter = {};
        try {
            if (parseInt(v["unchained_skills-show"], 10) === 1) {
                if ((parseInt(v["BG-Skill-Use"], 10) || 0) === 0) {
                    isConsolidated = 1;
                }
            }
            for (i = 0; i < 6; i++) {
                thislvl = parseInt(v["class-" + i + "-level"], 10) || 0;
                if (thislvl > 0) {
                    thisSkill = ( (parseInt(v["class-" + i + "-skill"], 10) || 0) * thislvl ) + (intMod * thislvl);
                    if (thisSkill < thislvl) {
                        thisSkill = thislvl;
                    }
                    classPlusInt += thisSkill;
                }
            }
            thislvl = parseInt(v["npc-hd-num"], 10) || 0;
            thisSkill = parseInt(v["npc-skill"], 10) || 0;
            if (thislvl && thisSkill) {
                thisSkill = thislvl * thisSkill + intMod * thislvl;
                if (thisSkill < thislvl) {
                    thisSkill = thislvl;
                }
                classPlusInt += thisSkill;
            }
            if (isConsolidated) {
                classPlusInt = Math.floor(classPlusInt / 2);
            }
            totAllSkills = classPlusInt + extra;
            if (totAllSkills < level) {
                totAllSkills = level;
            }
            totAllSkills += fcSkills;
            if (currSkills !== totAllSkills) {
                setter["Max-Skill-Ranks"] = totAllSkills;
            }
        }
        catch(err) {
            TAS.error("PFSkills.updateMaxSkills", err);
        }
        finally {
            if (_.size(setter) > 0) {
                SWUtils.setWrapper(setter, {
                    silent: true
                }, done);
            }
            else {
                done();
            }
        }
    });
}
/**
 * verifyHasSkill - Checks to see if skill is in list of valid skills for this character (consolidated, background, core).
 * @param {string} skill = the skill name
 * @param {function} callback = a function that takes a a boolean as a first parameter.
 *   called with true if skill is part of valid list, or false if not.
 */
export function verifyHasSkill(skill, callback) {
    var first3 = "";
    var first4 = "";
    var core = false;
    var bg = false;
    var isSub = false;
    var fields = ["BG-Skill-Use", "unchained_skills-show"];
    try {
        if (skill && typeof callback === "function") {
            first4 = skill.slice(0, 4).toLowerCase();
            first3 = first4.slice(0, 3);
            if (first3 === "cs-") {
                // do nothing
            }
            else if (first4 === "arti" || first4 === "lore") {
                bg = true;
            }
            else {
                core = true;
            }
            if (_.contains(allFillInSkillInstances, skill)) {
                isSub = true;
                fields = fields.concat([skill + "-name", skill + "-ranks"]);
            }
            getAttrs(fields, function(v) {
                var retval = false;
                var usesBG = parseInt(v["BG-Skill-Use"], 10) || 0;
                var usesUnchained = parseInt(v["unchained_skills-show"], 10) || 0;
                if (!isSub || v[skill + "-name"] || (parseInt(v[skill + "-ranks"], 10) || 0) > 0) {
                    if (core) {
                        if (!usesUnchained || usesBG) {
                            retval = true;
                        }
                    }
                    else if (bg) {
                        if (usesUnchained && usesBG) {
                            retval = true;
                        }
                    }
                    else {
                        if (usesUnchained && !usesBG) {
                            retval = true;
                        }
                    }
                }
                callback(retval);
            });
        }
    }
    catch(err) {
        TAS.error("PFSkills.verifyHasSkill", err);
        callback(false);
    }
}
/**
 * synchronously calculates new value for skill and returns values for setAttrs
 * @param {string} skill name of skill to update
 * @param {Map<string,string>} v attributes and values from sheet
 * @param {Map<string,Number>} setter optional, map to send to setAttrs so far
 * @returns {Map<string,Number>} setter with additional values, or new map, for setAttrs
 */
function setSkillVal(skill, v, setter) {
    var skillSize = 0;
    var csNm = skill + "-cs";
    var ranksNm = skill + "-ranks";
    var abNm = skill + "-ability";
    var racialNm = skill + "-racial";
    var traitNm = skill + "-trait";
    var featNm = skill + "-feat";
    var itemNm = skill + "-item";
    var miscNm = skill + "-misc-mod";
    var utNm = skill + "-ut";
    var rtNm = skill + "-ReqTrain";
    var adj;
    var skillTot = 0;
    var cond = 0;
    var cs = parseInt(v[csNm], 10) || 0;
    var currSkill = parseInt(v[skill], 10); // no default
    var ranks = parseInt(v[ranksNm], 10) || 0;
    var rt = parseInt(v[rtNm], 10) || 0;
    var allCond = 0;
    var buffs = 0;
    var abilityModName = "";
    var abilityName = "";
    var physCond = 0;
    var perCond = 0;
    var globalBuffCond = 0;

    try {
        setter = setter || {};
        abilityModName = v[abNm];

        if (rt && ranks === 0) {
            if (v[utNm] !== "{{untrained=1}}") {
                setter[utNm] = "{{untrained=1}}";
            }
        }
        else if (v[utNm] !== "{{untrained=}}") {
            setter[utNm] = "{{untrained=}}"; // cannot set to "" because then it chooses the default which is "{{untrained=1}}"
        }
        if (ranks && cs) {
            skillTot += 3;
        }
        if (abilityModName === "DEX-mod" || abilityModName === "STR-mod") {
            adj = parseInt(v.acp, 10) || 0;
            skillTot += adj;
            physCond = parseInt(v["Phys-skills-cond"], 10) || 0;
        }
        if (abilityModName) {
            abilityName = abilityModName.slice(0, 3).toUpperCase();
            buffs += parseInt(v["buff_" + abilityName + "_skills-total"], 10) || 0;
        }

        if (skill === "Stealth" || skill === "CS-Stealth") {
            skillSize = 2;
        }
        else if (skill === "Fly") {
            skillSize = 1;
        }
        else {
            skillSize = 0;
        }
        if (skillSize) {
            if (skillSize === 1) {
                adj = parseInt(v.size_skill, 10) || 0;
                skillTot += adj;
            }
            else if (skillSize === 2) {
                adj = parseInt(v.size_skill_double, 10) || 0;
                skillTot += adj;
            }
        }

        if (skill === "Perception" || skill === "CS-Perception") {
            perCond = parseInt(v["Perception-cond"], 10) || 0;
        }
        globalBuffCond = (parseInt(v["checks-cond"], 10) || 0) + (parseInt(v["buff_Check-total"], 10) || 0) +
            (parseInt(v["buff_check_skills-total"], 10) || 0);
        cond = allCond + physCond + perCond + globalBuffCond;
        skillTot += ranks + cond + buffs + (parseInt(v[abilityModName], 10) || 0) + (parseInt(v[racialNm], 10) || 0) + (parseInt(v[traitNm], 10) || 0) + (parseInt(v[featNm], 10) || 0) + (parseInt(v[itemNm], 10) || 0) + (parseInt(v[miscNm], 10) || 0);
        if (currSkill !== skillTot) {
            setter[skill] = skillTot;
        }
    }
    catch(erskill) {
        TAS.error("PFSkills.setNewSkillVal", erskill);
    }
    return setter;
}
/**
 * updates one  skill row reading all values on row
 * @param {string} skill to update, must have same capitalization as on HTML
 * @param {function} callback = callback after done with params newvalue, oldvalue.
 * @param {boolean} silently = whether to update silently or not. ignored, always silent.
 */
export function updateSkillAsync(skill, callback, silently) {
    function done(newVal, oldVal) {
        if (typeof callback === "function") {
            callback(newVal, oldVal);
        }
    }
    var fields = skillNameAppends.map(function(append) {
        return skill + append;
    });
    fields = fields.concat(globalSkillModAttrs);
    getAttrs(fields, function(v) {
        var setter = {};
        var currSkill = 0;
        try {
            currSkill = parseInt(v[skill], 10);
            setter = setSkillVal(skill, v, setter);
        }
        catch(err) {
            TAS.error(err);
        }
        finally {
            if (_.size(setter) > 0) {
                SWUtils.setWrapper(setter, PFConst.silentParams, function() {
                    done(setter[skill], currSkill);
                });
            }
            else {
                done(currSkill, currSkill);
            }
        }
    });
}

/**
 * when user checks class skill, +3 or -3 depending on if ranks > 0, if ranks 0 no change
 * @param {string} skill - from allTheSkills
 */
function updateSkillByClassChkAsync(skill) {
    getAttrs([skill, skill + "-ranks", skill + "-cs"], function(v) {
        var tot = 0;
        var cs = 0;
        var ranks = 0;
        var newtot = 0;
        var setter = {};
        tot = parseInt(v[skill], 10) || 0;
        cs = parseInt(v[skill + "-cs"], 10) || 0;
        ranks = parseInt(v[skill + "-ranks"], 10) || 0;
        if (ranks) {
            if (cs) {
                newtot = tot + 3;
            }
            else {
                newtot = tot - 3;
            }
            setter[skill] = newtot;
            SWUtils.setWrapper(setter);
        }
    });
}
function recalculateSkillArrayMiscFields(skills, callback) {
    var doneOneMisc = _.after(_.size(skills), callback);
    _.each(skills, function(skill) {
        SWUtils.evaluateAndSetNumber(skill + "-misc", skill + "-misc-mod", 0, function() {
            doneOneMisc();
        }, true);
    });
}
/**
 * Recalcs the array of skills but does NOT recalc the misc macro fields
 *
 * @param {*} skills
 * @param {*} callback
 * @param {*} silently
 */
function recalcSkillTotals(skills, callback, silently) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var fields;
    fields = globalSkillModAttrs;
    _.each(skills, function(skill) {
        var subfields = skillNameAppends.map(function(append) {
            return skill + append;
        });
        fields = fields.concat(subfields);
    });
    getAttrs(fields, function(v) {
        var setter = {};
        setter = _.reduce(skills, function(m, skill) {
            try {
                setSkillVal(skill, v, m);
            }
            catch(e) {
                // do nothing
            }
            return m;
        }, {});
        if (_.size(setter)) {
            SWUtils.setWrapper(setter, PFConst.silentParams, done);
        }
        else {
            done();
        }
    });
}
/**
 * recalcSkillArray recalculates skill misc macro fields then totals.
 * @param {Array} skills array of skills to update.
 * @param {function} callback when done
 * @param {boolean} silently whether to call SWUtils.setWrapper of skill total with silent or not.
 */
function recalcSkillArray(skills, callback, silently) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });

    function doneMisc() {
        recalcSkillTotals(skills, done, silently);
    }
    recalculateSkillArrayMiscFields(skills, doneMisc);

}

export function recalculateSkills(callback, silently, onlySkills) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    getAttrs(["unchained_skills-show", "BG-Skill-Use"], function(v) {
        try {
            if (parseInt(v["unchained_skills-show"], 10)) {
                if (parseInt(v["BG-Skill-Use"], 10)) {
                    if (onlySkills) {
                        recalcSkillTotals(backgroundOnlySkills, null, silently);
                        recalcSkillTotals(allCoreSkills, done, silently);
                    }
                    else {

                        recalcSkillArray(backgroundOnlySkills, null, silently);
                        // return after long one
                        recalcSkillArray(allCoreSkills, done, silently);
                    }
                }
                else {
                    if (onlySkills) {
                        recalcSkillTotals(consolidatedSkills, done, silently);
                        recalcSkillTotals(consolidatedMiscSkills, null, silently);
                    }
                    else {

                        recalcSkillArray(consolidatedSkills, done, silently);
                        recalcSkillArray(consolidatedMiscSkills, null, silently);
                    }
                }
            }
            else {
                if (onlySkills) {
                    recalcSkillTotals(allCoreSkills, done, silently);
                }
                else {

                    recalcSkillArray(allCoreSkills, done, silently);
                }
            }
        }
        catch(err) {
            TAS.error("PFSKills.recalculate", err);
            done();
        }
    });
}

export function updateAllSkillsDiff(newmod, oldmod) {
    TAS.notice("PFSkills updateallskills diff updating by " + newmod + ", from " + oldmod);
    getAttrs(allTheSkills, function(v) {
        var diff = newmod - oldmod;
        var setter = {};
        setter = _.mapObject(v, function(val, key) {
            return (parseInt(val, 10) || 0) + diff;
        });
        TAS.debug("SPSkills.updateAllSkillsDiff setting", setter);
        SWUtils.setWrapper(setter, PFConst.silentParams);
    });
}

export function recalculateAbilityBasedSkills(abilityBuff, eventInfo, callback, silently) {
    function done() {
        if (typeof callback === "function") {
            callback();
        }
    }
    var updatedAttr;
    var tempstr = "";
    var matches;
    var fields;
    if (abilityBuff) {
        tempstr = abilityBuff;
    }
    else if (eventInfo) {
        tempstr = eventInfo.sourceAttribute;
        if (tempstr.indexOf("repeating_") >= 0) {
            tempstr = SWUtils.getAttributeName(tempstr);
        }
    }

    if (tempstr) {
        if (tempstr === "physical" || tempstr === "acp") {
            updatedAttr = /STR-mod|DEX-mod/;
        }
        else {
            matches = tempstr.match(/str|dex|con|int|wis|cha/i);
            if (matches) {

                updatedAttr = new RegExp(matches[0].toUpperCase() + "-mod");
            }
        }

    }
    if (!updatedAttr) {
        done();
        return;
    }
    fields = allTheSkills.map(function(skill) {
        return skill + "-ability";
    });

    getAttrs(fields, function(v) {
        var skillArray = [];

        skillArray = _.reduce(v, function(m, val, field) {
            if (updatedAttr.test(val)) {

                m.push(field.slice(0, -8));
            }
            return m;
        }, []);
        TAS.notice("PFSkills updateAbilityBasedSkills getting array:", skillArray);
        if (_.size(skillArray)) {
            recalcSkillTotals(skillArray, done, silently);
        }
        else {
            done();
        }
    });
}
/**
 * updates the macros for only the 7 subskill rolltemplates
 * @param {boolean} background -if background skills turned on
 * @param {boolean} rt - if Enforce Requires Training checked
 * @param {event} eventInfo ?
 * @param {jsobject_map} currMacros map of parent skill button name to command macro. (knowledge, Perform, etc)
 * @param {boolean} isNPC - if sheet is NPC
 * @param {boolean} showBonus - if skill total should be displayed on button.
 */
function updateSubSkillMacroBook(background, rt, eventInfo, currMacros, isNPC, showBonus) {
    var headerString = isNPC ? npcSkillHeaderMacro : skillHeaderMacro;
    var skillPrefix = isNPC ? "NPC-" : "";
    function assembleSubSkillButtonArray(skill, shouldEnforce, v) {
        var appendnums = skill === "Misc-Skill" ? miscSkillAppendNums : skill === "CS-Misc-Skill" ? miscSkillAppendNums : skill === "Knowledge" ? knowledgeSkillAppends : skillAppendNums;
        var subskills = SWUtils.cartesianAppend([skill], appendnums);
        var firstPass = [];
        if (skill === "Knowledge") {
            firstPass = subskills;
            return firstPass; // knowledge rollable even if untrained
        }
        firstPass = _.filter(subskills, function(subskill) {
            if (v[subskill + "-name"]) {
                return true;
            }
            return false;
        });
        if (!shouldEnforce) {
            return firstPass;
        }
        return _.filter(firstPass, function(skill) {
            if ((parseInt(v[skill + "-ReqTrain"], 10) || 0) === 0 || (parseInt(v[skill + "-ranks"], 10) || 0) > 0) {
                return true;
            }
            return false;
        });
    }
    function getKnowledgeButtonMacro(showBonus) {
        var bonusStr = showBonus ? "+ @{REPLACE}" : "";
        var knowledgebutton = "[^{REPLACENAME}" + bonusStr + "](~@{character_id}|" + skillPrefix + "REPLACE-check) ";
        return headerString.replace("REPLACELOWER", "knowledge") + "{{ " + _.reduce(knowledgeSubSkillsTranslateKeys, function(memo, subskill, idx) {
            memo += knowledgebutton.replace(/REPLACENAME/g, subskill).replace(/REPLACE/g, knowledgeSkills[idx]);
            return memo;
        }, "") + " }}";
    }
    function getSubSkillButtonMacro(skill, skillArray, showBonus, v) {
        var skillTransKey = skill.toLowerCase();
        var bonusStr = showBonus ? "+ @{REPLACE}" : "";
        var baseMacro = headerString.replace("REPLACELOWER", skillTransKey);
        var singleRowButton = "[REPLACENAME" + bonusStr + "](~@{character_id}|" + skillPrefix + "REPLACE-check) ";
        var tempstr = "";
        if (skill === "Knowledge") {
            return getKnowledgeButtonMacro();
        }
        tempstr = _.reduce(skillArray, function(memo, subskill, idx) {
            var buttonName = v[subskill + "-name"];
            if (buttonName) {
                buttonName = SWUtils.escapeForChatLinkButton(buttonName);
                buttonName = SWUtils.escapeForRollTemplate(buttonName);
            }
            else {
                buttonName = "@{" + subskill + "-name}";
            }
            memo += singleRowButton.replace(/REPLACENAME/g, buttonName).replace(/REPLACE/g, subskill);
            return memo;
        }, "");
        if (!tempstr) {
            tempstr = "description = ^{no-skills-available}";
        }
        return baseMacro + "{{ " + tempstr + " }}";
    }
    var subskillParents = background ? skillsWithFillInNames : coreSkillsWithFillInNames;
    var allsubskillFields = appendToSubSkills(subskillParents, ["-name"]);
    if (rt) {
        allsubskillFields = allsubskillFields.concat(appendToSubSkills(subskillParents, checkRTArray));
        allsubskillFields = allsubskillFields.sort();
    }

    getAttrs(allsubskillFields, function(v) {
        var setter = {};
        var tempKMac = "";

        _.each(subskillParents, function(skill) {
            var canshowarray = assembleSubSkillButtonArray(skill, rt, v);
            var tempMacro = getSubSkillButtonMacro(skill, canshowarray, showBonus, v);
            tempMacro = baseGenMacro + tempMacro;
            if (currMacros[skillPrefix + skill.toLowerCase() + "_skills-macro"] !== tempMacro) {
                setter[skillPrefix + skill.toLowerCase() + "_skills-macro"] = tempMacro;
            }
        });
        if (currMacros[skillPrefix + "knowledge_skills-macro"]) {
            tempKMac = baseGenMacro + getKnowledgeButtonMacro(showBonus);
            if (currMacros[skillPrefix + "knowledge_skills-macro"] !== tempKMac) {
                setter[skillPrefix + "knowledge_skills-macro"] = tempKMac;
            }
        }
        if (_.size(setter) > 0) {
            SWUtils.setWrapper(setter, PFConst.silentParams);
        }
    });
}
function assembleSkillButtonArray(skills, shouldEnforce, sv) {
    if (!shouldEnforce) {
        return skills;
    }
    return _.filter(skills, function(skill) {
        if (/^Knowled|^Linguis|^Sleight/i.test(skill.slice(0, 7)) || (parseInt(sv[skill + "-ReqTrain"], 10) || 0) !== 1 || (parseInt(sv[skill + "-ranks"], 10) || 0) > 0) {
            return true;
        }
        return false;
    });
}
function getSkillButtonMacro(name, skillArray, showBonus, isNPC) {
    var skillTransKey = name.toLowerCase();
    var skillPrefix = isNPC ? "NPC-" : "";
    var bonusStr = showBonus ? " + @{REPLACE}" : "";
    var baseMacro = "{{name= ^{" + skillTransKey + "} }} ";
    var npcBaseMacro = "{{name= ^{npc} ^{" + skillTransKey + "} }} ";
    var rowbutton = "[^{REPLACELOWER}" + bonusStr + "](~@{character_id}|" + skillPrefix + "REPLACE-check) ";
    var subskillbutton = "[^{REPLACELOWER}](~@{character_id}|" + skillPrefix + "REPLACELOWERMAC_skills_buttons_macro) ";
    var baseToSend = isNPC ? npcBaseMacro : baseMacro;
    var tempstr = "";
    try {
        tempstr = _.reduce(skillArray, function(memo, skill, idx) {
            var thistranskey = skill.toLowerCase();
            var thisbutton = _.contains(skillsWithSubSkills, skill) ? subskillbutton : rowbutton;
            thisbutton = thisbutton.replace(/REPLACELOWERMAC/g, thistranskey);
            thisbutton = thisbutton.replace(/REPLACELOWER/g, thistranskey);
            thisbutton = thisbutton.replace(/REPLACE/g, skill);
            memo += thisbutton + " ";
            return memo;
        }, "");
        if (!tempstr) {
            tempstr = "^{no-skills-available} ";
        }
    }
    catch(err) {
        // do nothing
    }
    return baseToSend + "{{ " + tempstr + "}}";
}
function resetOneCommandMacro(callback, eventInfo, isNPC, showBonus, unchained, background, consolidated, rt) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var skillPrefix = isNPC ? "NPC-" : "";
    getAttrs([skillPrefix + "skills-macro", skillPrefix + "background_skills-macro", skillPrefix + "adventure_skills-macro",
        skillPrefix + "artistry_skills-macro", skillPrefix + "lore_skills-macro", skillPrefix + "craft_skills-macro", skillPrefix + "knowledge_skills-macro",
        skillPrefix + "perform_skills-macro", skillPrefix + "profession_skills-macro", skillPrefix + "misc-skill_skills-macro",
        skillPrefix + "CS-misc-skill_skills-macro"], function(v) {
        var setter = {};
        var tempSkillArray = [];
        if (!consolidated) {
            updateSubSkillMacroBook(background, rt, eventInfo, v, isNPC, showBonus);
            getAttrs(SWUtils.cartesianAppend(regularCoreSkills, checkRTArray), function(v) {
                var canshowarray = [];
                var tempRTMacro = "";
                var temparray = [];
                try {
                    if (background) {
                        canshowarray = assembleSkillButtonArray(regularBackgroundSkills, rt, v) || [];
                        temparray = temparray.concat(canshowarray);
                        canshowarray = canshowarray.concat(skillsWithSubSkills).sort();
                        tempRTMacro = baseGenMacro + getSkillButtonMacro("background-skills", canshowarray, showBonus, isNPC);
                        if (v[skillPrefix + "background_skills-macro"] !== tempRTMacro) {
                            setter[skillPrefix + "background_skills-macro"] = tempRTMacro;
                        }
                        canshowarray = assembleSkillButtonArray(regularAdventureSkills, rt, v) || [];
                        temparray = temparray.concat(canshowarray);
                        canshowarray = canshowarray.concat(["Knowledge", "Misc-Skill"]).sort();
                        tempRTMacro = baseGenMacro + getSkillButtonMacro("adventure-skills", canshowarray, showBonus, isNPC);
                        if (v[skillPrefix + "adventure_skills-macro"] !== tempRTMacro) {
                            setter[skillPrefix + "adventure_skills-macro"] = tempRTMacro;
                        }
                        temparray = temparray.concat(skillsWithSubSkills).sort();
                    }
                    else {
                        canshowarray = assembleSkillButtonArray(regularCoreSkills, rt, v) || [];
                        temparray = temparray.concat(canshowarray).concat(coreSkillsWithSubSkills).sort();
                    }
                    tempRTMacro = baseGenMacro + getSkillButtonMacro("skills", temparray, showBonus, isNPC);
                    if (v[skillPrefix + "skills-macro"] !== tempRTMacro) {
                        setter[skillPrefix + "skills-macro"] = tempRTMacro;
                    }
                }
                catch(errRT) {
                    TAS.error("PFSkills.resetOneCommandMacro errRT", errRT);
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
        else {
            // consolidated
            tempSkillArray = consolidatedSkills;
            getAttrs(SWUtils.cartesianAppend(tempSkillArray, ["-ReqTrain", "-ranks"]), function(sv) {
                var canshowarray;
                var setter = {};
                var tempMacro;
                canshowarray = assembleSkillButtonArray(tempSkillArray, rt, sv);
                canshowarray.push("CS-Misc-Skill");
                tempMacro = getSkillButtonMacro("skills", canshowarray, showBonus);
                setter[skillPrefix + "consolidated_skills-macro"] = baseGenMacro + tempMacro;
                SWUtils.setWrapper(setter, PFConst.silentParams, done);
            });

        }
    });
}
export function resetCommandMacro(eventInfo, callback) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    getAttrs(["BG-Skill-Use", "unchained_skills-show", "enforce_requires_training", "is_npc", "include_skill_totals"], function(vout) {
        var isNPC = parseInt(vout.is_npc, 10) || 0;
        var showBonus = parseInt(vout.include_skill_totals, 10) || 0;
        var unchained = parseInt(vout["unchained_skills-show"], 10) || 0;
        var background = unchained && (parseInt(vout["BG-Skill-Use"], 10) || 0);
        var consolidated = unchained && !background;
        var rt = parseInt(vout.enforce_requires_training, 10) || 0;
        resetOneCommandMacro(done, eventInfo, isNPC, showBonus, unchained, background, consolidated, rt);
        if (isNPC) {
            resetOneCommandMacro(done, eventInfo, false, showBonus, unchained, background, consolidated, rt);
        }
    });
}

/**
 * migrate skills
 * @param {function} callback callback when done
 * @param {number} oldversion old version , -1 if hit recalc
 */
export function migrate(callback, oldversion) {
    var done = _.once(function() {
        if (typeof callback === "function") {
            callback();
        }
    });
    var doneOne = _.after(4, done);
    /**
 * migrateOldClassSkillValue - converts class skill checkboxes from old autocalc string to number "" or 3.
     * @param {function} callback when done
     * @param {number} oldversion currversionnumber
     */
    function migrateOldClassSkillValue(callback, oldversion) {
        var done = _.once(function() {
            if (typeof callback === "function") {
                callback();
            }
        });
        function migrateClassSkill(skill) {
            var csNm = skill + "-cs";
            getAttrs([csNm], function(v) {
                var setter = {};
                if (isNaN(parseInt(v[csNm], 10))) {
                    if (!(!v[csNm] || v[csNm] === "0") ) {

                        setter[csNm] = 3;
                        SWUtils.setWrapper(setter, PFConst.silentParams);
                    }
                }
            });
        }
        function migrateClassSkillArray(skills) {
            skills.forEach(function(skill) {
                migrateClassSkill(skill);
            });
        }
        function determineArray() {
            migrateClassSkillArray(allTheSkills);
            // not bothering to code correctly to wait since this is almost a year old.
            SWUtils.setWrapper({ classSkillsMigrated: 1 }, PFConst.silentParams, done);
        }
        getAttrs(["classSkillsMigrated"], function(vm) {
            if (!(parseInt(vm.classSkillsMigrated, 10) || 0)) {
                determineArray();
            }
            done();
        });
    }

    function migrateMacros2(callback) {
        getAttrs(["migrated_skill_speedup3"], function(vout) {
            var fields;
            if (vout.migrated_skill_speedup3 * 1) {
                if (typeof callback === "function") {
                    callback();
                }
            }
            fields = allTheSkills.map(function(skill) {
                return skill + "-macro";
            });
            getAttrs(fields, function(v) {
                var setter = {};
                try {
                    setter = _.reduce(v, function(m, macro, attr) {
                        try {
                            m[attr] = macro.replace(/ \+ \[\[ @{checks-cond} \+ @{buff_check_skills-total} \+ @{buff_Check-total} \]\] {2}/, "");
                            //    TAS.debug("removed cond and buffs macro from skill macro-text");
                        }
                        catch(ierr) {
                            TAS.error("PFBuffs.migrate add buff checks for " + attr, ierr);
                        }
                        return m;
                    }, {});
                }
                catch(err) {
                    TAS.error("PFSkills.migrate skill speedup", err);
                }
                finally {
                    setter.migrated_skill_speedup3 = 1;
                    setAttrs(setter, PFConst.silentParams, callback);
                }
            });
        });
    }

    function migrateTake10Dropdown(callback, oldversion) {
        function done() {
            if (typeof callback === "function") {
                callback();
            }
        }
        getAttrs(["migrated_take10_dropdown", "skill-query", "investigator_dice", "skill-invest-query"], function(v) {
            var setter = {};

            if ((parseInt(v.migrated_take10_dropdown, 10) || 0) === 0) {
                if (v["skill-query"] === "?{Roll or Take 10/20?|1d20,1d20+@{skill-invest-query&#125;|10,10+@{skill-invest-query&#125;|20,20+@{skill-invest-query&#125;}") {
                    setter["skill-query"] = "?{Roll or Take 10/20?|1d20,1d20|10,10|20,20}+@{skill-invest-query}";
                }
                else if (v["skill-query"] === "@{skill-invest-query}") {
                    setter["skill-query"] = "@{skill-invest-query}+@{custom_dice}";
                }
                else if (!v["skill-query"] || v["skill-query"] === "0") {
                    setter["skill-query"] = "1d20+@{skill-invest-query}";
                }
                else if (v["skill-query"] !== "@{skill-invest-query}+@{custom_dice}" &&
                    v["skill-query"] !== "?{Roll or Take 10/20?|1d20,1d20|10,10|20,20}+@{skill-invest-query}" &&
                    v["skill-query"] !== "1d20+@{skill-invest-query}") {
                    setter["skill-query"] = "1d20+@{skill-invest-query}";
                }
                if (v.investigator_dice === "0" || !v.investigator_dice) {
                    setter.investigator_dice = "[[ 1d6 ]] [custom bonus]";
                }
                if (!v["skill-invest-query"]) {
                    setter["skill-invest-query"] = "0";
                }
                else if ( v["skill-invest-query"] !== "@{investigator_dice}" && v["skill-invest-query"] !== "0" ) {
                    setter["skill-invest-query"] = "0";
                }
                setter.migrated_take10_dropdown = 1;

                SWUtils.setWrapper(setter, PFConst.silentParams, done);
            }
            else {
                done();
            }
        });
    }

    migrateTake10Dropdown(doneOne);
    migrateOldClassSkillValue(doneOne);
    migrateMacros2(doneOne);
    PFMigrate.migrateMaxSkills(doneOne);

}

/**
 * updates ALL skills - calls PFUtilsAsync.setDropdownValue for ability then updateSkill
 */
export var recalculate = TAS.callback(function(callback, silently, oldversion) {
    var done = _.once(function() {
        TAS.info("leaving PFSkills.recalculate");
        resetCommandMacro();
        if (typeof callback === "function") {
            callback();
        }
    });

    migrate(function() {

        updateMaxSkills();
        recalculateSkills(done, silently);
    }, oldversion);
});
function registerEventHandlers() {
    on("change:str-mod change:dex-mod change:con-mod change:int-mod change:wis-mod change:cha-mod", TAS.callback(function eventAbilityScoreToSkill(eventInfo) {
        TAS.notice("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
            recalculateAbilityBasedSkills(null, eventInfo);
        }
    }));
    // SKILLS************************************************************************
    on("change:total-skill change:total-fcskill change:int-mod change:level change:max-skill-ranks-mod change:unchained_skills-show change:BG-Skill-Use", TAS.callback(function eventUpdateMaxSkills(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
            updateMaxSkills(eventInfo);
        }
    }));
    on(events.skillGlobalPhysEventAuto, TAS.callback(function eventGlobalConditionAffectingSkill(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
            recalculateAbilityBasedSkills("physical", eventInfo);
        }
    }));
    // each skill has a dropdown handler and a skill update handler
    // concat them all up, only happens once so no big deal
    _.each(allTheSkills, function(skill) {
        on(events.skillEventsAuto.replace(/REPLACE/g, skill), TAS.callback(function eventSkillsAuto(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + skill + ", " + eventInfo.sourceType);
            if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
                verifyHasSkill(skill, function(hasSkill) {
                    if (hasSkill) {
                        updateSkillAsync(skill, eventInfo);
                    }
                });
            }
        }));
        on(events.skillEventsPlayer.replace(/REPLACE/g, skill), TAS.callback(function eventSkillsPlayer(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + skill + ", " + eventInfo.sourceType);
            if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                updateSkillAsync(skill);
            }
        }));
        on("change:" + skill + "-misc", TAS.callback(function eventSkillMiscFieldUpdate(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            TAS.debug("calling evalute for " + skill);
            SWUtils.evaluateAndAddToTotAsync(null, null, skill + "-misc", skill + "-misc-mod", skill);
        }));
        on("change:" + skill + "-cs", TAS.callback(function eventClassSkillCheckbox(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                updateSkillByClassChkAsync(skill);
            }
        }));

        // these always displayed if rt or not
        if (skill.slice(0, 9) !== "Knowledge" && skill !== "Linguistics" && skill !== "Sleight-of-Hand") {
            on("change:" + skill + "-ReqTrain change:" + skill + "-ranks", TAS.callback(function eventSkillRequiresTrainingRanks(eventInfo) {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + skill + ", " + eventInfo.sourceType);
                if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                    getAttrs(["enforce_requires_training"], function(v) {
                        if (parseInt(v.enforce_requires_training, 10)) {
                            resetCommandMacro(eventInfo);
                        }
                    });
                }
            }));
        }
        // end of skill loop
    });
    // skills affected by size
    _.each(sizeSkills, function(mult, skill) {
        if (mult === 1) {
            on("change:size_skill", TAS.callback(function eventUpdateSizeSkill(eventInfo) {
                if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
                    TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                    updateSkillAsync(skill);
                }
            }));
        }
        else if (mult === 2) {
            on("change:size_skill_double", TAS.callback(function eventUpdateSizeSkillDouble(eventInfo) {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
                    updateSkillAsync(skill);
                }
            }));
        }
    });
    on("change:enforce_requires_training", TAS.callback(function eventRequiresTraining(eventInfo) {
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            resetCommandMacro(eventInfo);
        }
    }));
    _.each(SWUtils.cartesianAppend(allFillInSkillInstances, ["-name"]), function(skill) {
        on("change:" + skill, TAS.callback(function eventSkillsWithFillInNames(eventInfo) {
            if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                var rt = skill.slice(0, -4) + "ReqTrain";
                var r = skill.slice(0, -4) + "ranks";
                // if we changed name on a skill that isn't choosable don't bother.
                getAttrs(["enforce_requires_training", rt, r, "unchained_skills-show", "BG-Skill-Use", "artistry_skills-macro", "lore_skills-macro", "craft_skills-macro", "knowledge_skills-macro", "perform_skills-macro", "profession_skills-macro", "misc-skill_skills-macro", "is_npc", "include_skill_totals", "NPC-craft_skills-macro", "NPC-knowledge_skills-macro", "NPC-perform_skills-macro", "NPC-profession_skills-macro", "NPC-misc-skill_skills-macro"], function(v) {
                    var isrt = parseInt(v.enforce_requires_training, 10);
                    var bg = 0;
                    var isNPC = parseInt(v.is_npc, 10) || 0;
                    var showBonus = parseInt(v.include_skill_totals, 10) || 0;
                    if (!(isrt && parseInt(v[rt], 10) && isNaN(parseInt(v[r], 10)))) {
                        bg = isNPC ? 0 : (parseInt(v["unchained_skills-show"], 10) || 0) && (parseInt(v["BG-Skill-Use"], 10) || 0);

                        updateSubSkillMacroBook(bg, isrt, eventInfo, v, isNPC, showBonus);
                    }
                });
            }
        }));
    });
    // reset based on config changes
    on("change:unchained_skills-show change:BG-Skill-Use change:include_skill_totals", TAS.callback(function eventResetUnchainedSkills(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            recalculate(eventInfo, function() {
                resetCommandMacro(eventInfo);
            });
        }
    }));
}
registerEventHandlers();
