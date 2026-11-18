const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const cfg = require('../config');
const ui = require('../utils/ui');
const { canPostPanels } = require('../utils/perms');

module.exports = {
  data: new SlashCommandBuilder().setName('dashboard').setDescription('Post the server information dashboard in this channel'),
  async execute(interaction) {
    if (!canPostPanels(interaction.member)) {
      return interaction.reply({ content: '❌ You do not have permission to use this.', flags: MessageFlags.Ephemeral });
    }
    const c = ui.panel('information.png')
      .addTextDisplayComponents(ui.text('## Hampshire County Roleplay'))
      .addSeparatorComponents(ui.divider())
      .addTextDisplayComponents(ui.text(
        'Welcome to **Hampshire County Roleplay**! We are a strict, highly immersive ER:LC community dedicated to realistic roleplay, professional standards, and unforgettable in-game experiences.\n\n' +
        "Whether you're a civilian exploring the city streets, a brave first responder saving lives, or an ambitious criminal making a name for yourself, there's a place for you here. We pride ourselves on having an active, friendly, and mature player base.\n\n" +
        'Below you can find useful information and channel links to familiarise yourself with the server.'
      ))
      .addTextDisplayComponents(ui.text(
        '-# IMPORTANT CHANNELS\n' +
        `<#${cfg.REGULATIONS_CHANNEL_ID}>\n<#${cfg.SUPPORT_CHANNEL_ID}>\n<#${cfg.SESSIONS_CHANNEL_ID}>`
      ))
      .addTextDisplayComponents(ui.text(
        `-# IMPORTANT LINKS\n[Whitelisted Group](${cfg.WHITELISTED_GROUP_URL})`
      ));
    return ui.postPanel(interaction, ui.finish(c), 'information.png');
  },
};
