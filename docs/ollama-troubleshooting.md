# Ollama Troubleshooting Guide
## "Ollama Not Found" Solutions

---

## 🔍 Step 1: Verify Ollama is Installed

### Windows
```powershell
# Check if ollama command exists
ollama --version

# Or check if installed
where ollama
# Should show: C:\Program Files\Ollama\ollama.exe
```

### macOS/Linux
```bash
# Check if installed
which ollama
# Should show: /usr/local/bin/ollama or similar

# Check version
ollama --version
```

**If not installed:** Download from https://ollama.com/download

---

## 🚀 Step 2: Start Ollama Server

### Method A: Using Command Line (Recommended)

**Windows:**
```powershell
# Open PowerShell or CMD
ollama serve

# You should see:
# time=... level=INFO msg="listening on 127.0.0.1:11434"
```

**macOS/Linux:**
```bash
# Open Terminal
ollama serve

# Or if installed as service:
sudo systemctl start ollama
```

### Method B: Using GUI (If Available)

- **Windows:** Look for "Ollama" in Start Menu → Click to start
- **macOS:** Look for Ollama in Applications → Double-click
- Tray icon should appear when running

---

## 🧪 Step 3: Test Ollama is Running

### Browser Test
Open this URL in your browser:
```
http://localhost:11434/api/tags
```

**Should show:** JSON list of installed models
```json
{"models":[{"name":"llama3.2:latest",...}]}
```

**If browser shows error:** Ollama server not running

### Command Line Test
```bash
# List models
curl http://localhost:11434/api/tags

# Or using Ollama CLI
ollama list
```

---

## 📦 Step 4: Download a Model

```bash
# Small, fast model (recommended for testing)
ollama pull llama3.2

# Or other models
ollama pull mistral
ollama pull qwen2.5
ollama pull phi3
```

**Wait for download to complete** (progress shown in terminal)

---

## 🔧 Step 5: Fix CORS Issues (Critical)

