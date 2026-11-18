const { SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const cfg = require('../config');
const ui = require('../utils/ui');
const { canPostPanels } = require('../utils/perms');

module.exports = {
  data: new SlashCommandBuilder().setName('verify').setDescription('Post the Bloxlink verification panel in this channel'),
  async execute(interaction) {
    if (!canPostPanels(interaction.member)) {
      return interaction.reply({ content: '❌ You do not have permission to use this.', flags: MessageFlags.Ephemeral });
    }
    const button = new ButtonBuilder().setLabel('Verify with Bloxlink').setStyle(ButtonStyle.Link).setURL(cfg.BLOXLINK_URL);

    const c = ui.panel('verification.png')
      .addTextDisplayComponents(ui.text('## Verify Yourself'))
      .addSeparatorComponents(ui.divider())
      .addTextDisplayComponents(ui.text(
        `Verify your Roblox account with Bloxlink to unlock access to **${cfg.SERVER_NAME}**.\n\n` +
        '**1.** Click **Verify with Bloxlink** below\n' +
        '**2.** Follow the steps on the Bloxlink site\n' +
        '**3.** Your roles update automatically — you\'re in'
      ))
      .addSeparatorComponents(ui.divider())
      .addActionRowComponents(new ActionRowBuilder().addComponents(button))
      .addTextDisplayComponents(ui.text('-# Having trouble? Verification commonly fails on mobile. Try again from a computer or your phone\'s browser.'));
    return ui.postPanel(interaction, ui.finish(c), 'verification.png');
  },
};
