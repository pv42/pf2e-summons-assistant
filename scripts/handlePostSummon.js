import { SOURCES, EFFECTS, MODULE_ID } from "./const.js";

export async function handlePostSummon(itemUUID, actorUUID) {
    switch (itemUUID) {
        case SOURCES.COMMANDER.PLANT_BANNER:
            setTimeout(function () {
                socketlib.modules.get(MODULE_ID).executeAsGM("createEffects", {
                    actorUUIDs: canvas.tokens.placeables.filter(token =>
                        token.actor.items.some(i =>
                            i.sourceId === EFFECTS.COMMANDER.IN_PLANT_BANNER_RANGE
                            && i?.flags?.pf2e?.aura?.origin === actorUUID
                        )
                    ).map(token => token.actor.uuid),
                    effectUUID: EFFECTS.COMMANDER.PLANT_BANNER
                })

            }, 1500) // DO this after 0.5 seconds to hopefully fix the no stuff applied yet issue
            break;
        default:
            break;
    }
}