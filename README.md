# Discord Bot Starter — GitHub + Railway

A small Discord.js v14 starter with slash-command loading and a `/ping` example.

## 1. Create your Discord application

1. Open the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create an application, then open **Bot** and create/reset its bot token.
3. Copy the **Application ID** from **General Information**.
4. Under **OAuth2 → URL Generator**, select `bot` and `applications.commands`.
5. Give it the permissions your bot needs, generate the URL and invite it to your server.

Keep the bot token private. If it is ever exposed, reset it in the Developer Portal.

## 2. Configure locally (optional)

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Fill in `DISCORD_TOKEN`, `CLIENT_ID`, and optionally `GUILD_ID`.
5. Register slash commands with `npm run deploy`.
6. Start the bot with `npm start`.

If `GUILD_ID` is set, commands register to that server and usually appear quickly. If it is blank, commands register globally and may take longer to appear.

## 3. Push to GitHub

Upload the project files to a GitHub repository. Do **not** upload `.env`; it is excluded by `.gitignore`.

## 4. Deploy on Railway

1. Sign in to [Railway](https://railway.com/).
2. Create a new project and choose **Deploy from GitHub repo**.
3. Select your bot repository.
4. Open the service's **Variables** panel and add:
   - `DISCORD_TOKEN` — your bot token
   - `CLIENT_ID` — your Discord application ID
   - `GUILD_ID` — optional test server ID
5. Railway should detect Node.js and run `npm start`. The included `railway.json` also sets the start command.
6. Check the deployment logs. You should see `Ready! Logged in as ...`.

The bot must remain a running service; do not deploy it as a static website.

## 5. Register or update slash commands

When you add or change commands, run `npm run deploy` from your computer with the same environment variables configured in `.env`.

Alternatively, you can temporarily set Railway's start command to `npm run deploy`, deploy once, then change it back to `npm start`. Do not leave the service running the deploy script: it exits after registering commands.

## Adding a command

Create a file in `src/commands/`, following `src/commands/ping.js`. Export:
- `data`: a `SlashCommandBuilder`
- `execute(interaction, client)`: the command handler

Then run `npm run deploy` again. Railway will redeploy the bot when you push code changes to the connected GitHub branch.
