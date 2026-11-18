# High Rock Border Roleplay Bot

Slash commands (all panel commands are restricted to the Discord Dev role or Administrators):

| Command | What it does |
|---|---|
| `/support` | Posts the ticket panel (Staff Report, General Support, Management, Other + Ticket ToS) |
| `/regulations` | Posts the regulations panel (rules dropdown + restricted firearms / roleplays / vehicles) |
| `/dashboard` | Posts the info dashboard with channel and whitelisted group links |
| `/verify` | Posts the Bloxlink verification panel |
| `/say` | Dev role only. Makes the bot send a message (`\n` = new line) |

Tickets: private channel per user, staff role only can **Claim / Unclaim / Close**.
On close, an HTML transcript is posted in the transcripts channel (and DM'd to the opener if their DMs are open).

## Setup
1. Push this folder to GitHub (repo root = this folder).
2. Railway: new project from the repo, then add Variables:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID` (recommended: your server ID, commands appear instantly)
   - `TICKET_CATEGORY_ID` (optional: category to create tickets in)
3. Railway start command: `npm start` (default).
4. Invite the bot with scopes `bot` + `applications.commands` and permissions: View Channels, Send Messages,
   Manage Channels, Embed Links, Attach Files, Read Message History. No privileged intents are needed.
5. Make sure the bot can see + send in the transcripts channel.
6. Run `/support`, `/regulations`, `/dashboard`, `/verify` in the channels you want the panels in.

## Customising
- IDs, links, colours: `config.js`
- Rules / restricted lists: `data/regulations.js`
- Banners: `assets/*.png` (swap in your own images with the same filenames, 1200x420 works well).
  `python3 tools/make_banners.py` regenerates the default green ones.
