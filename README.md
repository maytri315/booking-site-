# Booking Form App
https://maytri315.github.io/booking-site-/
A lightweight web app to submit booking details to a Google Sheet via a form, featuring a loader, modal, and smooth scrolling.

---

## Features
- Form submission to Google Sheets
- Loader animation on page load
- Modal popup for form input
- Smooth scrolling navigation
- "Done" popup on success

---

## Setup
1. **Clone the Repo**:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Run Locally**:
   - Install and start a server:
     ```bash
     npm install -g serve
     npx serve
     ```
   - Visit `http://localhost:3000`.

3. **Google Apps Script**:
   - Create a script at [script.google.com](https://script.google.com):
     ```javascript
     function doPost(e) {
       var sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getActiveSheet();
       sheet.appendRow([new Date(), e.parameter.name, e.parameter.email]);
       return ContentService.createTextOutput('Success');
     }
     ```
   - Deploy as a Web App ("Anyone" access) and update `scriptURL` in `practjava.js`.

---

## Usage
- Open the site, click to launch the form modal, submit data, and check your Google Sheet.

---

## Tech Stack
- HTML, CSS, JavaScript
- Google Apps Script
- Fetch API

---

## Contributing
Fork, branch, commit, and submit a PR—easy peasy!

---
