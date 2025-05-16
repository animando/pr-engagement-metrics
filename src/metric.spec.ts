import { computeScore } from './metric';

describe('computeScore', () => {
  describe('with depthDiminishingFactor=0.4', () => {
    const depthDiminishingFactor = 0.4;
    
    describe('with breadthWeighting=1', () => {
      const breadthWeighting = 1;
      
      it.each([
        [0, 0, 0],
        [0, 0.25, 0.13],
        [0.2, 0.25, 0.21],
        [0.2, 0.75, 0.46],
        [0.5, 0.25, 0.31],
        [0.5, 0.75, 0.56],
        [0.75, 0.25, 0.37],
        [0.75, 0.75, 0.62],
        [0.75, 1, 0.75],
        [1.25, 0.25, 0.47],
        [1.25, 0.75, 0.72],
        [1.25, 1, 0.84],
        [3, 0.25, 0.59],
        [3, 0.75, 0.84],
        [3, 1, 0.97]
      ])('should compute score with depth=%f, breadth=%f (expected: %f)', 
        (depth, breadth, expected) => {
          expect(computeScore(depth, breadth, breadthWeighting, depthDiminishingFactor))
            .toBe(expected);
        }
      );
    });
    
    describe('with breadthWeighting=2', () => {
      const breadthWeighting = 2;
      
      it.each([
        [0, 0, 0],
        [0, 0.25, 0.17],
        [0.2, 0.25, 0.22],
        [0.2, 0.75, 0.56],
        [0.5, 0.25, 0.29],
        [0.5, 0.75, 0.62],
        [0.75, 0.25, 0.33],
        [0.75, 0.75, 0.67],
        [0.75, 1, 0.83],
        [1.25, 0.25, 0.39],
        [1.25, 0.75, 0.73],
        [1.25, 1, 0.89],
        [3, 0.25, 0.48],
        [3, 0.75, 0.81],
        [3, 1, 0.98]
      ])('should compute score with depth=%f, breadth=%f (expected: %f)', 
        (depth, breadth, expected) => {
          expect(computeScore(depth, breadth, breadthWeighting, depthDiminishingFactor))
            .toBe(expected);
        }
      );
    });
  });

  describe('with depthDiminishingFactor=0.6', () => {
    const depthDiminishingFactor = 0.6;
    
    describe('with breadthWeighting=1', () => {
      const breadthWeighting = 1;
      
      it.each([
        [0, 0, 0],
        [0, 0.25, 0.13],
        [0.2, 0.25, 0.17],
        [0.2, 0.75, 0.42],
        [0.5, 0.25, 0.24],
        [0.5, 0.75, 0.49],
        [0.75, 0.25, 0.28],
        [0.75, 0.75, 0.53],
        [0.75, 1, 0.66],
        [1.25, 0.25, 0.36],
        [1.25, 0.75, 0.61],
        [1.25, 1, 0.74],
        [3, 0.25, 0.52],
        [3, 0.75, 0.77],
        [3, 1, 0.89]
      ])('should compute score with depth=%f, breadth=%f (expected: %f)', 
        (depth, breadth, expected) => {
          expect(computeScore(depth, breadth, breadthWeighting, depthDiminishingFactor))
            .toBe(expected);
        }
      );
    });
    
    describe('with breadthWeighting=2', () => {
      const breadthWeighting = 2;
      
      it.each([
        [0, 0, 0],
        [0, 0.25, 0.17],
        [0.2, 0.25, 0.2],
        [0.2, 0.75, 0.53],
        [0.5, 0.25, 0.24],
        [0.5, 0.75, 0.58],
        [0.75, 0.25, 0.27],
        [0.75, 0.75, 0.61],
        [0.75, 1, 0.77],
        [1.25, 0.25, 0.32],
        [1.25, 0.75, 0.66],
        [1.25, 1, 0.82],
        [3, 0.25, 0.43],
        [3, 0.75, 0.76],
        [3, 1, 0.93]
      ])('should compute score with depth=%f, breadth=%f (expected: %f)', 
        (depth, breadth, expected) => {
          expect(computeScore(depth, breadth, breadthWeighting, depthDiminishingFactor))
            .toBe(expected);
        }
      );
    });
  });
});