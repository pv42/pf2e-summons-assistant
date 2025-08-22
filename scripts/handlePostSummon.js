import { SOURCES, EFFECTS, MODULE_ID } from "./const.js";

export async function handlePostSummon(itemUUID, actorUUID) {
    switch (itemUUID) {
        case SOURCES.COMMANDER.PLANT_BANNER:
            socketlib.modules.get(MODULE_ID).executeAsGM("createEffects", {
                actorUUIDs: canvas.tokens.placeables.actor.items
                    .some(i =>
                        i.sourceId === EFFECTS.COMMANDER.IN_PLANT_BANNER_RANGE
                        && i?.flags?.pf2e?.aura?.origin === actorUUID
                    )
                    .map(token => token.actor.uuid),
                effectUUID: EFFECTS.COMMANDER.PLANT_BANNER
            })
            break;
        default:
            break;
    }
}