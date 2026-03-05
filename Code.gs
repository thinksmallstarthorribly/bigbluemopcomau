/**
 * BIG BLUE MOP — Google Apps Script Backend
 * ==========================================
 * Handles Psychic Cleaner Checklist submissions from bigbluemop.com.au/checklist.html
 *
 * What this does:
 *   1. Receives POST request from the checklist form
 *   2. Saves the submission to a Google Sheet (auto-creates if missing)
 *   3. Sends Alex an instant email alert with full audit details
 *   4. Sends the prospect a personalised results email
 *   5. Returns a JSON response so the website can confirm success
 *
 * SETUP INSTRUCTIONS:
 *   1. Go to https://script.google.com
 *   2. Create a new project → name it "BBM Checklist Backend"
 *   3. Paste this entire file into the editor (replace any existing code)
 *   4. Click Deploy → New Deployment → Web App
 *   5. Set "Execute as" = Me, "Who has access" = Anyone
 *   6. Click Deploy → Copy the Web App URL
 *   7. Paste that URL back to the developer to wire up the website
 */

// ─── CONFIGURATION ───────────────────────────────────────────────────────────
var CONFIG = {
  ALEX_EMAIL:    "bigbluemop@gmail.com",
  SHEET_NAME:    "Checklist Submissions",
  BUSINESS_NAME: "Big Blue Mop",
  PHONE:         "0410 260 800"
};

// ─── CHECKLIST QUESTION LABELS ────────────────────────────────────────────────
var QUESTIONS = [
  "01 — Top of fridge, microwaves & high surfaces",
  "02 — Bin lids, inside and underneath",
  "03 — Behind toilet and around cistern",
  "04 — Underside of toilet bowl rim",
  "05 — Mirror edges and glass streak marks",
  "06 — Skirting boards and door frames",
  "07 — Light switches, door handles, high-touch surfaces",
  "08 — Shower screens, tile grout and wet area floors",
  "09 — Air vents, exhaust fans and ceiling corners",
  "10 — The smell test"
];

