import { MODULE_ID } from "./const.js";

export function setupSettings() {
    game.settings.register(MODULE_ID, "name-ownership", {
        name: `${MODULE_ID}.module-settings.name-ownership.name`,
        hint: `${MODULE_ID}.module-settings.name-ownership.hint`,
        requiresReload: false,
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });
    //   game.settings.register(MODULE_ID, "effect-ownership", {
    //     name: "effect-ownership",
    //     hint: "",
    //     requiresReload: false,
    //     scope: "world",
    //     config: false,
    //     default: true,
    //     type: Boolean,
    //   });
}