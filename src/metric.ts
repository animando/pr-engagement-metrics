
export function computeScore(depth: number, breadth: number, breadthWeighting: number, depthDiminishingFactor: number): number {
  const scaledDepth = 1 - Math.pow(depthDiminishingFactor, depth);

  const score = (scaledDepth + breadth * breadthWeighting) / (1 + breadthWeighting);
  
  return Math.round(score * 100) / 100;
}