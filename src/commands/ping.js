const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check whether the bot is online."),

  async execute(interaction) {
    await interaction.reply({
      content: `Pong! Bot latency: ${interaction.client.ws.ping}ms`,
      ephemeral: true
    });
  }
};
