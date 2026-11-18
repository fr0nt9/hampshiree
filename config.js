require('dotenv').config();

module.exports = {
  TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID || null,
  TICKET_CATEGORY_ID: process.env.TICKET_CATEGORY_ID || null,

  SERVER_NAME: 'PRE RELEASE | Hampshire County Roleplay',
  COLOR: 0x2b4c8c,

  // Roles
  STAFF_ROLE_ID: '1546954610315370626',      // can see/claim/unclaim/close tickets
  DEV_ROLE_ID: '1546972551446536233',        // /say + posting panels

  // Channels
  TRANSCRIPT_CHANNEL_ID: '1523012192637685815',
  REGULATIONS_CHANNEL_ID: '1523440098761506887',
  SUPPORT_CHANNEL_ID: '1546923720407515166',
  SESSIONS_CHANNEL_ID: '1546923727134924862',

  // Links
  WHITELISTED_GROUP_URL: 'https://www.roblox.com/communities/473442062/Hampshire-County-Roleplay-Whitelisted#!/about',
  BLOXLINK_URL: 'https://blox.link/verify',
};
