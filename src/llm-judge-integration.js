/**
 * LLM-as-Judge Integration with Bias Mitigation
 * For PromptLens - Uses local Ollama instance
 * 
 * Based on research:
 * - Position bias mitigation: Swap positions, average judgments
 * - Rubric-based evaluation with Chain-of-Thought
 * - Multi-sample aggregation for reliability
 * - Correlation tracking with user feedback
 */

class LLMJudge {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
    this.model = config.model || 'gpt-oss:20b';
    this.temperature = config.temperature || 0.3; // Low temp for consistency
    this.maxRetries = config.maxRetries || 3;
    
    // Bias mitigation settings
    this.positionSwap = config.positionSwap !== false; // Default true
    this.numSamples = config.numSamples || 3; // Multiple samples for aggregation
    
    // Ground truth collection
    this.feedbackStore = this.loadFeedbackStore();
  }

  /**
   * Load stored feedback and ground truth data
   */
  loadFeedbackStore() {
    try {
      const stored = localStorage.getItem('promptlens_ground_truth');
      return stored ? JSON.parse(stored) : { entries: [], correlations: {} };
    } catch {
      return { entries: [], correlations: {} };
    }
  }

  /**
   * Save feedback to ground truth dataset
   */
  saveFeedbackStore() {
    try {
      localStorage.setItem('promptlens_ground_truth', JSON.stringify(this.feedbackStore));
    } catch (e) {
      console.warn('Failed to save ground truth:', e);
    }
  }

  /**
   * Evaluate prompt using LLM-as-Judge with rubric
   * Returns structured evaluation with confidence metrics
   */
  async evaluatePrompt(prompt, goal = 'general', modelOutput = null) {
    const rubric = this.getRubric(goal);
    
    // Build evaluation prompt with CoT
    const evalPrompt = this.buildEvaluationPrompt(prompt, rubric, goal, modelOutput);
    
    // Get multiple samples for aggregation
    const samples = await this.getMultipleSamples(evalPrompt);
    
    // Aggregate scores
    const aggregated = this.aggregateScores(samples);
    
    // Position bias check (if comparing)
    if (this.positionSwap && modelOutput) {
      const swapped = await this.checkPositionBias(prompt, modelOutput, rubric);
      aggregated.positionBias = swapped.bias;
      aggregated.positionConsistent = swapped.consistent;
    }
    
    return {
      goal,
      scores: aggregated.scores,
      confidence: aggregated.confidence,
      reasoning: aggregated.reasoning,
      biasMetrics: {
        positionBias: aggregated.positionBias || null,
        sampleVariance: aggregated.sampleVariance,
        consistency: aggregated.positionConsistent || null
      },
      rawSamples: samples,
      timestamp: Date.now()
    };
  }

  /**
   * Get rubric for specific goal
   */
  getRubric(goal) {
    const rubrics = {
      efficient: {
        name: 'Efficiency',
        description: 'Optimize for clear, concise, actionable outputs',
        criteria: [
          { name: 'clarity', weight: 0.25, desc: 'Instructions are unambiguous and direct' },
          { name: 'conciseness', weight: 0.20, desc: 'No unnecessary words or redundancy' },
          { name: 'specificity', weight: 0.25, desc: 'Concrete requirements, not vague adjectives' },
          { name: 'structure', weight: 0.15, desc: 'Logical organization of requirements' },
          { name: 'actionability', weight: 0.15, desc: 'Clear next steps or deliverables defined' }
        ]
      },
      creative: {
        name: 'Creativity',
        description: 'Optimize for imaginative, engaging, original outputs',
        criteria: [
          { name: 'inspiration', weight: 0.30, desc: 'Provides evocative starting points without over-constraining' },
          { name: 'ambiguity', weight: 0.20, desc: 'Strategic ambiguity that sparks model improvisation (NOT a penalty)' },
          { name: 'style_guidance', weight: 0.25, desc: 'Clear aesthetic/tone direction' },
          { name: 'constraint_balance', weight: 0.15, desc: 'Constraints enable rather than restrict creativity' },
          { name: 'originality_potential', weight: 0.10, desc: 'Room for surprising, non-obvious outputs' }
        ]
      },
      programmatic: {
        name: 'Programmatic',
        description: 'Optimize for code generation and technical accuracy',
        criteria: [
          { name: 'language_clarity', weight: 0.25, desc: 'Programming language/framework clearly specified' },
          { name: 'io_spec', weight: 0.25, desc: 'Input/output formats defined' },
          { name: 'requirements', weight: 0.25, desc: 'Functional requirements enumerated' },
          { name: 'edge_cases', weight: 0.15, desc: 'Error handling and edge cases considered' },
          { name: 'testability', weight: 0.10, desc: 'How to verify correctness is implied or stated' }
        ]
      },
      bugfixing: {
        name: 'Bug Fixing',
        description: 'Optimize for debugging and error resolution',
        criteria: [
          { name: 'error_context', weight: 0.30, desc: 'Error message and context provided' },
          { name: 'reproduction', weight: 0.25, desc: 'Steps to reproduce clearly stated' },
          { name: 'environment', weight: 0.20, desc: 'System/environment details included' },
          { name: 'expected_behavior', weight: 0.15, desc: 'What should happen vs what actually happens' },
          { name: 'attempted_fixes', weight: 0.10, desc: 'What has already been tried' }
        ]
      },
      general: {
        name: 'General',
        description: 'Balanced evaluation across dimensions',
        criteria: [
          { name: 'clarity', weight: 0.30, desc: 'Instructions are understandable' },
          { name: 'specificity', weight: 0.25, desc: 'Concrete details provided' },
          { name: 'context', weight: 0.20, desc: 'Relevant background included' },
          { name: 'format', weight: 0.15, desc: 'Output format guidance given' },
          { name: 'scope', weight: 0.10, desc: 'Clear boundaries of the task' }
        ]
      }
    };
    
    return rubrics[goal] || rubrics.general;
  }

  /**
   * Build evaluation prompt with Chain-of-Thought
   */
  buildEvaluationPrompt(prompt, rubric, goal, modelOutput) {
    const criteriaText = rubric.criteria.map((c, i) => 
      `${i + 1}. ${c.name} (${Math.round(c.weight * 100)}%): ${c.desc}`
    ).join('\n');
    
    let outputSection = '';
    if (modelOutput) {
      outputSection = `

## Model Output to Evaluate Against:
${modelOutput}
`;
    }
    
    return `You are an expert prompt engineer evaluating prompt quality.

## Prompt to Evaluate:
"""
${prompt}
"""${outputSection}

## Evaluation Context:
Goal: ${rubric.name}
Description: ${rubric.description}

## Evaluation Criteria:
${criteriaText}

## Instructions:
1. Think through each criterion step by step
2. Rate each criterion 1-10 (10 = excellent)
3. Provide brief justification for each score
4. Calculate weighted overall score
5. Identify 2-3 specific improvements

## Response Format (JSON):
{
  "reasoning": "Brief chain-of-thought analysis",
  "criteria": {
    "${rubric.criteria[0].name}": { "score": 8, "justification": "..." },
    // ... for each criterion
  },
  "overall_score": 75,
  "overall_justification": "Summary assessment",
  "improvements": ["specific suggestion 1", "specific suggestion 2"]
}`;
  }

  /**
   * Get multiple samples for aggregation
   */
  async getMultipleSamples(prompt) {
    const samples = [];
    
    for (let i = 0; i < this.numSamples; i++) {
      try {
        const response = await this.callOllama(prompt);
        const parsed = this.parseResponse(response);
        if (parsed) samples.push(parsed);
      } catch (e) {
        console.warn(`Sample ${i + 1} failed:`, e);
      }
    }
    
    return samples;
  }

  /**
   * Call Ollama API
   */
  async callOllama(prompt) {
    const url = `${this.baseUrl}/api/generate`;
    
    const body = {
      model: this.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: this.temperature,
        num_predict: 2000
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response;
  }

  /**
   * Parse LLM response to extract JSON
   */
  parseResponse(response) {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || 
                        response.match(/\{[\s\S]*\}/);
      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Failed to parse response:', e);
      return null;
    }
  }

  /**
   * Aggregate scores from multiple samples
   */
  aggregateScores(samples) {
    if (samples.length === 0) {
      return { scores: null, confidence: 'none', reasoning: 'No valid samples' };
    }
    
    if (samples.length === 1) {
      return { 
        scores: samples[0], 
        confidence: 'low', 
        reasoning: samples[0].reasoning,
        sampleVariance: 0
      };
    }
    
    // Calculate mean scores for each criterion
    const criteriaNames = Object.keys(samples[0].criteria || {});
    const aggregatedCriteria = {};
    
    criteriaNames.forEach(name => {
      const scores = samples
        .map(s => s.criteria?.[name]?.score)
        .filter(s => typeof s === 'number');
      
      if (scores.length > 0) {
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
        
        aggregatedCriteria[name] = {
          score: Math.round(mean * 10) / 10,
          stdDev: Math.round(Math.sqrt(variance) * 10) / 10,
          min: Math.min(...scores),
          max: Math.max(...scores),
          samples: scores.length
        };
      }
    });
    
    // Calculate overall score variance
    const overallScores = samples
      .map(s => s.overall_score)
      .filter(s => typeof s === 'number');
    
    const meanOverall = overallScores.reduce((a, b) => a + b, 0) / overallScores.length;
    const varianceOverall = overallScores.reduce((sum, s) => sum + Math.pow(s - meanOverall, 2), 0) / overallScores.length;
    
    // Confidence based on variance
    let confidence = 'low';
    if (varianceOverall < 25) confidence = 'high';
    else if (varianceOverall < 100) confidence = 'medium';
    
    // Collect all improvements
    const allImprovements = samples.flatMap(s => s.improvements || []);
    const uniqueImprovements = [...new Set(allImprovements)].slice(0, 5);
    
    return {
      scores: {
        criteria: aggregatedCriteria,
        overall: Math.round(meanOverall),
        overallRange: [Math.round(Math.min(...overallScores)), Math.round(Math.max(...overallScores))]
      },
      confidence,
      sampleVariance: Math.round(varianceOverall * 10) / 10,
      reasoning: samples[0].reasoning, // Use first sample's reasoning
      improvements: uniqueImprovements
    };
  }

  /**
   * Check for position bias (critical bias mitigation)
   */
  async checkPositionBias(prompt, output, rubric) {
    // First evaluation: Original order
    const promptA = this.buildComparisonPrompt(prompt, output, rubric, 'A', 'B');
    const resultA = await this.callOllama(promptA);
    
    // Second evaluation: Swapped order
    const promptB = this.buildComparisonPrompt(output, prompt, rubric, 'A', 'B');
    const resultB = await this.callOllama(promptB);
    
    // Parse preferences
    const prefA = this.parsePreference(resultA);
    const prefB = this.parsePreference(resultB);
    
    // Check consistency
    const consistent = prefA === prefB;
    const bias = consistent ? 'none' : 
                 (prefA === 'first' || prefB === 'second') ? 'position' : 'content';
    
    return { consistent, bias, prefA, prefB };
  }

  /**
   * Build comparison prompt for position bias check
   */
  buildComparisonPrompt(option1, option2, rubric, label1, label2) {
    return `Compare these two options for ${rubric.name}:

[${label1}]:
${option1}

[${label2}]:
${option2}

Which is better for ${rubric.description}? Reply with ONLY "${label1}", "${label2}", or "tie".`;
  }

  /**
   * Parse preference from comparison
   */
  parsePreference(response) {
    const lower = response.toLowerCase();
    if (lower.includes('first') || lower.includes('a')) return 'first';
    if (lower.includes('second') || lower.includes('b')) return 'second';
    return 'tie';
  }

  /**
   * Collect user feedback for ground truth
   */
  collectUserFeedback(prompt, heuristicScore, llmScore, userRating, goal) {
    const entry = {
      id: Date.now().toString(36),
      timestamp: Date.now(),
      prompt,
      goal,
      scores: {
        heuristic: heuristicScore,
        llmJudge: llmScore
      },
      userRating, // 👍 = 1, 👎 = -1, or 1-10 scale
      validated: false
    };
    
    this.feedbackStore.entries.push(entry);
    this.saveFeedbackStore();
    this.updateCorrelations();
    
    return entry;
  }

  /**
   * Calculate correlations between scores and user ratings
   */
  updateCorrelations() {
    const entries = this.feedbackStore.entries.filter(e => e.userRating !== null);
    
    if (entries.length < 10) {
      this.feedbackStore.correlations = { 
        status: 'insufficient_data',
        message: `Need ${10 - entries.length} more ratings`
      };
      return;
    }
    
    // Calculate Pearson correlation
    const heuristicCorrelation = this.calculatePearson(
      entries.map(e => e.scores.heuristic),
      entries.map(e => e.userRating)
    );
    
    const llmCorrelation = this.calculatePearson(
      entries.map(e => e.scores.llmJudge),
      entries.map(e => e.userRating)
    );
    
    this.feedbackStore.correlations = {
      status: 'calculated',
      n: entries.length,
      heuristic: heuristicCorrelation,
      llmJudge: llmCorrelation,
      winner: heuristicCorrelation > llmCorrelation ? 'heuristic' : 'llmJudge',
      timestamp: Date.now()
    };
    
    this.saveFeedbackStore();
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  calculatePearson(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get correlation report
   */
  getCorrelationReport() {
    return this.feedbackStore.correlations;
  }

  /**
   * Export ground truth dataset
   */
  exportGroundTruth() {
    return {
      metadata: {
        totalEntries: this.feedbackStore.entries.length,
        ratedEntries: this.feedbackStore.entries.filter(e => e.userRating !== null).length,
        correlations: this.feedbackStore.correlations,
        exportedAt: new Date().toISOString()
      },
      data: this.feedbackStore.entries
    };
  }
}

// Export for use in PromptLens
if (typeof window !== 'undefined') {
  window.LLMJudge = LLMJudge;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LLMJudge;
}
