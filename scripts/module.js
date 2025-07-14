import { CREATURES, MODULE_ID, SOURCE, SUMMON_LEVELS_BY_RANK } from "./const.js";
import { extractDCValueRegex, incarnateDetails, isIncarnate } from "./incarnate.js";
import { setupSettings } from "./settings.js";
import { getSpecificSummonDetails } from "./specificSummons.js";

Hooks.once("init", async function () {
  setupSettings();
});

Hooks.once("ready", async function () {
  Hooks.on("createChatMessage", async (msg, _info, userID) => {
    if (userID !== game.user.id) return;
    const uuid = msg?.item?.sourceId;
    if (!uuid) return;

    // TODO handle Incarnate spells at a later date
    //if (!msg?.flags?.pf2e?.origin?.rollOptions?.includes("summon")) return;
    let level = 20;
    //attributes.classDC.value

    const summoner = ChatMessage.getSpeakerActor(msg.speaker);
    const alliance = summoner.system.details.alliance;



    const rank = msg?.flags?.pf2e?.origin?.castRank ?? 0;
    const relevantInfo = { rank, summonerLevel: summoner.level }
    //Grab DC for Incarnate spells
    if (isIncarnate(msg)) relevantInfo.dc = extractDCValueRegex(msg.content) ?? 0;

    let details = getSpecificSummonDetails(uuid, relevantInfo)
    if (!details) {
      details = getTraditionalSummonerSpellDetails(uuid, rank);
    }

    // No Summon Spell Found
    if (details === null) return;

    const actor_traits = details?.traits || [];
    const specific_uuids = details?.specific_uuids || [];
    const modifications = details?.modifications || {};
    const amount = details?.amount || 1;
    level = SUMMON_LEVELS_BY_RANK[details.rank];

    let pickedUUID;
    if (specific_uuids.length === 1) {
      pickedUUID = specific_uuids[0]
    } else {
      pickedUUID = await foundrySummons.SummonMenu.start({
        //packs: ['pf2e.pathfinder-monster-core'],
        noSummon: true,
        filter: (actor) => {
          let result =
            actor.system.traits.rarity == "common" &&
            actor.system.details.level.value <= level;
          if (actor_traits.length > 0) {
            result &= actor.system.traits.value.some((q) =>
              actor_traits.some((r) => r.toLowerCase() == q.toLowerCase())
            );
          }
          if (specific_uuids.length > 0) {
            result &= specific_uuids.some((suuid) => suuid === actor?.uuid)
          }
          return result;
        },
        dropdowns: [{
          id: "sortOrder",
          name: "Sort order",
          options: [{ label: "Level descending", value: 0 }, { label: "Level", value: 1 }],
          sort: (a, b, i) => {
            if (i == 0) {
              if (a.system.details.level.value == b.system.details.level.value)
                return a.name.localeCompare(b.name);
              else
                return (b.system.details.level.value - a.system.details.level.value);
            }
            else {
              if (a.system.details.level.value == b.system.details.level.value)
                return a.name.localeCompare(b.name);
              else
                return (a.system.details.level.value - b.system.details.level.value);
            }
          }
        },
        {
          id: "traitsFilter",
          name: "Trait",
          options: [{ label: '', value: '' }, ...actor_traits.toSorted().map(t => ({ label: t, value: t }))],
          func: (actor, i) => {
            return !i || actor.system.traits.value.some(q => i.toLowerCase() == q.toLowerCase());
          }
        }],
        toggles: [{
          id: "onlyWithImages",
          name: "Only with image",
          func: (actor, i) => {
            return !i || actor.img != "systems/pf2e/icons/default-icons/npc.svg";
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

    const addedTraits = addTraits("summon");

    const pickedActor = await foundry.utils.fromUuid(pickedUUID);

    const updateData = {
      'system.details.alliance': alliance,
      'system.traits.value': [...pickedActor.system.traits.value, ...addedTraits],
      ...modifications
    };

    if (game.settings.get(MODULE_ID, "name-ownership")) {
      updateData.name = `${summoner.name}'s ${pickedActor.name}`;
      updateData["prototypeToken.name"] = `${summoner.prototypeToken.name}'s ${pickedActor.prototypeToken.name}`;
    }
    // if (game.settings.get(MODULE_ID, "effect-ownership")) updateData.items = `${summoner.name}'s ${pickedActor.name}`;


    for (let i = 0; i < amount; i++) {
      await foundrySummons.pick({
        uuid: pickedUUID,
        updateData,
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
    case SOURCE.SUMMON.SUMMON_DRAGON:
      details.traits = ["dragon"];
      break;
    case SOURCE.SUMMON.SUMMON_UNDEAD:
      details.traits = ["undead"];
      break;
    case SOURCE.SUMMON.SUMMON_CELESTIAL:
      details.traits = ["celestial"];
      break;
    case SOURCE.SUMMON.SUMMON_FEY:
      details.traits = ["fey"];
      break;
    case SOURCE.SUMMON.SUMMON_ANIMAL:
      details.traits = ["animal"];
      break;
    case SOURCE.SUMMON.SUMMON_CONSTRUCT:
      details.traits = ["construct"];
      break;
    case SOURCE.SUMMON.SUMMON_LESSER_SERVITOR:
      details.traits = ["celestial", "fiend", "monitor", "animal"];
      if (rank > 4) details.rank = 4;
      break;
    case SOURCE.SUMMON.SUMMON_PLANT_OR_FUNGUS:
      details.traits = ["plant", "fungus"];
      break;
    case SOURCE.SUMMON.SUMMON_ELEMENTAL:
      details.traits = ["elemental"];
      break;
    case SOURCE.SUMMON.SUMMON_ENTITY:
      details.traits = ["aberration"];
      break;
    case SOURCE.SUMMON.SUMMON_FIEND:
      details.traits = ["fiend"];
      break;
    case SOURCE.SUMMON.SUMMON_GIANT:
      details.traits = ["giant"];
      break;
    case SOURCE.SUMMON.SUMMON_MONITOR:
      details.traits = ["monitor"];
      break;
    default:
      return null;
  }
  return details;
}


function addTraits(type) {
  if (type === 'summon') return ['minion', 'summoned']
}


function hasNoTargets() {
  return game.user.targets.size === 0;
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
