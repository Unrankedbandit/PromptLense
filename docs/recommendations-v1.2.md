# PromptLens v1.2 Implementation Plan
## Based on Research Findings

---

## 🎯 Goal: Replace Heuristics with Data

**Current:** `score = 40 + positive×80 - negative×60` (arbitrary)  
**Target:** `score = model.predict(features)` (learned from user feedback)

---

## 📋 Implementation Tasks

### Task 1: Feedback Collection UI (Day 1-2)

**Add to score display:**
```html
<div class="feedback-buttons">
  <span>Was this helpful?</span>
  <button id="feedback-up">👍</button>
  <button id="feedback-down">👎</button>
</div>
```

**Store locally until sync:**
```javascript
const feedbackEntry = {
  timestamp: Date.now(),
  promptText: text,
  features: extractFeatures(text), // our detected patterns
  systemScore: score,
  userRating: 1 | -1, // 👍 or 👎
  goal: primaryGoal
};

localStorage.setItem('promptFeedback', JSON.stringify(feedbackBatch));
```

### Task 2: Feature Extraction (Day 3)

```javascript
function extractFeatures(text) {
  return {
    // Pattern counts
    highImpactCount: countMatches(text, 'high-impact'),
    constraintCount: countMatches(text, 'constraint'),
    contextCount: countMatches(text, 'context'),
    vagueCount: countMatches(text, 'vague'),
    fillerCount: countMatches(text, 'filler'),
    
    // Structural features
    wordCount: text.split(/\s+/).length,
    hasFormat: /\b(json|xml|yaml|markdown|table|list)\b/i.test(text),
    hasExample: /\b(example|for instance|e\.g\.|such as)\b/i.test(text),
    hasConstraintWord: /\b(must|only|never|exactly)\b/i.test(text),
    questionCount: (text.match(/\?/g) || []).length,
    
    // Goal-specific
    goal: primaryGoal
  };
}
```

### Task 3: Backend/Database (Day 4-5)

**Simple Firebase or Supabase setup:**
```javascript
// On feedback button click
async function submitFeedback(entry) {
  await db.collection('prompt_feedback').add({
    ...entry,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  });
}
```

**Schema:**
```
prompt_feedback:
  - prompt_hash (string)
  - features (json)
  - system_score (number)
  - user_rating (number: 1 or -1)
  - goal (string)
  - timestamp (timestamp)
  - user_id (string, optional)
```

### Task 4: ASAP Dataset Integration (Day 6-7)

**Download and process ASAP dataset:**
```python
# Python preprocessing
import pandas as pd

# Load ASAP
asap = pd.read_csv('asap_dataset.csv')

# Extract high-scoring essays (score 5-6)
good_essays = asap[asap['score'] >= 5]

# Extract features using our regex patterns
features = []
for essay in good_essays:
    features.append({
        'has_structure': bool(re.search(r'\b(introduction|conclusion|first|second|finally)\b', essay)),
        'has_examples': bool(re.search(r'\b(example|instance|such as)\b', essay)),
        'avg_sentence_length': len(essay.split()) / essay.count('.'),
        'score': essay['score']
    })

# Train initial model
from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(features, labels)

# Export weights for JavaScript
import json
with open('model_weights.json', 'w') as f:
    json.dump({
        'coefficients': model.coef_.tolist(),
        'intercept': model.intercept_.tolist()
    }, f)
```

### Task 5: Learned Scoring Integration (Day 8-10)

```javascript
// model_weights.json loaded at startup
let learnedModel = null;

async function loadModel() {
  const response = await fetch('model_weights.json');
  learnedModel = await response.json();
}

function computeLearnedScore(features) {
  if (!learnedModel) return computeHeuristicScore(features); // Fallback
  
  // Simple logistic regression: sigmoid(X * W + b)
  const featureVector = [
    features.highImpactCount,
    features.constraintCount,
    features.contextCount,
    features.vagueCount,
    features.fillerCount,
    features.wordCount / 100, // normalize
    features.hasFormat ? 1 : 0,
    features.hasExample ? 1 : 0,
    features.hasConstraintWord ? 1 : 0
  ];
  
  let logit = learnedModel.intercept[0];
  for (let i = 0; i < featureVector.length; i++) {
    logit += featureVector[i] * learnedModel.coefficients[0][i];
  }
  
  // Sigmoid to get probability 0-1, scale to 0-100
  const probability = 1 / (1 + Math.exp(-logit));
  return Math.round(probability * 100);
}

function computeConfidence(score, sampleSize) {
  // Wilson score interval
  const z = 1.96;
  const p = score / 100;
  const n = Math.max(sampleSize, 10);
  
  const lower = (p + z*z/(2*n) - z * Math.sqrt((p*(1-p)+z*z/(4*n))/n)) / (1+z*z/n);
  const upper = (p + z*z/(2*n) + z * Math.sqrt((p*(1-p)+z*z/(4*n))/n)) / (1+z*z/n);
  
  return {
    score: score,
    ciLower: Math.round(lower * 100),
    ciUpper: Math.round(upper * 100),
    confidence: n > 100 ? 'high' : n > 30 ? 'medium' : 'low',
    sampleSize: n
  };
}
```

