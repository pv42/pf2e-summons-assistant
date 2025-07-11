import { SPELLS } from "./const.js";

Hooks.once("init", async function () {});

Hooks.once("ready", async function () {
  Hooks.on("createChatMessage", async (msg, _info, userID) => {
    if (userID !== game.user.id) return;
    const uuid = msg?.item?.sourceId;
    let rank = msg?.flags?.pf2e?.origin?.castRank;
    if (!uuid) return;
    if (typeof rank !== "number") return;
    // TODO handle Incarnate spells at a later date
    if (!msg?.flags?.pf2e?.origin?.rollOptions?.includes("summon")) return;
    let traits = [];
    let level = 20;

    switch (uuid) {
      case SPELLS.SUMMON.SUMMON_DRAGON:
        traits = ["dragon"];
        break;
      case SPELLS.SUMMON.SUMMON_UNDEAD:
        traits = ["undead"];
        break;
      case SPELLS.SUMMON.SUMMON_CELESTIAL:
        traits = ["celestial"];
        break;
      case SPELLS.SUMMON.SUMMON_FEY:
        traits = ["fey"];
        break;
      case SPELLS.SUMMON.SUMMON_ANIMAL:
        traits = ["animal"];
        break;
      case SPELLS.SUMMON.SUMMON_CONSTRUCT:
        traits = ["construct"];
        break;
      case SPELLS.SUMMON.SUMMON_LESSER_SERVITOR:
        traits = ["celestial", "fiend", "monitor", "animal"];
        if (rank >= 4) rank = 4;
        break;
      case SPELLS.SUMMON.SUMMON_PLANT_OR_FUNGUS:
        traits = ["plant", "fungus"];
        break;
      case SPELLS.SUMMON.SUMMON_ELEMENTAL:
        traits = ["elemental"];
        break;
      case SPELLS.SUMMON.SUMMON_ENTITY:
        traits = ["aberration"];
        break;
      case SPELLS.SUMMON.SUMMON_FIEND:
        traits = ["fiend"];
        break;
      case SPELLS.SUMMON.SUMMON_GIANT:
        traits = ["giant"];
        break;
      case SPELLS.SUMMON.SUMMON_MONITOR:
        traits = ["monitor"];
        break;
    }
    const levels = [-1, 1, 2, 3, 5, 7, 9, 11, 13, 15];
    level = levels[rank - 1];

    const result = await foundrySummons.SummonMenu.start({
      //packs: ['pf2e.pathfinder-monster-core'],
      filter: (actor) => {
        let result =
          actor.system.traits.rarity == "common" &&
          actor.system.details.level.value <= level;
        if (traits.length > 0) {
          result &= actor.system.traits.value.some((q) =>
            traits.some((r) => r.toLowerCase() == q.toLowerCase())
          );
        }
        return result;
      },
      dropdowns:[{
        id:"sortOrder",
        name:"Sort order",
        options:[{label: "Level descending", value: 0}, {label: "Level", value:1}],
        sort: (a,b,i) => {
          if (i==0) {
            if (a.system.details.level.value == b.system.details.level.value)
              return a.name.localeCompare(b.name); 
            else 
              return (b.system.details.level.value-a.system.details.level.value);
          }
          else{  
            if (a.system.details.level.value == b.system.details.level.value)
              return a.name.localeCompare(b.name); 
            else 
              return (a.system.details.level.value-b.system.details.level.value);
          }
        }
      },
      {
        id: "traitsFilter",
        name: "Trait",
        options:[{label:'', value:''}, ...traits.toSorted().map(t => ({label:t, value: t}))],
        func: (actor, i)=>{
          return !i || actor.system.traits.value.some(q => i.toLowerCase() == q.toLowerCase());
        }
      }],
      toggles:[{
        id:"onlyWithImages",
        name: "Only with image",
        func: (actor,i) => {
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
  });
});

// function getMap(uuid) {
//   const name = fromUuidSync(uuid).name.toUpperCase().split(' ').join('_')
//       console.log(`${name}: "${uuid}",`)
//   }
