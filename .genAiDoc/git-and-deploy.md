# Git & Deploy (GitHub Pages)

Steps to publish and maintain `readaloudakie.com` via GitHub Pages:

1) Repository
- Ensure repo `kathapotha` contains the site files at the root, including `CNAME` with `readaloudakie.com`.
- Add `.nojekyll` to disable Jekyll processing for static files.

2) Git remotes & pushing
- Keep a remote named `new-origin` pointing to `https://github.com/tharakadwije/kathapotha` (or rename as needed).
- Use `git push new-origin main` to update the site.

3) DNS (GoDaddy)
- Remove GoDaddy Website Builder A records and any forwarding.
- Add A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` for `@`.
- Add `www` as CNAME to `tharakadwije.github.io`.
- Optionally add AAAA records for IPv6.

4) Domain verification (GitHub)
- In account Pages settings add domain and copy the TXT record; add it in GoDaddy DNS and click Verify.

5) HTTPS
- After DNS verification, enable `Enforce HTTPS` in repository Pages settings.

6) Releases
- Tag releases if needed. Pages serves the `main` branch by default unless configured otherwise.
