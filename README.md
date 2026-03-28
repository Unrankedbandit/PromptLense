# PromptLense 🔍

**Real-Time Prompt Structure Analyzer for LLMs**

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](./)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Status](https://img.shields.io/badge/status-production--ready-success.svg)](./)

PromptLense is a browser-based tool that analyzes LLM prompts in real-time, providing instant feedback on prompt structure, quality scoring, and optimization suggestions across multiple goals.

![PromptLense Screenshot](./docs/assets/screenshot.png)

## ✨ Features

### Core Capabilities
- **🔍 Pattern Detection** - Identifies high-impact words, constraints, filler words, and context clues
- **📊 Quality Scoring** - Real-time scoring with confidence intervals based on learned user preferences
- **🎯 Multi-Goal Analysis** - Compare prompts across 5 optimization goals:
  - **Efficient** - Minimize tokens while preserving intent
  - **Creative** - Maximize evocative, aesthetic language
  - **Programmatic** - Optimize for code generation
  - **Bug Fix** - Focus on debugging and error correction
  - **Goal-Oriented** - Emphasize task completion clarity

### Learning & Feedback
- **👍/👎 Feedback System** - Train the model with your preferences
- **Confidence Intervals** - See uncertainty ranges (e.g., "75 (68-82)")
- **Online Learning** - Model adapts every 30 seconds based on your feedback
- **Local Storage** - All data stays on your device

### AI Integration (Optional)
- **Ollama Support** - Optional AI-powered analysis via local Ollama instance
- **Bias Mitigation** - Position swap and multi-sample aggregation for fair judging

## 🚀 Quick Start

### Option 1: Direct Open (Easiest)
```bash
# Just double-click the file
PromptLense.html
```

### Option 2: Windows Launcher (Recommended)
```bash
# Double-click launch.bat
launch.bat
```

### Option 3: With Ollama Support
```bash
# Requires Ollama installed
start.bat
```

Then open your browser to `http://localhost:8080/PromptLense.html`

## 📁 Project Structure

```
PromptLense/
├── 📄 PromptLense.html      # Main application (self-contained, ~185 KB)
├── 🚀 launch.bat            # Quick Windows launcher with HTTP server
├── ⚡ start.bat             # Full launcher with Ollama support
├── 📖 README.md             # This file
├── 📋 PROJECT-REPORT.md     # Detailed project documentation
├── 📁 docs/                 # Documentation & research
│   ├── deployment-guide.md
│   ├── ollama-troubleshooting.md
│   ├── v1.2-setup-guide.md
│   └── ... (research reports)
├── 📁 src/                  # Source files & components
│   ├── llm-judge-integration.js
│   └── validation-demonstration.html
└── 📁 debug/                # Development & debug files
    ├── swarm-state.json
    └── fixes-applied.md
```

## 🖥️ System Requirements

- **Browser**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Storage**: 5 MB for application + feedback data
- **Optional**: Ollama (for AI-powered analysis)

## 📊 What Gets Analyzed

| Category | Examples | Detection |
|----------|----------|-----------|
| **High-Impact Words** | `explain`, `step-by-step`, `analyze` | ✅ Pattern matching |
| **Constraints** | `"exact phrase"`, `max 500 words` | ✅ Regex extraction |
| **Filler Words** | `please`, `could you`, `very` | ✅ 40+ patterns |
| **Context Clues** | `@python`, `@creative`, `@formal` | ✅ 600+ vocabulary |
| **Format Specs** | `JSON`, `markdown table`, `bullet list` | ✅ 25+ formats |

## 🧠 How It Works

1. **Real-time Analysis** - As you type, PromptLense analyzes your prompt using 74+ regex patterns
2. **Scoring Algorithm** - Combines static heuristics with learned weights from your feedback
3. **Confidence Intervals** - Wilson score intervals show uncertainty based on sample size
4. **Goal Comparison** - Switch between 5 optimization goals to see different recommendations

## 🔧 Ollama Integration (Optional)

To enable AI-powered analysis:

```bash
# 1. Install Ollama
# https://ollama.com/download

# 2. Pull a model
ollama pull llama3.2

# 3. Start Ollama server
ollama serve

# 4. Open PromptLense with Ollama support
start.bat
```

See [Ollama Troubleshooting](./docs/ollama-troubleshooting.md) for detailed setup.

## 📖 Documentation

- **[Deployment Guide](./docs/deployment-guide.md)** - How to share and deploy PromptLense
- **[Setup Guide](./docs/v1.2-setup-guide.md)** - Detailed installation instructions
- **[Ollama Troubleshooting](./docs/ollama-troubleshooting.md)** - Common issues and solutions
- **[Project Report](./PROJECT-REPORT.md)** - Architecture, metrics, and roadmap

## 🧪 Research & Validation

See the [docs/](./docs/) folder for comprehensive research on:
- Prompt evaluation methodologies
- Creative prompting techniques
- LLM-as-judge implementations
- Dataset integration strategies

## 🤝 Contributing

This is a research project focused on prompt engineering analysis. Feedback and contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📜 License

MIT License - Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Built with vanilla JavaScript (no frameworks)
- Inspired by prompt engineering research from OpenAI, Anthropic, and the broader AI community
- Ollama integration for local LLM analysis

---

**Version**: 1.2.0  
**Last Updated**: March 2026  
**Status**: Production-Ready Beta
