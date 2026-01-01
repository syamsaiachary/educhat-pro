import { Intent } from '../types';

// Simple stop words list
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
  'where', 'when', 'how', 'who', 'which', 'this', 'that', 'these', 'those',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'to', 'from', 'in', 'out', 'on', 'off', 'over', 'under'
]);

// Simple tokenizer and cleaner
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // remove punctuation
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
};

interface TermVector {
  [term: string]: number;
}

export class NLPService {
  private intents: Intent[];
  private vocabulary: Set<string>;
  private docVectors: Map<string, TermVector>; // Intent ID -> Vector
  private idf: Map<string, number>;

  constructor(intents: Intent[]) {
    this.intents = intents;
    this.vocabulary = new Set();
    this.docVectors = new Map();
    this.idf = new Map();
    this.train();
  }

  private train() {
    // 1. Build Vocabulary
    const docs: { id: string; tokens: string[] }[] = [];
    
    this.intents.forEach(intent => {
      // Combine all patterns into one "document" for the intent
      const combinedText = intent.patterns.join(' ');
      const tokens = tokenize(combinedText);
      tokens.forEach(t => this.vocabulary.add(t));
      docs.push({ id: intent.id, tokens });
    });

    // 2. Calculate IDF
    const N = docs.length;
    this.vocabulary.forEach(term => {
      let df = 0;
      docs.forEach(doc => {
        if (doc.tokens.includes(term)) df++;
      });
      // Add 1 to avoid division by zero, log(N / (df + 1)) + 1 is standard sklearn-like smoothing
      this.idf.set(term, Math.log((N + 1) / (df + 1)) + 1);
    });

    // 3. Calculate TF-IDF Vectors for Intents
    docs.forEach(doc => {
      this.docVectors.set(doc.id, this.computeTFIDF(doc.tokens));
    });
  }

  private computeTFIDF(tokens: string[]): TermVector {
    const tf: { [term: string]: number } = {};
    const vector: TermVector = {};

    tokens.forEach(t => {
      tf[t] = (tf[t] || 0) + 1;
    });

    // Normalize TF (term count / total terms) - Optional but good
    // For this simple implementation, raw count * IDF is sufficient for short texts,
    // but we will use standard TF-IDF
    
    Object.keys(tf).forEach(term => {
      if (this.idf.has(term)) {
        vector[term] = tf[term] * (this.idf.get(term) || 0);
      }
    });

    return vector;
  }

  private cosineSimilarity(vecA: TermVector, vecB: TermVector): number {
    const terms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    terms.forEach(term => {
      const valA = vecA[term] || 0;
      const valB = vecB[term] || 0;
      dotProduct += valA * valB;
      magA += valA * valA;
      magB += valB * valB;
    });

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
  }

  public getBestMatch(query: string): Intent | null {
    const tokens = tokenize(query);
    if (tokens.length === 0) return null;

    const queryVector = this.computeTFIDF(tokens);
    let bestScore = 0;
    let bestIntent: Intent | null = null;

    this.intents.forEach(intent => {
      const intentVector = this.docVectors.get(intent.id);
      if (intentVector) {
        const score = this.cosineSimilarity(queryVector, intentVector);
        if (score > bestScore) {
          bestScore = score;
          bestIntent = intent;
        }
      }
    });

    // Threshold can be adjusted. 0.2 is reasonable for this simple implementation.
    return bestScore > 0.2 ? bestIntent : null;
  }
}