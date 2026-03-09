# Repository Cleanup Log

## Summary

The repo accumulated old/unused files from manual uploads through the GitHub web UI and earlier development versions. This document records what was removed, why, and what replaced it.

---

## Files Removed

| File | Reason |
|---|---|
| `BBM_v11.html` | Old CRM version — superseded by v14 |
| `BBM_v12.html` | Old CRM version — superseded by v14 |
| `BigBlueMop_CRM_v8.html` | Old CRM version — superseded by v14 |
| `BigBlueMop_CRM_v9.html` | Old CRM version — superseded by v14 |
| `BigBlueMop_CRM_v10.html` | Old CRM version — superseded by v14 |
| `netlify/functions/checklist-submit.js` | Replaced by Google Apps Script backend (`Code.gs`) |
| `netlify/functions/checklist-responses.js` | Replaced by Google Apps Script backend (`Code.gs`) |
| `netlify.toml` | No longer needed — static site with no Netlify functions |
| `package.json` | No longer needed — no npm dependencies for static site |

---

## Why Netlify Functions Were Removed

The original plan used Netlify Functions (Node.js serverless) with `nodemailer` and `@netlify/blobs` to handle checklist submissions. This was replaced with a **Google Apps Script** backend because:

- No SMTP credentials required
- Submissions automatically log to a Google Sheet
- Easier to manage from a phone or iPad
- No Node.js dependencies or `npm install` build step
- Works reliably without a paid Netlify plan

---

## What Replaced Each Removed File

| Removed | Replaced By |
|---|---|
| `netlify/functions/checklist-submit.js` | `Code.gs` (Google Apps Script) |
| `netlify/functions/checklist-responses.js` | Google Sheet ("BBM Checklist Submissions") |
| `netlify.toml` | Not needed — Netlify auto-detects static sites |
| `package.json` | Not needed — no build step |
| `BBM_v11/v12/v8/v9/v10.html` | `BBM_v14.html` (current CRM) |

---

## Files Kept

| File | Purpose |
|---|---|
| `index.html` | Main dark-theme website |
| `checklist.html` | Psychic Cleaner Checklist |
| `style.css` | Brand stylesheet (dark `#2c2c2c`, blue `#5BC8F5`) |
| `app.js` | Checklist logic, scroll animations, Apps Script POST |
| `BBM_v14.html` | Current CRM (localStorage-based, import from Sheet) |
| `Code.gs` | Google Apps Script backend source code |
| All logos & favicons | Brand assets |
| `README.md` | Project documentation |

---

## Issue: Light-Background Index Uploaded via GitHub UI

On **5 March 2026**, a light-background `index.html` (white `#fff` background) was uploaded directly through GitHub's web interface (commit `c43baae — "Add files via upload"`). This overwrote the correct dark-theme version and caused the live site to display incorrectly.

**Fix applied (9 March 2026):** The correct dark-theme `index.html` was restored from commit `ff7487f` and pushed to `main` (commit `252a7ba`).

> ⚠️ **Never upload files directly through GitHub's web UI.** Always push changes through the terminal or this assistant to avoid overwriting the correct versions.

---

## Cleanup Date

**9 March 2026**
