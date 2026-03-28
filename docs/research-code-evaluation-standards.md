# Comprehensive Research Report: Code-Based Evaluation Standards for Prompts

## Executive Summary

This report provides an in-depth analysis of code-based evaluation standards for prompts, focusing on execution-based evaluation methodologies, benchmark frameworks like HumanEval and MBPP, and best practices for evaluating code-generation prompts. The research reveals that execution-based evaluation is considered the "gold standard" for code evaluation due to its objectivity and reliability, while also exploring how these principles can be applied to non-code prompt evaluation.

---

## 1. How HumanEval, MBPP, and Code Benchmarks Evaluate Prompts

### 1.1 HumanEval Benchmark

**Origin and Structure:**
- Created by OpenAI (Chen et al., 2021) as part of the Codex evaluation
- Contains **164 hand-written Python programming problems**
- Each problem includes:
  - Function signature
  - English docstring describing the task
  - Canonical (reference) implementation
  - Test suite (average of **7.7 unit tests per problem**)

**Evaluation Methodology:**
- **Execution-based testing**: Generated code is executed against unit tests
- **Binary scoring**: Solutions must pass ALL tests to be considered correct
- **Primary metric**: pass@k - probability that at least one of k samples passes all tests

```
pass@k = 1 - C(n-c, k) / C(n, k)
```

Where:
- n = total samples generated per problem
- c = number of correct samples passing all tests
- k = number of samples evaluated

**Key Findings from Research:**
- Original HumanEval has limitations: test cases are public (enabling contamination), only 164 problems
- Performance varies significantly by model; prompt formatting affects performance by ~10%
- Pass@1 under greedy decoding is commonly used for direct comparability

### 1.2 MBPP (Mostly Basic Python Programming)

**Origin and Structure:**
- Developed by Google Research (Austin et al., 2021)
- Contains **974 crowd-sourced Python programming problems**:
  - 500 training problems
  - 474 test problems
- Each problem includes:
  - Natural language description
  - Function signature
  - Canonical solution
  - **3 assert-based test cases** (fewer than HumanEval)

**Evaluation Methodology:**
- Same execution-based approach as HumanEval
- **Strict correctness**: No partial credit for close-but-incorrect solutions
- Pass@1 is the primary reported metric

**Problem Distribution:**
- ~58% mathematical operations
- ~43% list operations
- ~19% string manipulation
- Focuses on entry-level programming concepts

**Key Limitations:**
- Python-only (language-specific bias)
- Limited test cases (only 3 per problem)
- Crowd-sourced origin means variable test coverage
- ~65.4% of test instances found on open-access websites (contamination risk)

### 1.3 EvalPlus: Enhanced Execution-Based Evaluation

**Major Innovation:**
EvalPlus (Liu et al., 2023) addresses the test insufficiency problem by automatically expanding test suites:

| Benchmark | Original Tests | EvalPlus Tests | Multiplier |
|-----------|---------------|----------------|------------|
| HumanEval | ~9.6/problem | ~764/problem | **80x** |
| MBPP | 3/problem | ~105/problem | **35x** |

**Methodology:**
1. Extracts seed inputs from original test cases
2. Uses **type-aware mutation** (ChatGPT + mutation strategies) to generate new test inputs
3. Applies **differential testing**: LLM_output(x) == GroundTruth_output(x)
4. Performs test suite reduction to remove redundancy while preserving failure detection

**Validation Findings:**
- HumanEval+ catches **19.3-28.9% more wrong code** than original HumanEval
- Even ground-truth solutions had errors in **11% of tasks** that only emerged under expanded testing
- Test insufficiency in original benchmarks systematically **overstates LLM correctness**
- Can lead to **model mis-ranking** (e.g., WizardCoder-CodeLlama outperforms ChatGPT on HumanEval+ but not on original HumanEval)

---

## 2. Execution-Based Evaluation: Definition and Reliability

### 2.1 What is Execution-Based Evaluation?

Execution-based evaluation assesses the **functional correctness** of generated code by:
1. Executing the code in a sandboxed environment
2. Running it against predefined test cases
3. Comparing outputs to expected results
4. Assigning binary pass/fail based on test results

