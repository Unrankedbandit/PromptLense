# 🗳️ PromptLens Voting System Guide

## Overview

The PromptLens now includes a **one-vote-per-prompt** validation system that allows you to:

1. **Vote on heuristic scores** (👍 accurate / 👎 wrong)
2. **Get LLM-as-Judge evaluations** via your local Ollama
3. **Track correlation** between scores and actual success
4. **Export validation data** for analysis

---

## How It Works

### One Vote Per Prompt

Each unique prompt can only be voted on **once**. This prevents:
- Duplicate votes on the same prompt
- Gaming the validation system
- Inflating correlation metrics

The system uses a **prompt hash** to identify identical prompts (case-insensitive, normalized whitespace).

---

## User Interface

### Feedback Section
Located below the score display:

```
Was this analysis helpful?          👍 5 / 👎 2 (7 total)
[👍 Accurate] [👎 Wrong] [🧠 LLM Judge]
```

### Voting Buttons

| Button | Action | State |
|--------|--------|-------|
| 👍 Accurate | Score matched actual outcome | Green when voted |
| 👎 Wrong | Score was misleading | Red when voted |
| 🧠 LLM Judge | Get Ollama evaluation | Always available |

When you've voted on a prompt:
- The voted button highlights
- The other button disables (grayed out)
- Text shows "Voted"

---

## Using LLM-as-Judge

### Requirements
- Ollama running locally with `gpt-oss:20b` model
- Accessible at `http://localhost:11434`

### How to Use

1. **Enter a prompt** in the editor
2. **Click "🧠 LLM Judge"** button
3. **Wait for analysis** (takes 10-30 seconds)
4. **Review the evaluation**:
   - Overall score (0-100)
   - Confidence level (HIGH/MEDIUM/LOW)
   - Criteria breakdown (5 dimensions)
   - Suggested improvements
5. **Vote on accuracy**:
   - 👍 Accurate - LLM evaluation was helpful
   - 👎 Inaccurate - LLM evaluation was wrong

### LLM Evaluation Criteria by Goal

| Goal | Criteria |
|------|----------|
| **Efficient** | Clarity, Conciseness, Specificity, Structure, Actionability |
| **Creative** | Inspiration, Ambiguity (feature!), Style guidance, Constraint balance, Originality |
| **Programmatic** | Language clarity, I/O spec, Requirements, Edge cases, Testability |
| **Bugfix** | Error context, Reproduction, Environment, Expected behavior, Attempted fixes |

---

## Console Commands

Open browser console (F12) to access these commands:

### View Statistics
```javascript
voteStats()
// Output: {total: 15, upvotes: 12, downvotes: 3, agreement: '80.0%'}
```

### Check Validation Report
```javascript
validationReport()
// Shows correlation between scores and user success
// Requires 5+ votes to calculate
```

### Check if Current Prompt Was Voted
```javascript
hasVoted()
// Output: Voted: up at 3/23/2026, 2:30:15 PM
```

### Export All Data
```javascript
exportValidationData()
// Downloads JSON file with all votes and validation entries
```

### Clear All Data
```javascript
clearValidationData()
// Confirms then deletes all votes (destructive)
```

### Get LLM Evaluation
```javascript
llmJudge.evaluatePrompt("your prompt here", "creative")
// Returns Promise with evaluation object
```

---

## Data Structure

### Vote Storage
```javascript
{
  "promptHash": "-a3f7b2e",
  "vote": "up",           // or "down"
  "timestamp": 1711234567890,
  "promptPreview": "Write a story about...",
  "scores": {
    "heuristic": 67,
    "llm": 82,            // if LLM-as-judge was used
    "goal": "creative"
  }
}
```

### Validation Entry
```javascript
{
  "id": "k2m9p...",
  "timestamp": 1711234567890,
  "promptHash": "-a3f7b2e",
  "prompt": "full prompt text...",
  "goal": "creative",
  "heuristicScore": 67,
  "llmScore": 82,         // null if no LLM evaluation
  "userRating": 1,        // 1 for up, -1 for down
  "validated": true
}
```

---

## Interpreting Results

### Validation Report Output

```
=== VALIDATION REPORT ===
Total samples: 23
LLM-evaluated samples: 15

Score Correlation with User Success:
  Heuristic score: 0.234 (Weak ❌)
  LLM-as-Judge:    0.712 (Strong ✅)

Interpretation:
  > 0.7: Strong correlation (scores predict success)
  0.4-0.7: Moderate correlation
  < 0.4: Weak correlation (scores unreliable)

⚠️ WARNING: Heuristic scores have weak correlation with actual success!
```

### What This Means

| Correlation | Interpretation | Action |
|-------------|----------------|--------|
| **> 0.7** | Scores predict success well | Keep using system |
| **0.4-0.7** | Scores somewhat useful | Needs refinement |
| **< 0.4** | Scores unreliable | Major revision needed |

---

## Best Practices

### For Accurate Validation

1. **Vote after seeing outcomes** — Don't vote immediately; test the prompt first
2. **Use real tasks** — Vote on prompts you actually used, not hypotheticals
3. **Be consistent** — Apply the same success criteria across votes
4. **Include diverse prompts** — Short, long, simple, complex

### When to Use LLM-as-Judge

- **Uncertain scores** — When heuristic score seems wrong
- **Important prompts** — Before deploying to production
- **Low confidence** — When you need second opinion
- **Validation** — To check if heuristic system is working

### Interpreting Disagreements

| Heuristic | LLM | Reality | Interpretation |
|-----------|-----|---------|----------------|
| 85 | 45 | 👎 Bad | Heuristic overvalues constraints |
| 35 | 78 | 👍 Good | Heuristic undervalues creative ambiguity |
| 70 | 72 | 👍 Good | Both systems align (good sign) |

---

## Troubleshooting

### "Already voted on this prompt"
- Each unique prompt can only be voted once
- Modify the prompt slightly to vote again
- Check `hasVoted()` in console to verify

### LLM Judge not responding
- Check Ollama is running: `ollama list`
- Verify model exists: `ollama pull gpt-oss:20b`
- Check console for network errors

### Low correlation scores
- Need more samples (minimum 5, ideally 50+)
- May indicate heuristic formula needs adjustment
- Compare heuristic vs LLM correlation to identify which is more reliable

---

## Workflow Example

```
1. Write prompt → "Write a kafkaesque story..."
2. See heuristic score → 35 (Low)
3. Think: "But this should score high for creative"
4. Click 🧠 LLM Judge
5. Get LLM score → 88 (High)
6. Copy prompt to Gemini
7. Test output quality → Actually good!
8. Click 👍 on LLM evaluation
9. Note: Heuristic undervalues literary references

[Repeat for 20+ prompts...]

10. Run validationReport()
11. See: Heuristic correlation: 0.31, LLM correlation: 0.74
12. Conclusion: LLM-as-Judge more reliable for creative prompts
```

---

## Data Export Format

When you run `exportValidationData()`, you get:

```json
{
  "metadata": {
    "exportedAt": "2026-03-23T22:30:15.123Z",
    "version": "1.2",
    "stats": {
      "total": 45,
      "upvotes": 38,
      "downvotes": 7,
      "agreement": "84.4%"
    }
  },
  "votes": { /* prompt hash → vote data */ },
  "validationEntries": [ /* array of all entries */ ]
}
```

---

## Privacy Note

All voting data is stored **locally in your browser** (localStorage). 
- No data sent to external servers
- Prompts are stored locally for correlation analysis
- Export to share or backup your validation dataset

---

*Last updated: March 23, 2026*
