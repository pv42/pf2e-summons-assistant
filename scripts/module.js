import { CREATURES, MODULE_ID, SPELLS, SUMMON_LEVELS_BY_RANK } from "./const.js";
import { compFromUuid } from "./helpers.js";
import { extractDCValueRegex, incarnateDetails, isIncarnate } from "./incarnate.js";
import { setupSettings } from "./settings.js";
import { getSpecificSummonDetails } from "./specificSummons.js";

Hooks.once("init", async function () {
  setupSettings();
});

Hooks.once("ready", async function () {
  Hooks.on("createChatMessage", async (chatMessage, _info, userID) => {
    if (userID !== game.user.id) return;
    const itemUuid = chatMessage?.item?.sourceId;
    if (!itemUuid) return;

    // TODO handle Incarnate spells at a later date
    //if (!chatMessage?.flags?.pf2e?.origin?.rollOptions?.includes("summon")) return;
    let summonLevel = 20;
    //attributes.classDC.value

    const summonerActor = ChatMessage.getSpeakerActor(chatMessage.speaker);
    const summonerAlliance = summonerActor.system.details.alliance;

    const spellRank = chatMessage?.flags?.pf2e?.origin?.castRank ?? 0;
    const spellRelevantInfo = { rank: spellRank, summonerLevel: summonerActor.level }
    //Grab DC for Incarnate spells
    if (isIncarnate(chatMessage)) spellRelevantInfo.dc = extractDCValueRegex(chatMessage.content) ?? 0;

    let summonDetailsGroup = getSpecificSummonDetails(itemUuid, spellRelevantInfo)
    if (!summonDetailsGroup) {
      summonDetailsGroup = getTraditionalSummonerSpellDetails(itemUuid, spellRank);
    }

    // No Summon Spell Found
    if (summonDetailsGroup === null) return;

    for (const summonDetails of summonDetailsGroup) {
      const requiredTraits = summonDetails?.traits || [];
      const allowedSpecificUuids = summonDetails?.specific_uuids || [];
      const actorModifications = summonDetails?.modifications || {};
      summonLevel = SUMMON_LEVELS_BY_RANK[summonDetails.rank];

      let selectedActorUuid;
      if (allowedSpecificUuids.length === 1) {
        selectedActorUuid = allowedSpecificUuids[0]
      } else {
        selectedActorUuid = await foundrySummons.SummonMenu.start({
          //packs: ['pf2e.pathfinder-monster-core'],
          noSummon: true,
          filter: (candidateActor) => {
            const isCommonAndValidLevel =
              candidateActor.system.traits.rarity === "common" &&
              candidateActor.system.details.level.value <= summonLevel;

            const hasValidTraits = requiredTraits.length === 0 ||
              candidateActor.system.traits.value.some(actorTrait =>
                requiredTraits.some(requiredTrait => requiredTrait.toLowerCase() === actorTrait.toLowerCase())
              );

            const hasValidUuid = allowedSpecificUuids.length === 0 ||
              allowedSpecificUuids.includes(candidateActor?.uuid);

            return isCommonAndValidLevel && hasValidTraits && hasValidUuid;
          },
          dropdowns: [{
            id: "sortOrder",
            name: "Sort order",
            options: [{ label: "Level descending", value: 0 }, { label: "Level", value: 1 }],
            sort: (actorA, actorB, sortIndex) => {
              if (sortIndex == 0) {
                if (actorA.system.details.level.value == actorB.system.details.level.value)
                  return actorA.name.localeCompare(actorB.name);
                else
                  return (actorB.system.details.level.value - actorA.system.details.level.value);
              }
              else {
                if (actorA.system.details.level.value == actorB.system.details.level.value)
                  return actorA.name.localeCompare(actorB.name);
                else
                  return (actorA.system.details.level.value - actorB.system.details.level.value);
              }
            }
          },
          {
            id: "traitsFilter",
            name: "Trait",
            options: [{ label: '', value: '' }, ...requiredTraits.toSorted().map(traitName => ({ label: traitName, value: traitName }))],
            func: (filterActor, selectedTrait) => {
              return !selectedTrait || filterActor.system.traits.value.some(actorTrait => selectedTrait.toLowerCase() == actorTrait.toLowerCase());
            }
          }],
          toggles: [{
            id: "onlyWithImages",
            name: "Only with image",
            func: (toggleActor, isToggleActive) => {
              return !isToggleActive || toggleActor.img != "systems/pf2e/icons/default-icons/npc.svg";
            },
            indexedFields: [
              "system.details.level.value",
              "system.traits.value",
              "system.traits.rarity",
              "img"
            ]
          }]
        });
      }

      const summonType = messageItemHasRollOption("thrall") ? "thrall" : "summon"
      const additionalTraits = addTraits(summonType);

      const selectedActor = await compFromUuid(selectedActorUuid);

      const actorUpdateData = {
        'system.details.alliance': summonerAlliance,
        'system.traits.value': [...selectedActor.system.traits.value, ...additionalTraits],
        ...actorModifications
      };

      if (game.settings.get(MODULE_ID, "name-ownership")) {
        actorUpdateData.name = `${summonerActor.name}'s ${selectedActor.name}`;
        actorUpdateData["prototypeToken.name"] = `${summonerActor.prototypeToken.name}'s ${selectedActor.prototypeToken.name}`;
      }
      // if (game.settings.get(MODULE_ID, "effect-ownership")) actorUpdateData.items = `${summonerActor.name}'s ${selectedActor.name}`;

      await foundrySummons.pick({
        uuid: selectedActorUuid,
        updateData: actorUpdateData,
      });
    }
  });
});