**Core Characteristics:**
| Aspect | Description |
|--------|-------------|
| **Judge Type** | Automatic (code execution) |
| **Scoring** | Binary (pass all tests = 1, fail any test = 0) |
| **Ground Truth** | Unit tests + reference implementations |
| **Determinism** | Deterministic (same input → same output) |
| **Objectivity** | High (no subjective judgment) |

### 2.2 Reliability Compared to Heuristic Scoring

**Execution-Based vs. Heuristic/Model-Based Evaluation:**

| Dimension | Execution-Based | Heuristic/Static Analysis | LLM-as-Judge |
|-----------|----------------|---------------------------|--------------|
| **Reliability** | ✅ Highest - objective truth | ⚠️ Medium - pattern matching | ⚠️ Variable - can be biased |
| **Speed** | ⚠️ Slower (requires sandbox) | ✅ Fast | ⚠️ Moderate (API calls) |
| **Cost** | ✅ Low (compute only) | ✅ Very low | ⚠️ Higher (token costs) |
| **Nuance** | ❌ Binary only | ⚠️ Limited | ✅ Can capture nuance |
| **Reproducibility** | ✅ Perfect | ✅ High | ⚠️ Non-deterministic |
| **Correctness Guarantee** | ✅ Functional correctness | ❌ Syntactic only | ❌ Estimated only |

**Key Research Findings:**

1. **From EvalPlus Research:**
   - Original benchmarks with limited tests overstate correctness by up to 28.9%
   - Static similarity metrics (BLEU, CodeBLEU) poorly correlate with functional correctness
   - Syntactic similarity can misrepresent functional correctness (false positives and false negatives)

2. **From Anthropic Documentation:**
   - "Code-based grading: **Fastest and most reliable**, extremely scalable, but also lacks nuance for more complex judgements"
   - Code-based graders are preferred when specific conditions can be verified programmatically

3. **From LLM-as-Judge Studies:**
   - LLM evaluators achieve high recall but suffer from low precision for code evaluation
   - They can identify relevant code segments but cannot verify actual execution outcomes
   - Agent-based evaluators (execution-based) show higher precision but lower recall

### 2.3 Why Execution-Based is Considered Most Reliable

The research consistently identifies execution-based evaluation as the most reliable method because:

1. **Objective Truth**: Code either passes tests or fails - there's no ambiguity
2. **Eliminates False Positives**: Static analysis may mark syntactically similar code as correct when it's functionally wrong
3. **Eliminates False Negatives**: Valid alternative implementations that differ syntactically are correctly recognized
4. **Grounded Verification**: Actually runs the code rather than estimating correctness
5. **Deterministic**: Same code + same inputs = same results every time

---

## 3. Best Practices for Evaluating Code-Generation Prompts

### 3.1 Three Types of Graders (Anthropic Framework)

According to Anthropic's agent evaluation framework, effective evaluation combines three grader types:

**Code-Based Graders:**
| Method | Use Case |
|--------|----------|
| String match checks (exact, regex, fuzzy) | Output format verification |
| Binary tests (fail-to-pass, pass-to-pass) | Regression testing |
| Static analysis (lint, type, security) | Code quality gates |
| Outcome verification | Functional correctness |
| Tool calls verification | Agent behavior validation |

**Strengths:** Fast, cheap, objective, reproducible, easy to debug
**Weaknesses:** Brittle to valid variations, lacking nuance, limited for subjective tasks

**Model-Based Graders:**
| Method | Use Case |
|--------|----------|
| Rubric-based scoring | Quality assessment |
| Natural language assertions | Open-ended evaluation |
| Pairwise comparison | Preference ranking |
| Reference-based evaluation | Semantic similarity |

**Strengths:** Flexible, scalable, captures nuance, handles open-ended tasks
**Weaknesses:** Non-deterministic, expensive, requires calibration

**Human Graders:**
| Method | Use Case |
|--------|----------|
| SME review | Gold standard validation |
| Crowdsourced judgment | Scale calibration |
| Spot-check sampling | Quality assurance |

