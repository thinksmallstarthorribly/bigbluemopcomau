# Big Blue Mop — Website & CRM

> Perth Commercial Cleaning · bigbluemop.com.au

---

## Live Site

| URL | Description |
|---|---|
| [bigbluemop.com.au](https://bigbluemop.com.au) | Main website |
| [bigbluemop.com.au/checklist.html](https://bigbluemop.com.au/checklist.html) | Psychic Cleaner Checklist |

**Hosted on:** GitHub Pages, published from the `main` branch  
**Custom domain:** `bigbluemop.com.au`, set in the `CNAME` file  
**DNS:** VentraIP. The apex has A records pointing at GitHub Pages. `www` is a CNAME to `thinksmallstarthorribly.github.io`.  
**HTTPS:** enforced by GitHub Pages

---

## Repository Structure

```
bigbluemopcomau/
│
├── index.html              # Main website (dark theme)
├── checklist.html          # Psychic Cleaner Checklist (10-question audit)
├── style.css               # Brand stylesheet
├── app.js                  # Checklist logic + scroll animations
├── CNAME                   # GitHub Pages custom domain (bigbluemop.com.au)
│
├── BBM_v14.html            # Big Blue Mop CRM (current version)
├── Code.gs                 # Historical Apps Script copy (not the deployed script)
│
├── logo-wordmark.png       # Full logo with text
├── logo-icon.png           # Icon only
├── logo-icon-transparent.png  # Icon with transparent background
├── apple-touch-icon.png    # iOS home screen icon
├── favicon.ico             # Browser favicon
├── favicon-16x16.png       # Favicon 16px
├── favicon-32x32.png       # Favicon 32px
├── favicon-48x48.png       # Favicon 48px
├── favicon-64x64.png       # Favicon 64px
├── favicon-96x96.png       # Favicon 96px
├── favicon-128x128.png     # Favicon 128px
├── favicon-180x180.png     # Favicon 180px
├── favicon-192x192.png     # Favicon 192px
├── favicon-256x256.png     # Favicon 256px
├── favicon-512x512.png     # Favicon 512px
│
├── README.md               # This file
└── CLEANUP.md              # Repo cleanup log
```

---

## Brand

| Token | Value |
|---|---|
| Background | `#2c2c2c` (dark charcoal) |
| Blue accent | `#5BC8F5` |
| Fonts | Baloo 2 (headings), Nunito (body) |

---

## How It Works

### Website → Checklist → Sheet

1. Prospect visits **bigbluemop.com.au** and clicks "Get the Free Checklist"
2. They complete the **10-question Psychic Cleaner Audit** at `/checklist.html`
3. On submit, `app.js` POSTs the results to the live **Google Apps Script** web app (`BBM_BACKEND`)
4. That deployment writes the submission to the Google Sheet **Big Blue Mop - Psychic Cleaner Checklist Leads** and sends an alert email to bigbluemop@gmail.com

`Code.gs` in this repository is an older copy. It does not match the deployed Apps Script. The deployed version is newer.

### Scoring Tiers

| Tier | Meaning | Action |
|---|---|---|
| 🔴 HOT | Critical issues found | Call Alex immediately |
| 🟡 WARM | Gaps detected | Book a free walkthrough |
| 🟢 COLD | Looking good | Follow up in 30 days |

---

## Checklist backend

Live web app (the `BBM_BACKEND` value in `app.js`):

```
https://script.google.com/macros/s/AKfycbywW8hzVTXyujtyCPfqjhZ6I3u_6tVRGihtvQ6CRO6E69dv4RZVXMsLIN3QjWmfj7hfig/exec
```

Submissions are written to the Google Sheet **Big Blue Mop - Psychic Cleaner Checklist Leads**. The same deployment alerts **bigbluemop@gmail.com**.

`Code.gs` is kept as a historical reference. Do not paste it over the deployed Apps Script project, and do not replace `BBM_BACKEND` with a deployment of this file.

---

## Publishing

GitHub Pages publishes this static site from `main`. A push to `main` updates https://bigbluemop.com.au. The custom domain is the contents of `CNAME` (`bigbluemop.com.au`). DNS stays at VentraIP: apex A records point at GitHub Pages, and `www` is a CNAME to `thinksmallstarthorribly.github.io`.

```bash
git add .
git commit -m "your message"
git push origin main
```

> ⚠️ Do NOT upload files directly through GitHub's web UI — it can overwrite the correct versions. On 5 March 2026 a web upload replaced the dark-theme homepage. See `CLEANUP.md`.

---

## CRM (BBM_v14.html)

- Open `BBM_v14.html` locally in any browser
- All data is stored in `localStorage` on your device
- Stages: To Contact → Quoted → Follow Up → Won → Lost

---

*Last updated: 25 November 2026*
