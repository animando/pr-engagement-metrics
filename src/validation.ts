import chalk from 'chalk';

function validateWeight(WEIGHT: string): number {

  const weight = parseFloat(WEIGHT);
  if (isNaN(weight) || weight < 0.25) {
    console.error(chalk.red('Error: Weight must be a number >= 0.25'));
    process.exit(1);
  }
  return weight
}

function validateToken(GITHUB_TOKEN: string | undefined) {
  if (!GITHUB_TOKEN) {
    console.error(chalk.red('Error: GITHUB_TOKEN environment variable is not set'));
    console.log(chalk.yellow('Please set your GitHub token with:'));
    console.log('  export GITHUB_TOKEN=your_github_token');
    process.exit(1);
  }
  return GITHUB_TOKEN
}

function validateDepthDiminishingFactor(value: string) {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed <= 0 || parsed >= 1) {
    console.error(chalk.red('Error: Depth diminishing factor must be a number greater than 0 and less than 1'));
    process.exit(1);
  }
  return parsed;
}

export {
  validateToken,
  validateWeight,
  validateDepthDiminishingFactor
}