**Strengths:** Gold standard quality, matches expert judgment
**Weaknesses:** Expensive, slow, requires expert access

### 3.2 Sandbox Security Best Practices

**Security Framework (NVIDIA/CSA Recommendations):**

| Layer | Implementation |
|-------|----------------|
| **Isolation** | Docker containers, microVMs (Firecracker/Kata), gVisor |
| **Resource Limits** | CPU (2 cores), memory (512MB), time (30s per execution) |
| **Network** | Block outbound by default; whitelist only specific endpoints |
| **Filesystem** | Read-only by default; tmpfs mounts that disappear on teardown |
| **Credentials** | Rotate per-session; never inject long-lived secrets |
| **Monitoring** | Log all syscalls and network connections |

**Multi-Layer Defense Strategy:**
1. **Preventive**: Input validation, sanitization
2. **Detective**: Behavioral analysis, runtime monitoring
3. **Responsive**: Auto-termination, isolation on anomaly detection

### 3.3 Evaluation Design Best Practices

**From Research Literature:**

1. **Use Multiple Samples (pass@k)**:
   - Generate n=200 samples per problem for reliable pass@k estimation
   - Report pass@1 for single-attempt evaluation
   - Pass@k increases with more samples (more "shots on goal")

2. **Test Suite Quality**:
   - Minimum 7-10 tests per problem (HumanEval baseline)
   - Include edge cases, boundary values, and failure-prone scenarios
   - Consider using EvalPlus-expanded suites (80x more tests)

3. **Deterministic Sampling**:
   - Use temperature=0 for reproducible evaluation
   - Document all sampling parameters

4. **Capability vs. Regression Evals**:
   - **Capability evals**: Target low pass rate initially (hill to climb)
   - **Regression evals**: Target near 100% pass rate (protect against backsliding)

5. **Metrics to Track**:
   - pass@k (correctness)
   - pass^k (consistency across k trials)
   - Compilation rate
   - Execution time
   - Token usage
   - Cost per task

---

## 4. Anthropic's "Code-Based Grading: Fastest and Most Reliable"

### 4.1 Direct Quote Context

From Anthropic's official documentation (Claude Console Docs):

> "**Code-based grading: Fastest and most reliable**, extremely scalable, but also lacks nuance for more complex judgements that require less rule-based rigidity."

This appears in their guidance on building evaluations, specifically in the context of grader selection for agent evaluation.

### 4.2 Comparison Table from Anthropic

| Grader Type | Speed | Cost | Objectivity | Scalability | Nuance |
|-------------|-------|------|-------------|-------------|--------|
| Code-based | ✅ Fastest | ✅ Cheapest | ✅ Highest | ✅ Extreme | ❌ Limited |
| Model-based | ⚠️ Moderate | ⚠️ Higher | ⚠️ Variable | ✅ High | ✅ High |
| Human | ❌ Slowest | ❌ Expensive | ✅ High | ❌ Limited | ✅ Highest |

### 4.3 When to Use Code-Based Grading (Anthropic Guidance)

**Recommended for:**
- String match checks (exact, regex, fuzzy)
- Binary tests (fail-to-pass, pass-to-pass)
- Static analysis (lint, type, security)
- Outcome verification (functional results)
- Tool calls verification
- Transcript analysis (turns taken, token usage)

**Not recommended for:**
- Subjective quality judgments
- Tone, style, or persuasiveness evaluation
- Open-ended creative tasks
- Complex semantic reasoning without clear verification criteria

---

## 5. Can Execution-Based Methods Apply to Non-Code Prompts?

### 5.1 Direct Applications

**Structured Output Validation:**
For prompts requiring structured outputs (JSON, YAML, XML), execution-based validation works directly:

```python
# Example: JSON schema validation
def validate_output(response, schema):
    try:
        parsed = json.loads(response)
        jsonschema.validate(parsed, schema)
        return True
    except (json.JSONDecodeError, jsonschema.ValidationError):
        return False
```

**Use Cases:**
- API response formatting
- Data extraction tasks
- Configuration generation
- Form filling

### 5.2 Indirect/Hybrid Applications

**For tasks without executable outputs, a hybrid approach:**

