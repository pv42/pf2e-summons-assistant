import { MODULE_ID } from "./const.js";
const sampleData = {
    new: [{ item: "" }, { item: "", feat: true }, { children: [""] }],
    update: [{ item: "" }, { children: [""] }],
};

const updateData = {
    new: [
        {
            item: "Support for for SF2e's Mechanic's `Mines` (🎨 @Sasane, 🖥️ @Sasane)",
        },
        {
            item: "Update Messages", feat: true, children: [
                "Little update messages for each new update will appear the first time you open a server after an update",
            ],
        },
    ],
    update: [
        { item: "Updated French translation (@rectulo)" },
        { item: "Updated Polish Translation (@Lioheart)" },
    ],
};

export async function handleUpdateMessage() {
    if (!game.user.isGM) return;
    const last_version = game.settings.get(MODULE_ID, "last-version");
    game.settings.set(
        MODULE_ID,
        "last-version",
        game.modules.get(MODULE_ID).version
    );
    if (
        last_version === game.modules.get(MODULE_ID).version
    )
        return;
    const updateMessage = {
        name: game.modules.get(MODULE_ID).title,
        icon: "fa-solid fa-wand-magic-sparkles",
        version: game.modules.get(MODULE_ID).version,
        ...updateData,
    };
    updateMessage.isNew = updateMessage?.new && updateMessage?.new?.length > 0
    updateMessage.isUpdate = updateMessage?.update && updateMessage?.update?.length > 0
    updateMessage.new = updateMessage?.new?.map(it => ({
        hasChild: !!it?.children && !!it?.children?.length > 0,
        ...it
    }))
    updateMessage.update = updateMessage?.update?.map(it => ({
        hasChild: !!it?.children && !!it?.children?.length > 0,
        ...it
    }))

    const content = await renderTemplate(
        `modules/${MODULE_ID}/templates/updateMessage.hbs`,
        updateMessage
    );

    ChatMessage.create({
        content,
        whisper: game.users.filter((u) => u.isGM).map((u) => u.id),
    });
}
