import { computeScore } from './metric';

describe('computeScore', () => {
    
  describe('with breadthWeighting=1', () => {
    const breadthWeighting = 1;
    
    it.each([
      [0, 0, 0],
      [0, 0.25, 0.13],
      [0.2, 0.25, 0.23],
      [0.2, 0.75, 0.48],
      [0.5, 0.25, 0.38],
      [0.5, 0.75, 0.63],
      [0.75, 0.25, 0.5],
      [0.75, 0.75, 0.75],
      [0.75, 1, 0.88],
      [1.25, 0.25, 0.75],
      [1.25, 0.75, 1],
      [1.25, 1, 1.13],
      [3, 0.25, 1.63],
      [3, 0.75, 1.88],
      [3, 1, 2]
    ])('should compute score with depth=%f, breadth=%f (expected: %f)', 
      (depth, breadth, expected) => {
        expect(computeScore(depth, breadth, breadthWeighting))
          .toBe(expected);
      }
    );
  });
  
  describe('with breadthWeighting=2', () => {
    const breadthWeighting = 2;
    
    it.each([
      [0, 0, 0],
      [0, 0.25, 0.17],
      [0.2, 0.25, 0.23],
      [0.2, 0.75, 0.57],
      [0.5, 0.25, 0.33],
      [0.5, 0.75, 0.67],
      [0.75, 0.25, 0.42],
      [0.75, 0.75, 0.75],
      [0.75, 1, 0.92],
      [1.25, 0.25, 0.58],
      [1.25, 0.75, 0.92],
      [1.25, 1, 1.08],
      [3, 0.25, 1.17],
      [3, 0.75, 1.5],
      [3, 1, 1.67]
    ])('should compute score with depth=%f, breadth=%f (expected: %f)', 
      (depth, breadth, expected) => {
        expect(computeScore(depth, breadth, breadthWeighting))
          .toBe(expected);
      }
    );
  });
});