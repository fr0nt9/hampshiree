const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const ui = require('../utils/ui');
const { canPostPanels } = require('../utils/perms');
const { buildSupportPanel } = require('../handlers/tickets');

module.exports = {
  data: new SlashCommandBuilder().setName('support').setDescription('Post the support ticket panel in this channel'),
  async execute(interaction) {
    if (!canPostPanels(interaction.member)) {
      return interaction.reply({ content: '❌ You do not have permission to use this.', flags: MessageFlags.Ephemeral });
    }
    return ui.postPanel(interaction, buildSupportPanel(), 'support.png');
  },
};
