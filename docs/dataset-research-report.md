# Comprehensive Research Report: Prompt Quality Datasets and Ground Truth Data

**Date:** March 23, 2026  
**Research Focus:** Datasets for training and validating prompt evaluation/scoring systems

---

## Executive Summary

This report provides a comprehensive overview of available datasets for prompt quality evaluation, prompt optimization training, and ground truth data for building prompt scoring systems. The research covers academic datasets, open-source frameworks, and commercially available resources.

---

## 1. ASAP DATASET (AUTOMATED STUDENT ASSESSMENT PRIZE)

### 1.1 Overview
The **ASAP (Automated Student Assessment Prize)** dataset is one of the most well-established datasets for automated evaluation of text quality, released through a 2012 Kaggle competition. While originally designed for essay scoring, it has significant adaptation potential for prompt evaluation.

### 1.2 Dataset Specifications

| Attribute | Details |
|-----------|---------|
| **Source** | Kaggle Competition (2012) |
| **Size** | 12,978 essays across 8 different prompts |
| **Grades** | 7-10 grade students |
| **Human Ratings** | Double-scored by human expert graders |
| **Score Range** | Varies by prompt (2-12, 0-60, etc.) |

### 1.3 Prompt Breakdown

| Prompt | Responses | Score Range | Avg Words | Type |
|--------|-----------|-------------|-----------|------|
| 1 | 1,783 | 2-12 | 350 | Argumentative |
| 2 | 1,800 | 1-6 | 350 | Argumentative |
| 3 | 1,726 | 0-3 | 150 | Reading Comprehension |
| 4 | 1,772 | 0-3 | 150 | Reading Comprehension |
| 5 | 1,805 | 0-4 | 150 | Reading Comprehension |
| 6 | 1,800 | 0-4 | 150 | Reading Comprehension |
| 7 | 1,569 | 0-30 | 250 | Narrative |
| 8 | 723 | 0-60 | 650 | Narrative |

### 1.4 Access Information
- **Primary URL:** https://www.kaggle.com/c/asap-aes/data
- **Format:** CSV with essay text, prompt ID, and human scores
- **License:** Competition dataset (check current terms)

### 1.5 ASAP++ Extension
- **Description:** Extended version with trait-level annotations
- **Annotations:** Content, organization, word choice, sentence fluency, conventions
- **Paper:** Mathias and Bhattacharyya (2018)
- **URL:** https://lwsam.github.io/ASAP++/lrec2018.html

### 1.6 Adaptation Strategies for Prompt Evaluation

The ASAP dataset can be adapted for prompt quality evaluation in several ways:

1. **Prompt-Essay Pair Quality:** Train models to predict essay quality scores based on the combination of writing prompt + generated essay

2. **Cross-Prompt Evaluation:** Use the 8 different prompts to test generalization - train on 7 prompts, test on 1 held-out prompt

3. **Rubric-Based Scoring:** Adapt the trait-level scores from ASAP++ to evaluate prompt-specific rubric adherence

4. **Calibration:** Use the double-scored human ratings to calibrate automated prompt quality metrics

### 1.7 Validation Method
- **Human Validation:** Each essay scored by at least 2 human expert graders
- **Metric:** Quadratic Weighted Kappa (QWK) - industry standard for inter-rater agreement
- **Benchmark:** State-of-the-art LLM systems achieve ~84% accuracy on ASAP 2.0

---

## 2. COOLPROMPT FRAMEWORK AND DATASETS

### 2.1 Framework Overview
**CoolPrompt** is a comprehensive framework for automatic prompt optimization developed by ITMO University's Computer Technologies Lab (CT-Lab). It includes both optimization algorithms and evaluation datasets.

### 2.2 Access Information
- **GitHub:** https://github.com/CTLab-ITMO/CoolPrompt
- **PyPI:** `pip install coolprompt`
- **Paper:** "CoolPrompt: Automatic Prompt Optimization Framework for Large Language Models" (FRUCT 2025)

### 2.3 Core Optimization Methods

