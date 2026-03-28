# PromptLens DataSource Analysis
## Where the Scoring Rules Come From

---

## 🗃️ Current DataSource: Hardcoded JavaScript Objects

**Location:** `PromptLense.html` Lines 652-1296

**Structure:**
```javascript
const RULES = {
  efficient: [ /* 5 rule objects */ ],
  creative: [ /* 5+ rule objects */ ],
  programmatic: [ /* 5+ rule objects */ ],
  bugfixing: [ /* 6 rule objects */ ],
  goaloriented: [ /* 5 rule objects */ ]
};

const SUGGESTIONS = {
  efficient: [ /* 4 suggestion objects */ ],
  creative: [ /* 3 suggestion objects */ ],
  // ... etc
};

const MISSING_CHECKS = {
  efficient: [ /* 2 checks */ ],
  // ... etc
};
```

---

## 📊 What This Means

### The "Database" is: **Literally Code**

| Aspect | Reality |
|--------|---------|
| **Source** | Hand-crafted regex patterns in JavaScript |
| **Maintenance** | Edit code → Redeploy entire app |
| **Updates** | Requires new release/version bump |
| **User customization** | ❌ Impossible without forking |
| **A/B testing** | ❌ Cannot test rule variants without code changes |
| **Versioning** | ❌ No history of rule changes |

---

## 🧠 Where Did the Rules Come From?

### Original Rules (v1.0): 
**Source:** Anthropic/OpenAI prompt engineering documentation (heuristics)

**Process:**
1. Read Anthropic's "Prompt Engineering Best Practices"
2. Extract common advice ("be specific", "use examples", "avoid filler")
3. Convert advice to regex patterns
4. Assign arbitrary priority weights (1-5 scale)
5. Create scoring formula (40 + positive×80 - negative×60)

**Example Translation:**
```
Anthropic advice: "Specify output format for structured responses"
↓
PromptLens rule:  /\b(json|xml|yaml|csv|markdown)\b/gi
↓
Category:         'high-impact'
Priority:         4 (arbitrary assignment)
Weight:           2.0 in scoring formula (arbitrary)
```

### Expanded Rules (v1.1):
**Source:** Expanded vocabulary from aesthetic communities, art history, literary criticism

**Process:**
1. Research digital aesthetics (vaporwave, cottagecore, etc.)
2. Compile art historical movements
3. Add context-disambiguated programming terms
4. **Still handcoded, still arbitrary weights**

---

## ⚠️ The Problem with This Approach

### 1. No Empirical Foundation
```javascript
// Why priority 5? Because it "feels" important
{ type: 'high-impact', priority: 5, label: 'Style / tone cue', ... }

// Why weight 2.0? No data supports this
positive = (high×2 + constraint×2 + context×1.2) ÷ words
```

### 2. Cannot Learn from Data
- No mechanism to add rules based on successful prompts
- No way to adjust weights based on outcome correlation
- Static system that never improves

### 3. No Transparency
Users see:
- "Score: 87"

Users don't see:
- "This score is based on 14 pattern matches"
- "High-impact patterns contributed 47% of score"
- "Last validated: never"

### 4. Maintenance Nightmare
To add "Bun" as a JavaScript runtime:
1. Edit PromptLense.html
2. Add regex pattern
3. Test manually
4. Deploy new version
5. All users must refresh

---

## 🎯 What We SHOULD Be Using

### Option 1: External JSON Configuration
```javascript
// config/prompt-rules.json
{
  "version": "1.1.0",
  "lastUpdated": "2026-03-22",
  "goals": {
    "efficient": {
      "rules": [...],
      "weights": {
        "high-impact": 2.0,
        "constraint": 2.0,
        "context": 1.2,
        "source": "regression-analysis-v1.1"
      }
    }
  }
}
```
**Benefits:** Hot-swappable, versioned, auditable

### Option 2: Learned Weights from Outcomes
```javascript
// weights derived from logistic regression on outcome data
{
  "high-impact": 1.87,  // derived from 10K prompt/outcome pairs
  "constraint": 2.14,
  "context": 0.93,
  "confidence": 0.78
}
```
**Benefits:** Empirically validated, improving over time

### Option 3: Hybrid with User Feedback
```javascript
{
  "pattern": "\\b(json|xml)\\b",
  "category": "high-impact",
  "validation": {
    "detectionRate": 0.94,
    "falsePositiveRate": 0.03,
    "outcomeCorrelation": 0.67
  }
}
```
**Benefits:** Transparent metrics, evidence-based

---

## 🔮 Proposed DataSource Architecture (v2.0)

```
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYERS                          │
├─────────────────────────────────────────────────────────┤
│  L1: Static Base Rules (JSON)                           │
│      - Core patterns from literature                    │
│      - Community-contributed vocabularies               │
│                                                         │
│  L2: Validated Weights (API/Database)                   │
│      - Empirically derived from outcome data            │
│      - Confidence intervals per pattern                 │
│      - A/B test variants                                │
│                                                         │
│  L3: User Context (LocalStorage/Account)                │
│      - Custom vocabulary                                │
│      - Domain-specific terms                            │
│      - Personal effectiveness tracking                  │
│                                                         │
│  L4: Real-time Feedback Loop                            │
│      - 👍/👎 on outputs                                 │
│      - Score correction signals                         │
│      - Pattern effectiveness metrics                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Honest Assessment

**Current DataSource Quality: 3/10**

| Criterion | Score | Reason |
|-----------|-------|--------|
| Empirical basis | 1/10 | No outcome data, arbitrary weights |
| Maintainability | 3/10 | Hardcoded, requires code changes |
| Transparency | 2/10 | Users don't know how scores calculated |
| Extensibility | 4/10 | Can add patterns, but painful |
| Versioning | 0/10 | No history, no rollback |
| User customization | 0/10 | Impossible without forking |

**The Hard Truth:**
> We are using **handcrafted heuristics from prompt engineering blogs**, not validated data from actual prompt outcomes.

**To become a truly accurate system, we need:**
1. **Outcome database** - Prompt → Output → Success rating
2. **Weight learning** - Statistical derivation, not guesswork
3. **External config** - Hot-swappable rules
4. **Transparency layer** - Show users the evidence

---

*Analysis generated by Kimi Swarm Hub*
