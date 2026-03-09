# Big Blue Mop — Website & CRM

> Perth Commercial Cleaning · bigbluemop.com.au

---

## Live Site

| URL | Description |
|---|---|
| [bigbluemop.com.au](https://bigbluemop.com.au) | Main website |
| [bigbluemop.com.au/checklist.html](https://bigbluemop.com.au/checklist.html) | Psychic Cleaner Checklist |

**Hosted on:** Netlify (auto-deploys from this repo, `main` branch)  
**DNS:** Netlify DNS via VentraIP nameservers  
**SSL:** Let's Encrypt (auto-renews)

---

## Repository Structure

```
bigbluemopcomau/
│
├── index.html              # Main website (dark theme)
├── checklist.html          # Psychic Cleaner Checklist (10-question audit)
├── style.css               # Brand stylesheet
├── app.js                  # Checklist logic + scroll animations
│
├── BBM_v14.html            # Big Blue Mop CRM (current version)
├── Code.gs                 # Google Apps Script backend
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

### Website → Checklist → CRM

1. Prospect visits **bigbluemop.com.au** and clicks "Get the Free Checklist"
2. They complete the **10-question Psychic Cleaner Audit** at `/checklist.html`
3. On submit, `app.js` POSTs the results to the **Google Apps Script** endpoint
4. The Apps Script (`Code.gs`) does three things:
   - Saves the submission to the **Google Sheet** ("BBM Checklist Submissions")
   - Sends an **instant alert email** to bigbluemop@gmail.com with score, tier, and contact details
   - Sends a **personalized results email** to the prospect (HOT / WARM / COLD)
5. Alex opens **BBM_v14.html**, clicks **Checklist Leads**, and imports the new lead into the CRM

### Scoring Tiers

| Tier | Meaning | Action |
|---|---|---|
| 🔴 HOT | Critical issues found | Call Alex immediately |
| 🟡 WARM | Gaps detected | Book a free walkthrough |
| 🟢 COLD | Looking good | Follow up in 30 days |

---

## Google Apps Script Setup

1. Open the Google Sheet **"BBM Checklist Submissions"**
2. Go to **Extensions → Apps Script**
3. Paste the full contents of `Code.gs`
4. **Deploy → New Deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL and update the `SCRIPT_URL` variable in `app.js`

**Current endpoint:**
```
https://script.google.com/macros/s/AKfycby6YUpOyr-ztBUrFaVynFwiVoYRGXvip7r9y5eKQl9-djHeK-wXxkQm8HennV33DSc8/exec
```

---

## Deployment

Every push to `main` auto-deploys to Netlify.

```bash
git add .
git commit -m "your message"
git push origin main
```

> ⚠️ Do NOT upload files directly through GitHub's web UI — it can overwrite the correct versions.

---

## CRM (BBM_v14.html)

- Open `BBM_v14.html` locally in any browser
- All data is stored in `localStorage` on your device
- Click **📋 Checklist Leads** to import new checklist submissions from the Google Sheet
- Stages: To Contact → Quoted → Follow Up → Won → Lost

---

*Last updated: March 2026*
