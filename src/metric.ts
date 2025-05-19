
export function computeScore(normalisedDepth: number, breadth: number, breadthWeighting: number): number {

  const score = (normalisedDepth + (breadth * breadthWeighting)) / (1 + breadthWeighting);
  
  return Math.round(score * 100) / 100;
}