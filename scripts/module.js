import { MODULE_ID, SLUG_TO_SOURCE, SOURCES } from "./const.js";
import { messageItemHasRollOption } from "./helpers.js";
import { extractDCValueRegex, isIncarnate } from "./specificCases/incarnate.js";
import { isMechanic, setMechanicRelevantInfo } from "./specificClasses/mechanic.js";
import { isSummoner, setSummonerRelevantInfo } from "./specificClasses/summoner.js";
import { setupSettings } from "./settings.js";
import { getSpecificSummonDetails } from "./specificSummons.js";
import { handleUpdateMessage } from "./updateMessage.js";
import { summon, getTraditionalSummonerSpellDetails } from "./summon.js";
import { isBindHeroicSpiritHit, setNecromancerHooks } from "./specificClasses/necromancer.js";
import { setupCommanderHooks } from "./specificClasses/commander.js";
import { setupSocket } from "./lib/socket.js";
import { setupWoodDoubleHooks } from "./specificCases/woodenDouble.js";

Hooks.once("init", async function () {
  loadTemplates([
    `modules/${MODULE_ID}/templates/updateMessage.hbs`,
  ])
  setupSettings();
});

Hooks.once("setup", function () {
  if (!setupSocket())
    console.error("Error: Unable to set up socket lib for PF2e Summons Assistant");
});

Hooks.once("ready", async function () {
  handleUpdateMessage();
  setupSpecificHooks();
  Hooks.on("createChatMessage", async (chatMessage, _info, userID) => {
    if (userID !== game.user.id) return;

    const isBindHeroicSpiritSuccess = isBindHeroicSpiritHit(chatMessage);

    if (chatMessage.isRoll && !isBindHeroicSpiritSuccess) return;

    // Handle Specific Case Bind Heroic Spirit
    let itemUuid = isBindHeroicSpiritSuccess
      ? SOURCES.NECROMANCER.BIND_HEROIC_SPIRIT_STRIKE
      : chatMessage?.item?.sourceId;

    if (!itemUuid) {
      itemUuid = itemUuid || SLUG_TO_SOURCE[chatMessage?.item?.slug || game.pf2e.system.sluggify(chatMessage?.item?.name || "")];
      if (!itemUuid) return;
    }

    if (chatMessage?.flags?.pf2e?.appliedDamage) return;

    let summonLevel = 20;

    const summonerActor = ChatMessage.getSpeakerActor(chatMessage.speaker);

    const spellRank = chatMessage?.flags?.pf2e?.origin?.castRank ?? 0;
    const spellRelevantInfo = { rank: spellRank, summonerLevel: summonerActor.level, spellDC: summonerActor.system.attributes.spellDC.value }
    //Grab DC for Incarnate spells
    if (isIncarnate(chatMessage)) spellRelevantInfo.dc = extractDCValueRegex(chatMessage.content) ?? 0;
    if (isMechanic(chatMessage)) {
      setMechanicRelevantInfo(summonerActor, spellRelevantInfo);
    }
    if (isSummoner(chatMessage)) {
      setSummonerRelevantInfo(summonerActor, spellRelevantInfo);
    }
    if (itemUuid === SOURCES.COMMANDER.PLANT_BANNER) {
      spellRelevantInfo.int = summonerActor.system.abilities.int.mod;
    } else if (itemUuid === SOURCES.MISC.DUPLICATE_FOE) {
      spellRelevantInfo.targetTokenUUID =
        chatMessage?.flags["pf2e-toolbelt"]?.targetHelper?.targets?.[0] ??
        game?.user?.targets?.first()?.document?.uuid
    } else if (itemUuid === SOURCES.MISC.WOODEN_DOUBLE) {
      const token = canvas.tokens.get(chatMessage.speaker.token)
      spellRelevantInfo.tokenWidth = token ?token.document.width : 1;
      spellRelevantInfo.tokenHeight = token ?token.document.height : 1;
      spellRelevantInfo.position = token ? token.center : null;
    }

    let summonDetailsGroup = await getSpecificSummonDetails(itemUuid, spellRelevantInfo)
    if (!summonDetailsGroup) {
      summonDetailsGroup = getTraditionalSummonerSpellDetails(itemUuid, spellRank);
    }

    const summonType = getSummonType(chatMessage);
    await summon(summonerActor, itemUuid, summonType, summonDetailsGroup);
  });
});

function getSummonType(chatMessage) {
  if (isMechanic(chatMessage))
    return "mechanic";
  if (messageItemHasRollOption(chatMessage, "thrall"))
    return "thrall";
  if (isSummoner(chatMessage))
    return "summoner";
  return "summon";
}


function setupSpecificHooks() {
  //Classes
  setNecromancerHooks();
  setupCommanderHooks();

  // Specific Cases
  setupWoodDoubleHooks();
}