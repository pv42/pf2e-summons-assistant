import { EFFECTS, ROLL_OPTION } from "../const.js";

export function setupCommanderHooks() {
    Hooks.on("pf2e.startTurn", async (combatant, encounter, user) => {
        handlePlantBannerStartOfTurn(combatant)
    })
}

async function handlePlantBannerStartOfTurn(combatant) {
    if (!game.user.isGM) return;
    if (!combatant?.actor?.rollOptions?.all
        ?.[ROLL_OPTION.COMMANDER.IN_PLANT_BANNER_RANGE]) return;
    await combatant.actor.createEmbeddedDocuments("Item", [
        await fromUuid(EFFECTS.COMMANDER.PLANT_BANNER)
    ])
}