// ─── MAIN ENTRY POINT ─────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(raw);

    // Save to Google Sheet
    saveToSheet(data);

    // Send alert to Alex
    sendAlexAlert(data);

    // Send results to the prospect
    if (data.email) {
      sendProspectEmail(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("doPost error: " + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow GET for health check / CORS preflight
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "BBM Checklist Backend is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── SAVE TO GOOGLE SHEET ─────────────────────────────────────────────────────
function saveToSheet(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  // Create the sheet and headers if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    var headers = [
      "Timestamp",
      "Business Name",
      "Contact Name",
      "Email",
      "Phone",
      "Score (%)",
      "Tier",
      "Fails",
      "Unsures"
    ];
    QUESTIONS.forEach(function(q) { headers.push(q); });
    sheet.appendRow(headers);

    // Style the header row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#5BC8F5");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }

  // Build the row
  var answers = data.answers || {};
  var row = [
    new Date(),
    data.bizName     || "",
    data.contactName || "",
    data.email       || "",
    data.phone       || "",
    data.score       || 0,
    data.tier        || "",
    data.fails       || 0,
    data.unsures     || 0
  ];

  // Append each answer (q1 through q10)
  for (var i = 1; i <= 10; i++) {
    row.push(answers[i] || "");
  }

  sheet.appendRow(row);

  // Colour-code the tier cell (column 7)
  var lastRow   = sheet.getLastRow();
  var tierCell  = sheet.getRange(lastRow, 7);
  var scoreCell = sheet.getRange(lastRow, 6);

  if (data.tier === "HOT") {
    tierCell.setBackground("#FDEDEC").setFontColor("#E74C3C").setFontWeight("bold");
    scoreCell.setFontColor("#E74C3C").setFontWeight("bold");
  } else if (data.tier === "WARM") {
    tierCell.setBackground("#FEF9E7").setFontColor("#F39C12").setFontWeight("bold");
    scoreCell.setFontColor("#F39C12").setFontWeight("bold");
  } else {
    tierCell.setBackground("#EAFAF1").setFontColor("#27AE60").setFontWeight("bold");
    scoreCell.setFontColor("#27AE60").setFontWeight("bold");
  }
}

// ─── SEND ALERT EMAIL TO ALEX ─────────────────────────────────────────────────
function sendAlexAlert(data) {
  var tier    = data.tier    || "UNKNOWN";
  var score   = data.score   || 0;
  var fails   = data.fails   || 0;
  var unsures = data.unsures || 0;
  var biz     = data.bizName     || "Unknown Business";
  var contact = data.contactName || "Unknown";
  var email   = data.email       || "Not provided";
  var phone   = data.phone       || "Not provided";
  var answers = data.answers     || {};

  // Urgency label
  var urgency = tier === "HOT"  ? "🔴 URGENT — Call Today"
              : tier === "WARM" ? "🟡 Follow Up Within 48 Hours"
              :                   "🟢 Nurture — Run Again in 30 Days";

  // Build answer table rows
  var answerRows = "";
  for (var i = 1; i <= 10; i++) {
    var ans = answers[i] || "—";
    var colour = ans === "pass"   ? "#27AE60"
               : ans === "fail"   ? "#E74C3C"
               : ans === "unsure" ? "#F39C12"
               :                    "#666666";
    var label  = ans === "pass"   ? "✓ CLEAN"
               : ans === "fail"   ? "✗ DIRTY / BAD"
               : ans === "unsure" ? "? NOT SURE"
               :                    "—";
    answerRows +=
      "<tr>" +
        "<td style='padding:6px 10px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333'>" + QUESTIONS[i-1] + "</td>" +
        "<td style='padding:6px 10px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:bold;color:" + colour + "'>" + label + "</td>" +
      "</tr>";
  }

  var subject = "[BBM LEAD] " + tier + " — " + biz + " scored " + score + "%";

  var html =
    "<div style='font-family:Arial,sans-serif;max-width:620px;margin:0 auto'>" +

    // Header
    "<div style='background:#2c2c2c;padding:24px;text-align:center'>" +
      "<h1 style='color:#5BC8F5;font-size:22px;margin:0'>Big Blue Mop</h1>" +
      "<p style='color:#aaa;margin:6px 0 0;font-size:13px'>New Psychic Cleaner Checklist Submission</p>" +
    "</div>" +

    // Urgency banner
    "<div style='background:" + (tier==="HOT"?"#FDEDEC":tier==="WARM"?"#FEF9E7":"#EAFAF1") + ";padding:16px 24px;border-left:5px solid " + (tier==="HOT"?"#E74C3C":tier==="WARM"?"#F39C12":"#27AE60") + "'>" +
      "<p style='margin:0;font-size:16px;font-weight:bold;color:" + (tier==="HOT"?"#E74C3C":tier==="WARM"?"#F39C12":"#27AE60") + "'>" + urgency + "</p>" +
    "</div>" +

    // Score block
    "<div style='background:#f9f9f9;padding:20px 24px;border-bottom:1px solid #eee'>" +
      "<table style='width:100%;border-collapse:collapse'>" +
        "<tr>" +
          "<td style='text-align:center;padding:10px'>" +
            "<div style='font-size:48px;font-weight:bold;color:" + (score>=80?"#27AE60":score>=50?"#F39C12":"#E74C3C") + "'>" + score + "%</div>" +
            "<div style='font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px'>Cleaning Score</div>" +
          "</td>" +
          "<td style='text-align:center;padding:10px'>" +
            "<div style='font-size:32px;font-weight:bold;color:#E74C3C'>" + fails + "</div>" +
            "<div style='font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px'>Areas Failed</div>" +
          "</td>" +
          "<td style='text-align:center;padding:10px'>" +
            "<div style='font-size:32px;font-weight:bold;color:#F39C12'>" + unsures + "</div>" +
            "<div style='font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px'>Unsure</div>" +
          "</td>" +
          "<td style='text-align:center;padding:10px'>" +
            "<div style='font-size:32px;font-weight:bold;color:" + (tier==="HOT"?"#E74C3C":tier==="WARM"?"#F39C12":"#27AE60") + "'>" + tier + "</div>" +
            "<div style='font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px'>Tier</div>" +
          "</td>" +
        "</tr>" +
      "</table>" +
    "</div>" +

    // Contact details
    "<div style='padding:20px 24px;border-bottom:1px solid #eee'>" +
      "<h2 style='font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:0 0 12px'>Contact Details</h2>" +
      "<table style='width:100%;border-collapse:collapse'>" +
        "<tr><td style='padding:5px 0;font-size:13px;color:#666;width:120px'>Business</td><td style='padding:5px 0;font-size:14px;font-weight:bold;color:#222'>" + biz + "</td></tr>" +
        "<tr><td style='padding:5px 0;font-size:13px;color:#666'>Contact</td><td style='padding:5px 0;font-size:14px;font-weight:bold;color:#222'>" + contact + "</td></tr>" +
        "<tr><td style='padding:5px 0;font-size:13px;color:#666'>Email</td><td style='padding:5px 0;font-size:14px'><a href='mailto:" + email + "' style='color:#5BC8F5'>" + email + "</a></td></tr>" +
        "<tr><td style='padding:5px 0;font-size:13px;color:#666'>Phone</td><td style='padding:5px 0;font-size:14px'><a href='tel:" + phone.replace(/\s/g,"") + "' style='color:#5BC8F5'>" + phone + "</a></td></tr>" +
      "</table>" +
    "</div>" +

    // Answers table
    "<div style='padding:20px 24px'>" +
      "<h2 style='font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#999;margin:0 0 12px'>Full Audit Results</h2>" +
      "<table style='width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-radius:8px;overflow:hidden'>" +
        "<tr style='background:#f5f5f5'>" +
          "<th style='padding:8px 10px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px'>Check Point</th>" +
          "<th style='padding:8px 10px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px'>Result</th>" +
        "</tr>" +
        answerRows +
      "</table>" +
    "</div>" +

    // CTA
    "<div style='background:#2c2c2c;padding:20px 24px;text-align:center'>" +
      "<p style='color:#aaa;font-size:13px;margin:0 0 12px'>This lead was captured automatically by the Psychic Cleaner Checklist</p>" +
      "<a href='mailto:" + email + "' style='display:inline-block;background:#5BC8F5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:14px;margin:4px'>Reply to " + contact + "</a>" +
      "<a href='tel:" + phone.replace(/\s/g,"") + "' style='display:inline-block;background:#27AE60;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:14px;margin:4px'>Call " + phone + "</a>" +
    "</div>" +

    "</div>";

  MailApp.sendEmail({
    to:       CONFIG.ALEX_EMAIL,
    subject:  subject,
    htmlBody: html
  });
}

// ─── SEND RESULTS EMAIL TO PROSPECT ──────────────────────────────────────────
function sendProspectEmail(data) {
  var tier    = data.tier    || "UNKNOWN";
  var score   = data.score   || 0;
  var fails   = data.fails   || 0;
  var biz     = data.bizName     || "your business";
  var contact = data.contactName || "there";

  var tierColour = tier === "HOT"  ? "#E74C3C"
                 : tier === "WARM" ? "#F39C12"
                 :                   "#27AE60";
  var tierBg     = tier === "HOT"  ? "#FDEDEC"
                 : tier === "WARM" ? "#FEF9E7"
                 :                   "#EAFAF1";

  // Personalised message based on tier
  var headline, body, cta, ctaHref;

  if (tier === "HOT") {
    headline = "Your cleaning partner has a serious problem.";
    body     =
      "<p style='font-size:15px;color:#444;line-height:1.7'>Hi " + contact + ",</p>" +
      "<p style='font-size:15px;color:#444;line-height:1.7'>Your space at <strong>" + biz + "</strong> scored <strong style='color:#E74C3C'>" + score + "%</strong> with <strong>" + fails + " areas failing</strong> the Psychic Cleaner Checklist.</p>" +
      "<p style='font-size:15px;color:#444;line-height:1.7'>Those aren't just missed spots. They're the things your staff and customers are noticing — and eventually, the things that end up in Google reviews.</p>" +
      "<p style='font-size:15px;color:#444;line-height:1.7'>I've reviewed your results and I'd like to walk through your space personally. No obligation. Just 20 minutes to show you exactly what's being missed and what a proper clean looks like.</p>";
    cta     = "Book a Free Walkthrough";
    ctaHref = "mailto:bigbluemop@gmail.com?subject=" + encodeURIComponent("Walkthrough Request — " + biz);
  } else if (tier === "WARM") {
    headline = "Gaps detected. Here's what to watch.";
    body     =
      "<p style='font-size:15px;color:#444;line-height:1.7'>Hi " + contact + ",</p>" +
      "<p style='font-size:15px;color:#444;line-height:1.7'>Your space at <strong>" + biz + "</strong> scored <strong style='color:#F39C12'>" + score + "%</strong> on the Psychic Cleaner Checklist.</p>" +
      "<p style='font-size:15px;color:#444;line-height:1.7'>That's not a disaster — but <strong>" + fails + " areas came up short</strong>. These are the spots that build up quietly over time and eventually become the things clients and staff comment on.</p>" +
      "<p style='font-size:15px;color:#444;line-height:1.7'>If you'd like a second opinion on your current cleaning standard, I'm happy to come through and give you an honest assessment. No hard sell. Just a straight answer.</p>";
    cta     = "Request a Free Assessment";
    ctaHref = "mailto:bigbluemop@gmail.com?subject=" + encodeURIComponent("Assessment Request — " + biz);
  } else {
    headline = "Your space is in good shape. Keep it that way.";
    body     =
      "<p style='font-size:15px;color:#444;line-height:1.7'>Hi " + contact + ",</p>" +
      "<p style='font-size:15px;color:#444;line-height:1.7'>Your space at <strong>" + biz + "</strong> scored <strong style='color:#27AE60'>" + score + "%</strong> on the Psychic Cleaner Checklist. That's a solid result.</p>" +
      "<p style='font-size:15px;color:#444;line-height:1.7'>Standards slip when nobody is watching. Running this checklist monthly keeps your cleaning partner accountable — and gives you documented proof that the work is being done.</p>" +
      "<p style='font-size:15px;color:#444;line-height:1.7'>If your situation ever changes or you want to compare providers, we're always happy to come through and show you what Big Blue Mop looks like in practice.</p>";
    cta     = "Learn More About Big Blue Mop";
    ctaHref = "https://bigbluemop.com.au";
  }

  var subject = "Your Psychic Cleaner Checklist Results — " + score + "% (" + tier + ")";

  var html =
    "<div style='font-family:Arial,sans-serif;max-width:580px;margin:0 auto'>" +

    // Header
    "<div style='background:#2c2c2c;padding:28px;text-align:center'>" +
      "<h1 style='color:#5BC8F5;font-size:24px;margin:0;letter-spacing:-0.5px'>Big Blue Mop</h1>" +
      "<p style='color:#aaa;margin:6px 0 0;font-size:13px'>Perth Commercial Cleaning</p>" +
    "</div>" +

    // Score card
    "<div style='background:" + tierBg + ";padding:28px;text-align:center;border-bottom:3px solid " + tierColour + "'>" +
      "<div style='font-size:56px;font-weight:900;color:" + tierColour + ";line-height:1'>" + score + "%</div>" +
      "<div style='font-size:13px;color:#666;text-transform:uppercase;letter-spacing:2px;margin:6px 0 12px'>Your Cleaning Score</div>" +
      "<div style='display:inline-block;background:" + tierColour + ";color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:bold;letter-spacing:1px'>" + tier + " — " + headline + "</div>" +
    "</div>" +

    // Body
    "<div style='padding:28px'>" +
      body +
    "</div>" +

    // CTA
    "<div style='padding:0 28px 28px;text-align:center'>" +
      "<a href='" + ctaHref + "' style='display:inline-block;background:#5BC8F5;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;font-size:15px'>" + cta + "</a>" +
    "</div>" +

    // Footer
    "<div style='background:#f5f5f5;padding:18px 28px;text-align:center;border-top:1px solid #eee'>" +
      "<p style='font-size:12px;color:#999;margin:0'>" +
        "Big Blue Mop &mdash; Perth Commercial Cleaning &mdash; " +
        "<a href='tel:0410260800' style='color:#5BC8F5'>0410 260 800</a> &mdash; " +
        "<a href='mailto:bigbluemop@gmail.com' style='color:#5BC8F5'>bigbluemop@gmail.com</a>" +
      "</p>" +
      "<p style='font-size:11px;color:#bbb;margin:6px 0 0'>You completed the Psychic Cleaner Checklist at bigbluemop.com.au</p>" +
    "</div>" +

    "</div>";

  MailApp.sendEmail({
    to:       data.email,
    subject:  subject,
    htmlBody: html,
    replyTo:  CONFIG.ALEX_EMAIL,
    name:     "Alex — Big Blue Mop"
  });
}