#### HyPE (Hypothetical Prompt Explorer)
- **Type:** Fast meta-prompting approach
- **Speed:** Single LLM call (~1 second)
- **Cost:** $0.00018 USD per optimization
- **Best for:** Rapid prompt enhancement

#### ReflectivePrompt
- **Type:** Evolutionary optimization algorithm
- **Iterations:** Multiple rounds of mutation, critique, synthesis
- **Cost:** ~$0.13 USD per optimization
- **Runtime:** ~1090 seconds
- **Best for:** High-quality optimization when quality is priority

#### DistillPrompt
- **Type:** Prompt distillation using Tree-of-Thoughts
- **Cost:** ~$0.074 USD per optimization
- **Runtime:** ~451 seconds (90s per epoch)
- **Best for:** Creating shorter, more efficient prompts

### 2.4 Built-in Datasets for Evaluation

The CoolPrompt framework tests on the following benchmarks:

| Dataset | Task Type | Metric | Use for Prompt Scoring |
|---------|-----------|--------|------------------------|
| **SQuAD-2** | QA (Extractive) | BertScore | Instruction following |
| **GSM8K** | Math Reasoning | Exact Match | Chain-of-thought prompts |
| **CommonGen** | Generation | BertScore | Creative writing prompts |
| **AG News** | Classification | F1 | Classification prompts |
| **XSum** | Summarization | BertScore | Summarization prompts |

### 2.5 Synthetic Data Generation
CoolPrompt includes a **Synthetic Data Generator** module that:
- Generates labeled training data when no input dataset exists
- Creates diverse prompt variations for testing
- Supports automatic evaluation data creation

### 2.6 Framework Features for Prompt Scoring
- **Task Detector:** Automatically classifies prompt types
- **PromptAssistant:** Provides feedback on prompt optimization results
- **Evaluator:** Built-in metrics for both classification and generation tasks

---

## 3. MT-BENCH AND LMSYS DATASETS

### 3.1 MT-Bench Dataset

| Attribute | Details |
|-----------|---------|
| **Source** | LMSYS Org |
| **Size** | 160 multi-turn questions (80 conversations × 2 turns) |
| **Categories** | 8 categories (Writing, Roleplay, Extraction, Reasoning, Math, Coding, STEM, Humanities) |
| **Evaluation** | GPT-4 as judge (1-10 scale) |
| **Human Judgments** | 3,300+ human-verified comparisons available |

### 3.2 Access Information
- **GitHub:** https://github.com/lm-sys/FastChat/tree/main/fastchat/llm_judge
- **HuggingFace:** `lmsys/mt_bench_human_judgments`
- **Paper:** "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (2023)

### 3.3 MT-Bench Human Judgments Dataset
- **Size:** ~3,300 pairwise comparisons
- **Annotations:** Human expert judgments on model responses
- **Models Compared:** GPT-4, GPT-3.5, Claude, Vicuna, Alpaca, LLaMA
- **Format:** JSON with conversation history, model responses, human verdicts

### 3.4 Chatbot Arena Dataset
- **Size:** 1M+ real user conversations
- **Type:** Crowdsourced human preference data
- **Format:** Anonymous model battles with human votes
- **Access:** Periodic releases with PII removed

---

## 4. ALPACAEVAL DATASET

### 4.1 Overview
**AlpacaEval** is an automated evaluation framework with a large set of human-written instruction prompts.

| Attribute | Details |
|-----------|---------|
| **Version** | AlpacaEval 2.0 (current) |
| **Size** | 805 test prompts |
| **Reference Model** | GPT-4 Turbo |
| **Metric** | Win rate (with length-controlled variant) |

### 4.2 Access Information
- **HuggingFace:** `tatsu-lab/alpaca_eval`
- **GitHub:** https://github.com/tatsu-lab/alpaca_eval
- **Paper:** "AlpacaEval: An Automatic Evaluator of Instruction-following Models"

### 4.3 Dataset Composition
- Diverse instruction-following tasks
- Human-written prompts from various sources
- Cross-lingual variants available (XL-AlpacaEval)

