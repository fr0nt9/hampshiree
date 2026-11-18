const path = require('path');
const {
  AttachmentBuilder, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder,
  TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags,
} = require('discord.js');
const { COLOR } = require('../config');

const asset = (name) => new AttachmentBuilder(path.join(__dirname, '..', 'assets', name), { name });

const gallery = (name) =>
  new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(`attachment://${name}`));

const text = (content) => new TextDisplayBuilder().setContent(content);

const divider = (spacing = SeparatorSpacingSize.Small) =>
  new SeparatorBuilder().setDivider(true).setSpacing(spacing);

/** Starts a green container with a banner on top. */
const panel = (bannerFile) =>
  new ContainerBuilder().setAccentColor(COLOR).addMediaGalleryComponents(gallery(bannerFile));

/** Adds the footer strip + copyright line. */
const finish = (container) =>
  container
    .addMediaGalleryComponents(gallery('footer.png'))
    .addSeparatorComponents(divider())
    .addTextDisplayComponents(text('-# © 2026 Hampshire County Roleplay All rights reserved.'));

/** Posts a panel into the current channel and confirms privately. */
async function postPanel(interaction, container, bannerFile) {
  try {
    await interaction.channel.send({
      components: [container],
      files: [asset(bannerFile), asset('footer.png')],
      flags: MessageFlags.IsComponentsV2,
    });
    await interaction.reply({ content: '✅ Panel posted.', flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error(err);
    const msg = { content: '❌ I could not post here. Check I can view/send/attach files in this channel.', flags: MessageFlags.Ephemeral };
    if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
    else await interaction.reply(msg);
  }
}

module.exports = { asset, gallery, text, divider, panel, finish, postPanel };
