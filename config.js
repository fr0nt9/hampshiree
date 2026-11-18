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

  // How many tickets one person can have open at once
  MAX_TICKETS_PER_USER: 10,

  // Ticket categories (each ticket type opens under its own Discord category)
  TICKET_PARENTS: {
    staff_report: '1523012194441232508',
    management: '1523012194441232507',   // high rank tickets
    other: '1523012194441232509',
    general_support: '1523012193883525218',
  },

  // Channels
  TRANSCRIPT_CHANNEL_ID: '1523012192637685815',
  REGULATIONS_CHANNEL_ID: '1523440098761506887',
  SUPPORT_CHANNEL_ID: '1546923720407515166',
  SESSIONS_CHANNEL_ID: '1546923727134924862',

  // Links
  WHITELISTED_GROUP_URL: 'https://www.roblox.com/communities/473442062/Hampshire-County-Roleplay-Whitelisted#!/about',
  BLOXLINK_URL: 'https://blox.link/verify',
};
