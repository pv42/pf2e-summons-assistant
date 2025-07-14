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