---

## 5. HUMAN PREFERENCE DATASETS (RLHF)

### 5.1 Anthropic HH-RLHF Dataset

| Attribute | Details |
|-----------|---------|
| **Size** | ~170k dialogues |
| **Type** | Human preference comparisons |
| **Subsets** | Helpfulness (44k), Harmlessness (42k), Red-teaming |
| **Format** | Query + paired responses + preference label |

**Access:** https://huggingface.co/datasets/Anthropic/hh-rlhf

### 5.2 UltraFeedback Dataset

| Attribute | Details |
|-----------|---------|
| **Size** | 64k prompts |
| **Responses** | 4 model completions per prompt |
| **Ratings** | GPT-4 scored on helpfulness, honesty, instruction-following |
| **Binarized** | `HuggingFaceH4/ultrafeedback_binarized` |

**Access:** https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized

### 5.3 Stanford Human Preferences (SHP) Dataset

| Attribute | Details |
|-----------|---------|
| **Size** | 385k human preferences |
| **Domains** | 18 domains (cooking to legal advice) |
| **Source** | Reddit upvotes |
| **Split** | 349k train / 18.4k validation / 18.4k test |

**Access:** https://huggingface.co/datasets/stanfordnlp/SHP

### 5.4 OpenAI Datasets

| Dataset | Size | Description |
|---------|------|-------------|
| **WebGPT Comparisons** | 20k | Question + paired answers + preferences |
| **Summarize from Feedback** | 64k | Reddit TL;DR + human ratings |
| **OpenAssistant (OASST1)** | 161k messages | Human-generated conversations with 461k quality ratings |

---

## 6. REASONING AND TASK-SPECIFIC DATASETS

### 6.1 GSM8K (Grade School Math)

| Attribute | Details |
|-----------|---------|
| **Size** | 8.5K training / 1.3K test problems |
| **Type** | Math word problems requiring multi-step reasoning |
| **Ground Truth** | Numerical answers with step-by-step solutions |
| **Best for** | Testing chain-of-thought prompt quality |

**Access:** https://huggingface.co/datasets/gsm8k

### 6.2 Big-Bench Hard (BBH)

| Attribute | Details |
|-----------|---------|
| **Size** | 23 challenging tasks (250 examples each) |
| **Type** | Complex reasoning beyond average human performance |
| **CoT Prompts** | Available for all tasks |
| **Best for** | Evaluating complex instruction-following prompts |

**Access:** https://github.com/suzgunmirac/BIG-Bench-Hard

### 6.3 IFEval (Instruction Following Evaluation)

| Attribute | Details |
|-----------|---------|
| **Size** | 500+ verifiable instructions |
| **Type** | Explicit, verifiable constraints (e.g., "write >400 words") |
| **Metrics** | Prompt-level and instruction-level accuracy |
| **Best for** | Testing prompt adherence to constraints |

**Access:** Part of Google Research datasets

### 6.4 CommonGen

| Attribute | Details |
|-----------|---------|
| **Size** | 35k training / 1k validation / 1.5k test |
| **Type** | Concept-to-text generation |
| **Task** | Generate sentence using given concepts |
| **Best for** | Testing creative writing prompts |

---

## 7. OPENAI EVALS FRAMEWORK

### 7.1 Framework Overview
OpenAI Evals is a framework for evaluating LLMs and LLM systems, including:
- Dataset templates for standardized evaluation
- LLM-as-a-Judge implementations
- Meta-evaluation capabilities

### 7.2 Access Information
- **GitHub:** https://github.com/openai/evals
- **Format:** JSON-based dataset specification
- **Requirements:** Dataset prepared in predefined JSON template

### 7.3 Key Features
- **Standardized Prompts:** Consistent evaluation templates
- **LLM Judges:** Built-in support for automated evaluation
- **Extensibility:** Easy to add new datasets and metrics
- **Compatibility:** Works with OpenAI models and APIs

### 7.4 Example Datasets in Evals
- Classification tasks
- Question answering
- Code evaluation
- Custom evaluation criteria