/**
 * 
 * @param {String} uuid UUID of the spell casting
 * @param {Number} rank Rank of the spell cating
 * @returns {{traits: String[], rank: Number}} Traits and Rank of the spell
 */
function getTraditionalSummonerSpellDetails(uuid, rank) {
  const details = { traits: [], rank }
  switch (uuid) {
    case SOURCES.SUMMON.SUMMON_DRAGON:
      details.traits = ["dragon"];
      break;
    case SOURCES.SUMMON.SUMMON_UNDEAD:
      details.traits = ["undead"];
      break;
    case SOURCES.SUMMON.SUMMON_CELESTIAL:
      details.traits = ["celestial"];
      break;
    case SOURCES.SUMMON.SUMMON_FEY:
      details.traits = ["fey"];
      break;
    case SOURCES.SUMMON.SUMMON_ANIMAL:
      details.traits = ["animal"];
      break;
    case SOURCES.SUMMON.SUMMON_CONSTRUCT:
      details.traits = ["construct"];
      break;
    case SOURCES.SUMMON.SUMMON_LESSER_SERVITOR:
      details.traits = ["celestial", "fiend", "monitor", "animal"];
      if (rank > 4) details.rank = 4;
      break;
    case SOURCES.SUMMON.SUMMON_PLANT_OR_FUNGUS:
      details.traits = ["plant", "fungus"];
      break;
    case SOURCES.SUMMON.SUMMON_ELEMENTAL:
      details.traits = ["elemental"];
      break;
    case SOURCES.SUMMON.SUMMON_ENTITY:
      details.traits = ["aberration"];
      break;
    case SOURCES.SUMMON.SUMMON_FIEND:
      details.traits = ["fiend"];
      break;
    case SOURCES.SUMMON.SUMMON_GIANT:
      details.traits = ["giant"];
      break;
    case SOURCES.SUMMON.SUMMON_MONITOR:
      details.traits = ["monitor"];
      break;
    default:
      return null;
  }
  return [details];
}

// function getOwnershipEffect(ownerActor, duration = { value: -1, unit: unlimited, sustained: false }) {
//   return {
//     name: `${ownerActor.name}'s Summon`,
//     img: ownerActor.protoTy,
//     system: {
//       duration
//     },
//     type: "effect"
//   }
// }



// function getMap(uuid) {
//   const name = fromUuidSync(uuid).name.toUpperCase().split(' ').join('_')
//       console.log(`${name}: "${uuid}",`)
//   }