### Task 6: Confidence Display (Day 11)

```javascript
function updateScore(data, goal) {
  const { score, ciLower, ciUpper, confidence, sampleSize } = data;
  
  // Update main score
  scoreNumber.textContent = score;
  scoreLabel_el.textContent = getLabel(score);
  
  // Update confidence display
  scoreDesc.innerHTML = `
    Score: ${score} (${ciLower}-${ciUpper})<br>
    <span style="font-size: 10px; color: var(--text-muted)">
      ${confidence} confidence (n=${sampleSize})
    </span>
  `;
  
  // Visual indicator for confidence
  if (confidence === 'low') {
    scoreExperimental.textContent = '⚠️ Limited data - score may be unreliable';
    scoreExperimental.style.color = '#f85149';
  }
}
```

### Task 7: Model Retraining Pipeline (Day 12-14)

**Weekly retraining job:**
```python
# train_model.py - run weekly via GitHub Actions or similar
import pandas as pd
from sklearn.linear_model import LogisticRegression
import json

# Load all feedback
feedback = pd.read_csv('prompt_feedback.csv')

# Prepare features and labels
X = feedback[['highImpactCount', 'constraintCount', 'vagueCount', 'fillerCount', 
              'wordCount', 'hasFormat', 'hasExample']].values
y = feedback['user_rating'].values  # 1 or -1

# Train model
model = LogisticRegression(class_weight='balanced')
model.fit(X, y)

# Evaluate
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5)
print(f"CV Accuracy: {scores.mean():.3f} (+/- {scores.std():.3f})")

# Export if performance improved
if scores.mean() > 0.7:  # 70% accuracy threshold
    with open('model_weights.json', 'w') as f:
        json.dump({
            'coefficients': model.coef_.tolist(),
            'intercept': model.intercept_.tolist(),
            'accuracy': scores.mean(),
            'trained_on': len(feedback),
            'date': pd.Timestamp.now().isoformat()
        }, f, indent=2)
    print("Model updated!")
```

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feedback collection rate | >30% | % of users who rate |
| Dataset size | 500+ samples | Weekly count |
| Model accuracy | >70% | CV accuracy on feedback |
| User trust | Qualitative | Survey: "Do you trust the score?" |

---

## 🎁 Bonus: LLM-as-Judge Integration

```javascript
// For complex outputs, use GPT-4 to evaluate
async function llmJudgeScore(prompt, output, goal) {
  const rubrics = {
    efficient: 'Evaluate clarity, conciseness, and structure.',
    creative: 'Evaluate originality, engagement, and style.',
    programmatic: 'Evaluate correctness, efficiency, and readability.'
  };
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: `You evaluate prompts. ${rubrics[goal]} Rate 1-10. Return JSON: {"score": N, "reasoning": "..."}`
      }, {
        role: 'user',
        content: `Prompt: ${prompt}\nOutput: ${output}`
      }]
    })
  });
  
  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}
```

---

## 🚦 Decision Points

### Do we need a backend?
- **Option A:** Firebase (free tier, easy, real-time)
- **Option B:** Supabase (open source, PostgreSQL)
- **Option C:** GitHub + GitHub Actions (static, free, manual process)

**Recommendation:** Start with Option C (static), migrate to A/B when scale requires.

### Do we need user accounts?
- **Phase 1:** Anonymous feedback only
- **Phase 2:** Optional accounts for history

**Recommendation:** Anonymous for v1.2, accounts for v1.4+.

### How often retrain?
- **Option A:** Weekly (automated)
- **Option B:** Monthly (manual review)
- **Option C:** On-demand (when N > 500 new samples)

**Recommendation:** Weekly automated with manual approval for deployment.

---

## 📁 Files to Create

| File | Purpose |
|------|---------|
| `feedback-ui.js` | Button handlers and local storage |
| `feature-extractor.js` | Extract features from prompts |
| `scoring-model.js` | Learned scoring with confidence intervals |
| `train_model.py` | Weekly retraining script |
| `asap_preprocessing.py` | ASAP dataset feature extraction |

---

## ⏱️ Timeline

| Week | Tasks | Deliverable |
|------|-------|-------------|
| 1 | Tasks 1-3 | Feedback collection working |
| 2 | Tasks 4-5 | ASAP integration, learned scoring |
| 3 | Tasks 6-7 | Confidence display, retraining pipeline |
| 4 | Testing & polish | v1.2 release |

---

**Ready to implement?** Start with Task 1 (feedback buttons) - it's the foundation everything else depends on.
