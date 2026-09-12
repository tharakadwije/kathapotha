# Letters to Akie — the comments service

A small Cloudflare Worker that keeps the letters readers send from the story pages. The website itself
stays static on GitHub Pages; only this little service stores anything.

**Nothing a reader writes appears on the site until you approve it.**

Free on Cloudflare's free plan: 100,000 requests a day and a 5 GB database, far beyond what this site needs.

## Set it up once (about 15 minutes)

You need a free account at https://dash.cloudflare.com/sign-up, and Node.js on the computer.
Run everything below inside this `worker` folder.

1. **Sign in** (opens a browser window):

       npx wrangler login

2. **Create the database** and copy the `database_id` it prints into `wrangler.toml`:

       npx wrangler d1 create read-aloud-comments

3. **Create the table**:

       npx wrangler d1 execute read-aloud-comments --remote --file=schema.sql

4. **Choose a moderation password.** Any long phrase you'll remember; it is what keeps other people off
   your moderation page:

       npx wrangler secret put ADMIN_TOKEN

5. *(Optional)* **Get a ping when a letter arrives.** In Discord: Server settings → Integrations →
   Webhooks → New webhook → Copy URL. Then:

       npx wrangler secret put NOTIFY_WEBHOOK

6. **Publish it**:

       npx wrangler deploy

   It prints an address like `https://read-aloud-comments.your-name.workers.dev`.

7. **Tell the website about it.** Put that address in `assets/library.js`:

       comments: "https://read-aloud-comments.your-name.workers.dev",

   Bump the `?v=` date on the asset links (see `.genAiDoc/development-style.md`), then commit, push and
   merge. The letters panel appears at the bottom of every story page.

## Reading and approving letters

Open, using your own password:

    https://read-aloud-comments.your-name.workers.dev/admin?token=YOUR_PASSWORD

Letters waiting for you are at the top. **Show on the site** publishes one; **Delete** removes it for good.
Bookmark that address. Keep the password private — anyone who has it can approve letters.

## Changing it later

Edit `src/index.js`, then run `npx wrangler deploy` again. To try changes safely first:

    npx wrangler d1 execute read-aloud-comments --local --file=schema.sql
    npx wrangler dev --local

and add `http://localhost:8080` to `ALLOWED_ORIGINS` in `wrangler.toml` while testing.

## What is stored

The story id, the first name typed, the message, the date, and a one-way hash of the sender's IP address
(used only to stop someone flooding the site, and impossible to turn back into an address). No accounts,
no cookies, no tracking. To remove a letter completely, delete it on the moderation page.