### The Problem
When opening `PromptLense.html` directly (file://), browsers block requests to localhost due to CORS security.

### Solution A: Serve PromptLens via HTTP (Easiest)

**Option 1: Python (if installed)**
```bash
# In the folder with PromptLense.html
python -m http.server 8000

# Then open: http://localhost:8000/PromptLense.html
```

**Option 2: Node.js (if installed)**
```bash
npx serve .

# Opens at http://localhost:3000
```

**Option 3: PHP (if installed)**
```bash
php -S localhost:8000
```

**Option 4: VS Code**
- Install "Live Server" extension
- Right-click PromptLense.html → "Open with Live Server"

### Solution B: Configure Ollama CORS

**Windows (PowerShell):**
```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

**macOS/Linux:**
```bash
export OLLAMA_ORIGINS="*"
ollama serve
```

Or set permanently:
```bash
# Add to ~/.bashrc or ~/.zshrc
export OLLAMA_ORIGINS="*"
```

### Solution C: Browser Flags (Not Recommended for Daily Use)

**Chrome/Chromium:**
```bash
# Disable CORS (use only for testing)
chrome --disable-web-security --user-data-dir=/tmp/chrome-dev
```

---

## 🐛 Common Errors & Fixes

### Error: "Ollama not found" in browser, but CLI works

**Cause:** CORS blocking  
**Fix:** Use Solution A or B above

### Error: "Failed to fetch" in console

**Check:**
1. Ollama running? `curl http://localhost:11434/api/tags`
2. Correct port? Should be 11434
3. Firewall blocking? Try disabling temporarily

### Error: "Model not found"

**Fix:** Download a model first
```bash
ollama pull llama3.2
```

### Error: "Connection refused"

**Check:**
1. Is Ollama running? Look for terminal with "listening on 127.0.0.1:11434"
2. Wrong URL? Should be `http://localhost:11434` not `https`

---

## ✅ Quick Diagnostic Script

Save this as `test-ollama.html` and open it:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Ollama Test</h1>
  <div id="status">Checking...</div>
  <button onclick="testOllama()">Test Connection</button>
  <pre id="result"></pre>
  
  <script>
    async function testOllama() {
      const status = document.getElementById('status');
      const result = document.getElementById('result');
      
      try {
        status.textContent = 'Connecting to http://localhost:11434...';
        const response = await fetch('http://localhost:11434/api/tags', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          status.textContent = '✅ Ollama is running!';
          status.style.color = 'green';
          result.textContent = 'Models installed:\n' + 
            data.models.map(m => `- ${m.name}`).join('\n');
        } else {
          status.textContent = '❌ Error: ' + response.status;
          status.style.color = 'red';
        }
      } catch (e) {
        status.textContent = '❌ Cannot connect to Ollama';
        status.style.color = 'red';
        result.textContent = 'Error: ' + e.message + '\n\n' +
          'Troubleshooting:\n' +
          '1. Is Ollama installed? Run: ollama --version\n' +
          '2. Is Ollama running? Run: ollama serve\n' +
          '3. Is CORS configured? Run: OLLAMA_ORIGINS="*" ollama serve\n' +
          '4. Try serving this file via HTTP, not file://';
      }
    }
    
    testOllama();
  </script>
</body>
</html>
```

---

## 🎯 Minimal Working Setup

### Windows Step-by-Step

1. **Install Ollama**
   - Download from https://ollama.com/download
   - Run installer

2. **Download a model**
   ```powershell
   ollama pull llama3.2
   ```

3. **Start Ollama with CORS enabled**
   ```powershell
   $env:OLLAMA_ORIGINS="*"
   ollama serve
   ```

4. **Serve PromptLens**
   ```powershell
   # In folder with PromptLense.html
   python -m http.server 8000
   ```

5. **Open browser**
   - Go to: `http://localhost:8000/PromptLense.html`
   - NOT `file:///...` (that causes CORS issues)

### macOS/Linux Step-by-Step

1. **Install Ollama**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Download a model**
   ```bash
   ollama pull llama3.2
   ```

3. **Start Ollama with CORS enabled**
   ```bash
   export OLLAMA_ORIGINS="*"
   ollama serve
   ```

4. **Serve PromptLens**
   ```bash
   # In folder with PromptLense.html
   python3 -m http.server 8000
   ```

5. **Open browser**
   - Go to: `http://localhost:8000/PromptLense.html`

---

## 🚫 Skip Ollama Entirely

If you don't want to deal with Ollama setup, **PromptLens works without it**:

- ✅ Pattern detection works
- ✅ Scoring works (learned/heuristic)
- ✅ Feedback collection works
- ✅ Multi-goal comparison works
- ✅ Confidence intervals work

**Only missing:** The "🧠 Analyze Output" button (uses Ollama)

---

## 🆘 Still Not Working?

### Checklist

- [ ] Ollama installed? (`ollama --version`)
- [ ] Ollama running? (terminal shows "listening on 127.0.0.1:11434")
- [ ] Model downloaded? (`ollama list` shows models)
- [ ] CORS enabled? (`OLLAMA_ORIGINS="*"`)
- [ ] Using HTTP server? (not file://)
- [ ] Correct URL? (`http://localhost:11434`)
- [ ] No firewall blocking? (try disabling temporarily)

### Get Help

```bash
# Check Ollama logs
ollama serve 2>&1 | tee ollama.log

# Check what port Ollama is using
lsof -i :11434  # macOS/Linux
netstat -ano | findstr 11434  # Windows
```

---

## 📊 Working Configuration Summary

| Component | Status | Test Command |
|-----------|--------|--------------|
| Ollama installed | ✅ | `ollama --version` |
| Ollama running | ✅ | `curl http://localhost:11434/api/tags` |
| Model downloaded | ✅ | `ollama list` |
| CORS enabled | ✅ | `OLLAMA_ORIGINS="*"` |
| HTTP serving | ✅ | `python -m http.server 8000` |
| Browser accessing | ✅ | `http://localhost:8000/PromptLense.html` |

**All must be ✅ for Ollama integration to work.**
