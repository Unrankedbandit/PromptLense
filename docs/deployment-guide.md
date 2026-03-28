# PromptLens v1.2 Deployment Guide
## Single-File Distribution

---

## ✅ YES - It Works as a Single File

**Everything is self-contained:**
- ✅ All CSS is inline (`<style>` tags)
- ✅ All JavaScript is inline (`<script>` tags)
- ✅ No external CDN dependencies
- ✅ No build step required
- ✅ No npm packages
- ✅ Works from `file://` protocol

---

## 📦 What's Included in PromptLense.html

| Component | Location | Size (approx) |
|-----------|----------|---------------|
| HTML structure | Lines 1-680 | ~25 KB |
| CSS styles | Lines 7-660 | ~30 KB |
| Rule definitions | Lines 652-1115 | ~50 KB |
| JavaScript logic | Lines 1119+ | ~80 KB |
| **TOTAL** | **Single file** | **~185 KB** |

---

## 🚀 Distribution Methods

### Method 1: Direct File Share (Easiest)

```bash
# Just send the file
email: "Here's PromptLens - open PromptLense.html in your browser"
discord: Upload PromptLense.html
usb: Copy to flash drive
```

**User experience:**
1. Save `PromptLense.html` to desktop
2. Double-click to open in browser
3. Works immediately (no install)

### Method 2: GitHub Pages (Free Hosting)

```bash
# 1. Create repo
git init promptlens
cd promptlens
cp /path/to/PromptLense.html .
git add PromptLense.html
git commit -m "v1.2"
git push origin main

# 2. Enable GitHub Pages in repo settings
# 3. Site live at: https://yourname.github.io/promptlens/
```

### Method 3: Netlify/Vercel (Free, Custom Domain)

```bash
# Just drag PromptLense.html to Netlify deploy window
# Or:
ncp PromptLense.html dist/
netlify deploy --prod --dir=dist
```

### Method 4: Encoded Data URL (Extreme Portability)

```javascript
// Convert HTML to data URL for embedding anywhere
const htmlContent = fs.readFileSync('PromptLense.html', 'base64');
const dataUrl = `data:text/html;base64,${htmlContent}`;
// Share this massive URL - works when pasted in browser
```

---

## ⚠️ Limitations When Distributing

### 1. Ollama Integration (Requires Separate Setup)

**Problem:** Ollama runs on `localhost:11434`  
**Impact:** Recipient needs their own Ollama instance  
**Solution:** Include setup instructions

```markdown
## For Ollama Support (Optional):

1. Install Ollama: https://ollama.com
2. Run: `ollama pull llama3.2`
3. Run: `ollama serve`
4. Refresh PromptLens
```

### 2. CORS Issues (file:// to localhost)

**Problem:** Browsers block fetch from `file://` to `http://localhost`  
**Symptoms:** Ollama button shows "not found" even when running  
**Solutions:**

**Option A: Serve via local server (Recommended)**
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

**Option B: Configure Ollama CORS**
```bash
# Set env var before running Ollama
export OLLAMA_ORIGINS="*"
ollama serve
```

**Option C: Browser flag (Chromium)**
```bash
# Disable security (NOT recommended for regular use)
chrome --disable-web-security --user-data-dir=/tmp/chrome-dev
```

### 3. Data Is Local Only

**Problem:** Feedback data stored in recipient's browser  
**Impact:** Each user starts with empty dataset  
**Solution:** Provide seed data or instructions

```javascript
// Include seed dataset in the HTML (optional)
const SEED_DATA = {
  feedback: [/* pre-collected ratings */],
  weights: { /* pre-trained weights */ }
};

// Auto-import on first load
if (!localStorage.getItem('promptLensFeedback')) {
  importFeedbackData(JSON.stringify(SEED_DATA));
}
```

---

## 🔒 Security Considerations

### Safe to Distribute Because:
- ✅ No external network requests (except Ollama localhost)
- ✅ No tracking/analytics
- ✅ No cookies
- ✅ All data stays in user's browser
- ✅ No server-side code

### User Should Know:
- Data stored in browser localStorage (cleared if they clear browser data)
- Ollama integration sends prompts to local LLM (never leaves machine)
- No cloud sync (manual export/import required to transfer data)

---

## 📋 Pre-Distribution Checklist

Before sending `PromptLense.html`:

- [ ] Test by opening file directly in browser (double-click)
- [ ] Verify all 5 goals work (Efficient, Creative, Programmatic, Bug Fix, Goal-Oriented)
- [ ] Test multi-goal comparison mode
- [ ] Test feedback buttons (👍/👎)
- [ ] Verify learned scoring shows confidence intervals
- [ ] Check console for errors (F12)

---

## 🎯 Quick Test for Recipients

Include this in your message:

```markdown
## Quick Test:

1. Save `PromptLense.html` to desktop
2. Double-click to open
3. Type: "Write a JSON response with 3 items"
4. You should see:
   - Score ring with number
   - "JSON" highlighted in green
   - "3" highlighted as constraint
   - Feedback buttons (👍 👎)

## For Advanced Features (Optional):

Install Ollama for AI-powered analysis:
https://ollama.com/download

Then click "🧠 Analyze Output" button
```

---

## 📦 Version Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 80+ | ✅ Full |
| Firefox | 75+ | ✅ Full |
| Safari | 13+ | ✅ Full |
| Edge | 80+ | ✅ Full |
| Mobile Chrome | 80+ | ✅ Limited (UI not optimized) |
| IE11 | - | ❌ Not supported |

---

## 🐛 Common Issues When Sharing

### Issue: "Page is blank"
**Cause:** File didn't save completely  
**Fix:** Re-download, check file size (~185 KB)

### Issue: "Buttons don't work"
**Cause:** JavaScript disabled  
**Fix:** Enable JavaScript in browser settings

### Issue: "Ollama not found"
**Cause:** Ollama not installed/running OR CORS blocked  
**Fix:** See "CORS Issues" section above

### Issue: "Scores reset when I reopen"
**Cause:** localStorage cleared or private browsing  
**Fix:** Use regular browsing mode, don't clear data

---

## 🎁 Bonus: Create a "Portable" Version

For ultimate portability, embed everything in a single HTML with no external dependencies:

```html
<!-- Already done in v1.2! -->
<!-- Just send PromptLense.html - nothing else needed -->
```

**Optional enhancement** - Self-contained Ollama check:
```javascript
// Already included: Graceful degradation when Ollama offline
// Shows friendly error instead of crashing
```

---

## 📊 File Size Optimization (Optional)

If 185 KB is too large:

```bash
# Minify HTML (reduces ~30%)
npx html-minifier PromptLense.html -o index.min.html \
  --collapse-whitespace \
  --remove-comments \
  --minify-css \
  --minify-js

# Gzip for transfer (reduces ~70%)
gzip -c PromptLense.html > PromptLense.html.gz
# Recipient unzips before use
```

---

## ✅ Final Answer

**YES - `PromptLense.html` is completely self-contained and will work when sent as a single file.**

The recipient just needs to:
1. Save the file
2. Open it in any modern browser
3. Everything works immediately

**Optional:** For Ollama integration, they need to:
1. Install Ollama separately
2. Run `ollama serve`
3. (May need CORS config if opening via `file://`)

**Bottom line:** Core functionality works out-of-the-box. Advanced features (Ollama) require minimal setup.