---

## 8. PROMPT RECOVERY AND STYLE DATASETS

### 8.1 StyleRec Dataset

| Attribute | Details |
|-----------|---------|
| **Task** | Prompt recovery for writing style transformation |
| **Type** | Original sentence + transformed output → recover prompt |
| **Best for** | Training prompt inversion models |

**Access:** https://github.com/promptrecovery501/StyleRec

### 8.2 PromptBench Framework

| Attribute | Details |
|-----------|---------|
| **Purpose** | Adversarial prompt robustness testing |
| **Includes** | Prompt attacks, dynamic evaluation |
| **Library** | `promptbench` Python package |

**Access:** Research paper + associated GitHub repositories

---

## 9. EVALUATION METRICS AND SCORING DATASETS

### 9.1 PEEM (Prompt Engineering Evaluation Metrics)

| Attribute | Details |
|-----------|---------|
| **Dimensions** | 6 criteria (Accuracy, Coherence, Relevance, Conciseness, Objectivity, Clarity) |
| **Scale** | 1-5 Likert scale |
| **Validation** | Human correlation ρ=0.68-0.85 |
| **Human Evaluation** | 210 instances × 3 annotators |

**Access:** Paper: "PEEM: Prompt Engineering Evaluation Metrics for Interpretable Joint Evaluation of Prompts and Responses" (2026)

### 9.2 G-Eval (NLI-based Evaluation)
- **Type:** GPT-4 based evaluation framework
- **Best for:** Summarization, dialogue quality assessment
- **Correlation:** High correlation with human judgments

### 9.3 BERTScore
- **Type:** Semantic similarity metric
- **Best for:** Generation quality evaluation
- **Available in:** CoolPrompt, PromptWizard, and other frameworks

---

## 10. DATASET SUMMARY FOR TRAINING PROMPT SCORERS

### 10.1 Recommended Datasets by Use Case

| Use Case | Primary Dataset | Secondary Dataset |
|----------|----------------|-------------------|
| **General Prompt Quality** | ASAP + ASAP++ | UltraFeedback |
| **Instruction Following** | IFEval | BBH |
| **Multi-turn Conversation** | MT-Bench | Chatbot Arena |
| **Math/Reasoning Prompts** | GSM8K | MATH |
| **Creative Writing** | CommonGen | AlpacaEval |
| **Human Preference Learning** | HH-RLHF | SHP |
| **Safety/Harmlessness** | HH-RLHF (Harmless) | Red-teaming datasets |

### 10.2 Dataset Size Comparison

| Dataset | Training Samples | Test Samples | Human Ratings? |
|---------|-----------------|--------------|----------------|
| ASAP | 10,000+ | 3,000+ | Yes (double) |
| HH-RLHF | 170,000 | - | Yes |
| UltraFeedback | 64,000 | - | GPT-4 + Human |
| MT-Bench | - | 160 | Yes |
| GSM8K | 8,500 | 1,300 | Yes |
| SHP | 349,000 | 18,400 | Yes (Reddit) |
| AlpacaEval | - | 805 | Reference-based |

---

## 11. GAPS IN AVAILABLE DATA

### 11.1 Identified Gaps

1. **Direct Prompt Quality Scoring:**
   - No large-scale dataset of prompts with direct human quality ratings (1-10 scale)
   - Most datasets evaluate outputs, not the prompts themselves

2. **Cross-Domain Prompt Transfer:**
   - Limited datasets studying how prompts transfer across domains
   - Few systematic studies of prompt generalization

3. **Prompt Complexity Metrics:**
   - No standardized dataset with prompt complexity annotations
   - Limited data on prompt length vs. effectiveness tradeoffs

4. **Adversarial Prompt Robustness:**
   - Few datasets specifically for testing prompt robustness
   - Limited data on prompt injection attacks with ground truth

5. **Multi-modal Prompts:**
   - Most datasets are text-only
   - Limited ground truth for image+text prompt evaluation