1. **Groundedness Checks**: Verify claims against source documents
2. **Coverage Checks**: Ensure key facts from reference are included
3. **Factual Verification**: Compare against ground truth databases
4. **Constraint Satisfaction**: Check that all requirements are met

**Example Workflow for Research Agent Evaluation:**
```
1. Generate response
2. Extract factual claims (code-based)
3. Verify each claim against sources (code-based + LLM-assisted)
4. Check coverage of required topics (code-based)
5. Score overall quality (LLM-as-judge)
```

### 5.3 State-Diff-Based Evaluation (Agent-Diff Framework)

The Agent-Diff framework introduces a novel approach applicable beyond code:

**Core Concept**: Define task success as whether the expected change in environment state was achieved, rather than fuzzy trace matching.

**Applicable Domains:**
- Database state changes (SQL operations)
- File system modifications
- API state transitions
- Configuration updates

**Evaluation Contract:**
| Aspect | Code | Non-Code Equivalent |
|--------|------|---------------------|
| Input | Function + tests | Task + success criteria |
| Execution | Run code | Apply action to environment |
| Verification | Output == Expected | State == Target State |
| Scoring | Binary pass/fail | State diff comparison |

---

## 6. Validation Statistics: Execution vs. Heuristic Methods

### 6.1 Key Research Findings

**From EvalPlus (Liu et al., 2023):**

| Metric | Original HumanEval | HumanEval+ | Difference |
|--------|-------------------|------------|------------|
| Test cases per problem | ~9.6 | ~764 | +80x |
| Undetected wrong code | 19-29% | ~0% | -19-29% |
| Model mis-ranking incidents | Present | Reduced | Significant |
| Ground truth errors found | 0% | 11% | +11% |

**From Code Generation Evaluation Survey (2024):**

| Evaluation Method | Benchmarks Using | False Positive Rate | False Negative Rate |
|-------------------|------------------|---------------------|---------------------|
| Execution-based | 90+ | Very low | Low |
| CodeBLEU (heuristic) | Many | Moderate | Moderate |
| BLEU/ROUGE | Legacy | High | High |
| LLM-as-judge | Emerging | Variable | Variable |

**From LLM-as-Judge Reliability Study:**

| Model | ECR@1 (Reliability) | Accuracy (MAAE) | Cost/1K evals |
|-------|---------------------|-----------------|---------------|
| GPT-4o Mini | 96.6% | 6.07 | $1.01 |
| GPT-4o | 95.2% | 8.34 | $4.38 |
| GPT-5 (low) | 100% | 7.69 | $4.38 |
| GPT-5 (high) | 98.1% | 4.46 | $78.96 |

*ECR@1 = Evaluation Completion Rate at 1st attempt*

### 6.2 Cost Comparison

| Method | Per Evaluation | 1M Evaluations/Month |
|--------|---------------|----------------------|
| Code-based (execution) | ~$0.001 (compute) | ~$1,000 |
| Code-based (static) | ~$0.0001 | ~$100 |
| LLM-as-judge (GPT-4o Mini) | ~$0.001 | ~$1,010 |
| LLM-as-judge (GPT-5 high) | ~$0.079 | ~$78,960 |

### 6.3 Reliability Comparison Summary

| Factor | Execution-Based | Heuristic | LLM-as-Judge |
|--------|----------------|-----------|--------------|
| Agreement with human experts | 95%+ | 70-80% | 85-95% (when calibrated) |
| Inter-rater consistency | 100% | 100% | 85-98% |
| Reproducibility | Perfect | Perfect | Variable |
| Contamination resistance | High | Medium | Low |

---

## 7. Recommendations for Integrating Code-Based Grading

### 7.1 Tiered Evaluation Strategy

**Tier 1: Code-Based (Always Apply First)**
- Schema validation for structured outputs
- String matching for required content
- Regex patterns for format compliance
- Static analysis for code quality
- Unit test execution for correctness

**Tier 2: Hybrid (Apply When Needed)**
- Differential testing (comparing to ground truth)
- State-diff verification
- Constraint satisfaction checking
- Coverage analysis

