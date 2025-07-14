import { CREATURES, SOURCE } from "./const.js";
import { hasNoTargets } from "./helpers.js";

export function getSpecificSummonDetails(uuid, data = { rank: 0, summonerLevel: 0, dc: 0 }) {
    switch (uuid) {
        case SOURCE.SUMMON.PHANTASMAL_MINION:
            return { specific_uuids: [CREATURES.PHANTASMAL_MINION], rank: data.rank }
        case SOURCE.MISC.LIGHT:
            if (hasNoTargets()) {
                return {
                    specific_uuids: Object.values(CREATURES.LIGHT), rank: data.rank, modifications: {
                        "level": data.rank
                    }
                }
            }
            else return null;

        case SOURCE.INCARNATE.SUMMON_HEALING_SERVITOR:
            return incarnateDetails({
                uuids: [CREATURES.HEALING_SERVITOR],
                rank: data.rank,
                dc: data.dc
            })
        case SOURCE.INCARNATE.TEMPEST_OF_SHADES:
            return incarnateDetails({
                uuids: [CREATURES.TEMPEST_OF_SHADES],
                rank: data.rank,
                dc: data.dc
            })
        case SOURCE.MISC.CALL_URSINE_ALLY:
            if (data.summonerLevel < 10) {
                return { specific_uuids: [CREATURES.BLACK_BEAR], rank: 3 }
            } else if (data.summonerLevel < 12) {
                return { specific_uuids: [CREATURES.GRIZZLY_BEAR], rank: 4 }
            } else if (data.summonerLevel < 14) {
                return { specific_uuids: [CREATURES.POLAR_BEAR], rank: 5 }
            } else {
                return { specific_uuids: [CREATURES.CAVE_BEAR], rank: 6 }
            }

        case SOURCE.NECROMANCER.CREATE_THRALL:
            return { specific_uuids: [CREATURES.NECROMANCER.THRALL], rank: data.rank }
        case SOURCE.NECROMANCER.PERFECTED_THRALL:
            return { specific_uuids: [CREATURES.NECROMANCER.PERFECTED_THRALL], rank: data.rank }
        case SOURCE.NECROMANCER.SKELETAL_LANCERS:
            return { specific_uuids: [CREATURES.NECROMANCER.SKELETAL_LANCERS], rank: data.rank, amount: 5 }
        case SOURCE.NECROMANCER.LIVING_GRAVEYARD:
            return { specific_uuids: [CREATURES.NECROMANCER.LIVING_GRAVEYARD], rank: data.rank }
        case SOURCE.NECROMANCER.RECURRING_NIGHTMARE:
            return { specific_uuids: [CREATURES.NECROMANCER.RECURRING_NIGHTMARE], rank: data.rank }
        default:
            return null;
    }
}