# Quick Reference: Prompt Quality Datasets

## 🎯 TOP 5 DATASETS FOR TRAINING PROMPT SCORERS

### 1. ASAP (Automated Student Assessment Prize)
- **What:** 12,978 essays with human quality scores
- **Use for:** Training output quality predictors
- **Access:** https://www.kaggle.com/c/asap-aes/data
- **Key Metric:** Quadratic Weighted Kappa (QWK)

### 2. UltraFeedback
- **What:** 64k prompts with 4 model completions each, GPT-4 rated
- **Use for:** Training preference-based prompt scorers
- **Access:** `HuggingFaceH4/ultrafeedback_binarized`
- **Key Metric:** Pairwise win rates

### 3. HH-RLHF (Anthropic)
- **What:** 170k human preference comparisons
- **Use for:** Training helpfulness/harmlessness scorers
- **Access:** `Anthropic/hh-rlhf`
- **Key Metric:** Human preference labels

### 4. MT-Bench Human Judgments
- **What:** 3,300+ human-verified model comparisons
- **Use for:** Validating automated prompt scorers
- **Access:** `lmsys/mt_bench_human_judgments`
- **Key Metric:** Agreement with human judgments

### 5. GSM8K
- **What:** 1,300 math problems with step-by-step solutions
- **Use for:** Testing reasoning prompt effectiveness
- **Access:** `gsm8k` on HuggingFace
- **Key Metric:** Exact match accuracy

---

## 🔧 FRAMEWORKS WITH BUILT-IN DATASETS

### CoolPrompt
```bash
pip install coolprompt
```
- Includes 5 benchmark datasets
- Synthetic data generator
- Three optimization methods (HyPE, ReflectivePrompt, DistillPrompt)

### PromptWizard (Microsoft Research)
- Evaluates on 45+ tasks
- BIG-Bench Instruction Induction
- GSM8K, AQUA-RAT, BBH

### DSPy
```bash
pip install dspy-ai
```
- BIG-Bench Hard integration
- Custom dataset support
- MIPROv2 optimizer

---

## 📊 VALIDATION BENCHMARKS

| Benchmark | Type | Size | Best For |
|-----------|------|------|----------|
| **MT-Bench** | Multi-turn | 160 questions | Conversational prompts |
| **AlpacaEval** | Single-turn | 805 prompts | Instruction following |
| **IFEval** | Constraints | 500+ prompts | Constraint adherence |
| **BBH** | Reasoning | 23 tasks × 250 | Complex reasoning |

---

## 🔗 DIRECT HUGGINGFACE LINKS

```python
# Human Preference Datasets
from datasets import load_dataset

hh = load_dataset("Anthropic/hh-rlhf")
ultra = load_dataset("HuggingFaceH4/ultrafeedback_binarized")
shp = load_dataset("stanfordnlp/SHP")
mt_bench = load_dataset("lmsys/mt_bench_human_judgments")

# Task Datasets
gsm8k = load_dataset("gsm8k", "main")
bbh = load_dataset("lukaemon/bbh")  # Big-Bench Hard
commongen = load_dataset("commongen")
```

---

## 💡 RECOMMENDED COMBINATION FOR PROMPT SCORER

### Training Set:
1. ASAP++ essays (trait-level scores) - 12k samples
2. UltraFeedback (pairwise preferences) - 64k samples
3. GSM8K solutions (correctness labels) - 8.5k samples

### Validation Set:
1. MT-Bench (human judgments) - 160 conversations
2. AlpacaEval (reference comparisons) - 805 prompts
3. IFEval (constraint satisfaction) - 500 prompts

### Evaluation Metrics:
- **Correlation:** Pearson/Spearman with human judgments
- **Accuracy:** Exact match for classification prompts
- **QWK:** For ordinal quality scores
- **Win Rate:** Against baseline prompts

---

## ⚠️ KNOWN GAPS

1. No large-scale direct prompt quality ratings (1-10)
2. Limited prompt optimization trajectory data
3. Few domain-specific prompt quality datasets
4. Limited adversarial prompt robustness data
5. Missing multi-modal prompt quality data

---

## 📚 MUST-READ PAPERS

1. **ASAP:** "Automated Student Assessment Prize" (Kaggle 2012)
2. **MT-Bench:** "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (2023)
3. **CoolPrompt:** "CoolPrompt: Automatic Prompt Optimization Framework" (2025)
4. **PromptWizard:** "PromptWizard: Task-Aware Prompt Optimization Framework" (2024)
5. **PEEM:** "Prompt Engineering Evaluation Metrics" (2026)

---

## 🚀 QUICK START CODE

```python
# Complete pipeline example
from datasets import load_dataset
import pandas as pd

# Load training data
asap = load_dataset("asap_aes", split="train")
ultra = load_dataset("HuggingFaceH4/ultrafeedback_binarized", split="train")

# Combine for diverse training
# - ASAP: Output quality scoring
# - UltraFeedback: Preference ranking

# Validate on MT-Bench
mt_bench = load_dataset("lmsys/mt_bench_human_judgments")

# Calculate correlation with human judgments
from scipy.stats import pearsonr, spearmanr

# your_model_scores = [...]
# human_scores = [...]
corr = spearmanr(your_model_scores, human_scores)
print(f"Correlation with humans: {corr.correlation:.3f}")
```

---

**Last Updated:** March 23, 2026  
**For Full Details:** See `dataset-research-report.md`