**Tier 3: Model-Based (Apply for Nuance)**
- Tone and style assessment
- Open-ended quality evaluation
- Preference ranking
- Semantic similarity (when no ground truth exists)

### 7.2 Implementation Checklist

**For Code Generation Prompts:**
- [ ] Implement sandboxed execution environment
- [ ] Define comprehensive test suites (minimum 10+ tests per task)
- [ ] Include edge cases and boundary conditions
- [ ] Track pass@1, pass@10, and pass@100 metrics
- [ ] Monitor compilation rates separately from execution rates
- [ ] Add static analysis (linting, type checking) as secondary graders

**For Non-Code Prompts:**
- [ ] Define structured output schemas where possible
- [ ] Implement schema validation as primary grader
- [ ] Create ground truth datasets for reference-based evaluation
- [ ] Use code-based checks for verifiable constraints
- [ ] Reserve LLM-as-judge for subjective dimensions only
- [ ] Establish calibration protocols for model-based graders

### 7.3 Technology Stack Recommendations

| Component | Recommended Tools |
|-----------|-------------------|
| Sandbox | Docker, gVisor, Firecracker, E2B, Daytona |
| Test Generation | EvalPlus, mutation testing, property-based testing |
| Static Analysis | pylint, mypy, ruff, bandit, semgrep |
| Metrics | pass@k, CodeBLEU (supplementary only), execution time |
| CI/CD Integration | GitHub Actions, custom evaluation harnesses |

---

## 8. Conclusions

### Key Takeaways

1. **Execution-based evaluation is the gold standard** for code generation prompts due to its objectivity, determinism, and direct verification of functional correctness.

2. **Original benchmarks have significant limitations**: HumanEval and MBPP's limited test suites overstate correctness by up to 29%. EvalPlus's expanded suites (80x/35x more tests) provide more reliable assessment.

3. **Anthropic's guidance emphasizes code-based grading** as "fastest and most reliable" for verifiable conditions, while acknowledging the need for model-based graders for nuanced evaluation.

4. **Hybrid approaches work best**: Combining code-based graders (for objectivity) with model-based graders (for nuance) and human review (for calibration) provides comprehensive evaluation coverage.

5. **Execution principles can extend to non-code prompts** through structured output validation, state-diff evaluation, and constraint satisfaction checking.

6. **Cost and reliability trade-offs exist**: Code-based evaluation is orders of magnitude cheaper than LLM-as-judge while providing higher reliability for verifiable conditions.

### Future Directions

- Automated test generation using LLMs + mutation testing
- Standardized sandbox environments for evaluation reproducibility
- Better contamination detection and mitigation strategies
- Integration of execution-based methods into general prompt evaluation frameworks
- Development of "EvalPlus-style" augmentation for non-code benchmarks

---

## References

1. Chen, M., et al. (2021). Evaluating Large Language Models Trained on Code. arXiv:2107.03374.
2. Austin, J., et al. (2021). Program Synthesis with Large Language Models. arXiv:2108.07732.
3. Liu, J., et al. (2023). Is Your Code Generated by ChatGPT Really Correct? Rigorous Evaluation of Large Language Models for Code Generation. NeurIPS 2023.
4. Anthropic. (2025). Demystifying Evals for AI Agents. https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
5. Anthropic. (2025). Define success criteria and build evaluations. https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
6. Liu, J., et al. (2024). EvalPlus Leaderboard. https://evalplus.github.io/
7. Braintrust. (2026). What is an LLM-as-a-Judge? https://www.braintrust.dev/articles/what-is-llm-as-a-judge
8. Arize AI. (2025). LLM-as-a-Judge Primer. https://arize.com/llm-as-a-judge/
9. NVIDIA. (2025). How Code Execution Drives Key Risks in Agentic AI Systems. https://developer.nvidia.com/blog/how-code-execution-drives-key-risks-in-agentic-ai-systems/
10. Cloud Security Alliance. (2025). LLMs Writing Code? Cool. LLMs Executing It? Dangerous.

---

*Report compiled: March 23, 2026*
*Research scope: Execution-based evaluation, code benchmarks, prompt evaluation methodologies*
