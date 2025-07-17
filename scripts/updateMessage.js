import { MODULE_ID } from "./const.js";
const sampleData = {
  new: [{ item: "" }, { children: [""] }],
  update: [{ item: "" }, { children: [""] }],
};

const updateData = {
  new: [
    {
      item: "Support for for SF2e's Mechanic's `Mines` (🎨 @Sasane, 🖥️ @Sasane)",
    },
    { item: "<code>Update Messages</code>" },
    {
      children: [
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
  const last_version = game.settings.get(MODULE_ID, "last-version");
  if (
    last_version === "" ||
    last_version === game.modules.get(MODULE_ID).version
  )
    return;
  const updateMessage = {
    name: game.modules.get(MODULE_ID).title,
    icon: "fa-solid fa-wand-magic-sparkles",
    version: game.modules.get(MODULE_ID).version,
    ...updateData,
  };
  game.settings.set(
    MODULE_ID,
    "last-version",
    game.modules.get(MODULE_ID).version
  );
  ChatMessage.create({
    content: renderTemplate(
      `modules/${MODULE_ID}/templates/updateMessage.hbs`,
      updateMessage
    ),
    whisper: game.users.filter((u) => u.isGM).map((u) => u.id),
  });
}