6. **Prompt Optimization Trajectories:**
   - No dataset tracking multiple iterations of prompt refinement
   - Limited data on how prompts evolve through optimization

7. **Domain-Specific Prompts:**
   - Medical, legal, scientific domains lack specialized prompt quality datasets
   - Most datasets are general-purpose

### 11.2 Recommendations for Addressing Gaps

1. **Create a Prompt Quality Benchmark:**
   - Collect 10,000+ prompts across categories
   - Have experts rate on multiple dimensions (clarity, specificity, effectiveness)
   - Include before/after optimization pairs

2. **Build Prompt Optimization Trajectory Dataset:**
   - Document full optimization paths
   - Include intermediate states and human feedback
   - Cover multiple optimization methods

3. **Develop Domain-Specific Collections:**
   - Partner with domain experts for specialized prompts
   - Create evaluation rubrics per domain

---

## 12. ACCESS AND IMPLEMENTATION GUIDE

### 12.1 Quick Start for ASAP Dataset
```python
# Install kaggle API
pip install kaggle

# Download ASAP dataset
kaggle competitions download -c asap-aes

# Or use HuggingFace datasets
from datasets import load_dataset
dataset = load_dataset("asap_aes")  # If available
```

### 12.2 Quick Start for CoolPrompt
```python
# Installation
pip install coolprompt

# Basic usage
from coolprompt.assistant import PromptTuner

prompt_tuner = PromptTuner()
prompt_tuner.run('Write an essay about autumn')
print(prompt_tuner.final_prompt)
```

### 12.3 Quick Start for MT-Bench Evaluation
```python
# Clone FastChat
git clone https://github.com/lm-sys/FastChat.git
cd FastChat
pip install -e ".[model_worker,llm_judge]"

# Run evaluation
python -m fastchat.llm_judge.gen_model_answer --model-path [YOUR_MODEL]
python -m fastchat.llm_judge.gen_judgment --model-list [MODEL_LIST]
```

### 12.4 Quick Start for AlpacaEval
```python
# Installation
pip install alpaca-eval

# Run evaluation
alpaca_eval --model_outputs [YOUR_MODEL_OUTPUTS]
```

---

## 13. KEY PAPERS AND REFERENCES

### 13.1 Essential Papers
1. **ASAP:** "The Hewlett Foundation: Automated Essay Scoring" (Kaggle 2012)
2. **CoolPrompt:** "CoolPrompt: Automatic Prompt Optimization Framework" (FRUCT 2025)
3. **MT-Bench:** "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (2023)
4. **AlpacaEval:** "AlpacaEval: An Automatic Evaluator of Instruction-following Models"
5. **PromptWizard:** "PromptWizard: Task-Aware Prompt Optimization Framework" (2024)
6. **DSPy:** "DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines"
7. **PEEM:** "PEEM: Prompt Engineering Evaluation Metrics for Interpretable Joint Evaluation" (2026)

### 13.2 Dataset Collections
- **Awesome LLM Human Preference Datasets:** https://github.com/glgh/awesome-llm-human-preference-datasets
- **HuggingFace RLHF Datasets:** https://huggingface.co/datasets?filter=rlhf

---

## 14. CONCLUSION

The landscape of prompt quality datasets is rich but fragmented. For building a prompt scoring system:

1. **For Training:** Combine ASAP (for essay quality), UltraFeedback/HH-RLHF (for human preference), and GSM8K/BBH (for task-specific evaluation)

2. **For Validation:** Use MT-Bench (multi-turn), AlpacaEval (single-turn), and IFEval (constraint following)

3. **For Optimization:** Leverage CoolPrompt or PromptWizard frameworks with their built-in datasets

4. **For Ground Truth:** ASAP double-scored essays provide the highest-quality human annotations; MT-Bench human judgments provide pairwise preferences

The main gap remains a direct, large-scale dataset of prompts with validated quality scores across multiple dimensions—a significant opportunity for future research.

---

**Report Prepared By:** Research Agent  
**Contact:** For questions about dataset access, refer to the links provided in each section.
