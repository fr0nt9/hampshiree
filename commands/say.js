const { SlashCommandBuilder, MessageFlags, ChannelType } = require('discord.js');
const { isDev } = require('../utils/perms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something')
    .addStringOption((o) => o.setName('message').setDescription('What should I say? Use \\n for a new line').setRequired(true))
    .addChannelOption((o) => o.setName('channel').setDescription('Where to send it (defaults to here)').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)),
  async execute(interaction) {
    if (!isDev(interaction.member)) {
      return interaction.reply({ content: '❌ Only the Discord Developer role can use this.', flags: MessageFlags.Ephemeral });
    }
    const message = interaction.options.getString('message').replace(/\\n/g, '\n');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    try {
      // @everyone / @here are blocked; user and role mentions still work.
      await channel.send({ content: message, allowedMentions: { parse: ['users', 'roles'] } });
      return interaction.reply({ content: `✅ Sent in ${channel}.`, flags: MessageFlags.Ephemeral });
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: '❌ I could not send that message there.', flags: MessageFlags.Ephemeral });
    }
  },
};
