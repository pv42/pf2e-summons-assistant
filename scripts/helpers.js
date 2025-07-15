/**
 * From UUID function to maintain V12 & 13 Compatab ility
 * @param {*} uuid UUID to get
 * @returns 
 */
export async function compFromUuid(uuid) {
    if (parseInt(game.version) === 12) {
        return await fromUuid(uuid)
    } else {
        return await foundry.utils.fromUuid(uuid)
    }
}



export function addTraits(type) {
    if (type === 'summon') return ['minion', 'summoned']
    return [];
}

export function messageItemHasRollOption(msg, roll_option) {
    return msg?.flags?.pf2e?.origin?.rollOptions?.includes(roll_option)
}


export function hasNoTargets() {
    return game.user.targets.size === 0;
}
