import { CREATURES, MODULE_ID, SPELLS, SUMMON_LEVELS_BY_RANK } from "./const.js";
import { setupSettings } from "./settings.js";

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

    const summoner = ChatMessage.getSpeakerActor(msg.speaker);
    const alliance = summoner.system.details.alliance;


    let rank = msg?.flags?.pf2e?.origin?.castRank ?? 0;
    let details = getSpecificSummonDetails(uuid, { rank, summonerLevel: summoner.level })
    if (!details) {
      details = getTraditionalSummonerSpellDetails(uuid, rank);
    }

    // No Summon Spell Found
    if (details === null) return;

    const actor_traits = details?.traits || [];
    const specific_uuids = details?.specific_uuids || [];
    const modifications = details?.modifications || {};
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

    const updateData = { 'system.details.alliance': alliance, 'system.traits.value': [...pickedActor.system.traits.value, ...addedTraits], ...modifications };
    if (game.settings.get(MODULE_ID, "name-ownership")) {
      updateData.name = `${summoner.name}'s ${pickedActor.name}`;
      updateData["prototypeToken.name"] = `${summoner.prototypeToken.name}'s ${pickedActor.prototypeToken.name}`;
    }
    // if (game.settings.get(MODULE_ID, "effect-ownership")) updateData.items = `${summoner.name}'s ${pickedActor.name}`;



    await foundrySummons.pick({
      uuid: pickedUUID,
      updateData,
    });
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
    case SPELLS.SUMMON.SUMMON_DRAGON:
      details.traits = ["dragon"];
      break;
    case SPELLS.SUMMON.SUMMON_UNDEAD:
      details.traits = ["undead"];
      break;
    case SPELLS.SUMMON.SUMMON_CELESTIAL:
      details.traits = ["celestial"];
      break;
    case SPELLS.SUMMON.SUMMON_FEY:
      details.traits = ["fey"];
      break;
    case SPELLS.SUMMON.SUMMON_ANIMAL:
      details.traits = ["animal"];
      break;
    case SPELLS.SUMMON.SUMMON_CONSTRUCT:
      details.traits = ["construct"];
      break;
    case SPELLS.SUMMON.SUMMON_LESSER_SERVITOR:
      details.traits = ["celestial", "fiend", "monitor", "animal"];
      if (rank > 4) details.rank = 4;
      break;
    case SPELLS.SUMMON.SUMMON_PLANT_OR_FUNGUS:
      details.traits = ["plant", "fungus"];
      break;
    case SPELLS.SUMMON.SUMMON_ELEMENTAL:
      details.traits = ["elemental"];
      break;
    case SPELLS.SUMMON.SUMMON_ENTITY:
      details.traits = ["aberration"];
      break;
    case SPELLS.SUMMON.SUMMON_FIEND:
      details.traits = ["fiend"];
      break;
    case SPELLS.SUMMON.SUMMON_GIANT:
      details.traits = ["giant"];
      break;
    case SPELLS.SUMMON.SUMMON_MONITOR:
      details.traits = ["monitor"];
      break;
    default:
      return null;
  }
  return details;
}

function getSpecificSummonDetails(uuid, data = { rank: 0, summonerLevel: 0 }) {
  switch (uuid) {
    case SPELLS.SUMMON.PHANTASMAL_MINION:
      return { specific_uuids: [CREATURES.PHANTASMAL_MINION], rank: data.rank }
    case SPELLS.MISC.LIGHT:
      if (hasNoTargets()) {
        return {
          specific_uuids: Object.values(CREATURES.LIGHT), rank: data.rank, modifications: {
            "level": data.rank
          }
        }
      }
      else return null;
    case SPELLS.INCARNATE.SUMMON_HEALING_SERVITOR:
      return {
        specific_uuids: [CREATURES.HEALING_SERVITOR], rank: data.rank, modifications: {
          "level": data.rank
        }
      }
    case SPELLS.INCARNATE.TEMPEST_OF_SHADES:
      return {
        specific_uuids: [CREATURES.TEMPEST_OF_SHADES], rank: data.rank, modifications: {
          "level": data.rank
        }
      }
    case SPELLS.MISC.CALL_URSINE_ALLY:
      if (data.summonerLevel < 10) {
        return { specific_uuids: [CREATURES.BLACK_BEAR], rank: 3 }
      } else if (data.summonerLevel < 12) {
        return { specific_uuids: [CREATURES.GRIZZLY_BEAR], rank: 4 }
      } else if (data.summonerLevel < 14) {
        return { specific_uuids: [CREATURES.POLAR_BEAR], rank: 5 }
      } else {
        return { specific_uuids: [CREATURES.CAVE_BEAR], rank: 6 }
      }
    default:
      return null;
  }
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
