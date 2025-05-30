import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Command, Option } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Config } from './types';
import { github } from './github'
import { processor } from './processor'
import { reporter } from './reporter'
import { validateWeight, validateToken, validateDepthDiminishingFactor, validateConfig } from './validation';
import { utils } from './utils';

async function main(): Promise<void> {
  const program = new Command();

  program
    .name('github-engagement')
    .description('Analyze team engagement patterns on GitHub pull requests')
    .version('1.0.15')
    .requiredOption('-o, --org <org>', 'GitHub organization')
    .requiredOption('-r, --repo <repo>', 'GitHub repository')
    .option('-t, --days <days>', 'Number of days to look back', '5')
    .option('-e, --end <end>', 'Number of days back to end')
    .option('-d, --debug', 'Enable debug output with detailed activity', false)
    .addOption(
      new Option('-s, --depth-diminishing-factor <depthDiminishingFactor>', 'The rate at which importance of ever-increasing depth diminishes (>0 <1)')
        .default('0.7')
        .argParser(validateDepthDiminishingFactor)
    )
    .addOption(
      new Option('-w, --weight <breadthWeight>', 'Weight for engagement breadth')
        .default(3)
        .argParser(validateWeight)
    )
    .addOption(new Option('-n, --with-names', 'Display names').default(false))
    .parse(process.argv);

  const options = program.opts();

  const DAYS = parseInt(options.days, 10);
  const END = options.end ? parseInt(options.end, 10) : 0;
  const DEBUG = options.debug;
  const ORG = options.org;
  const REPO = options.repo;

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  const token = validateToken(GITHUB_TOKEN);

  try {
    // Create configuration
    const config: Config = {
      org: ORG,
      repo: REPO,
      startDate: utils.getDateNDaysAgo(DAYS),
      endDate: utils.getEndDate(END),
      nDays: DAYS - END,
      breadthWeight: options.weight,
      depthDiminishingFactor: options.depthDiminishingFactor,
      debug: DEBUG,
      token,
      apiUrl: `https://api.github.com/repos/${ORG}/${REPO}`,
      webUrl: `https://github.com/${ORG}/${REPO}`,
      tempDir: '',
      withNames: options.withNames,
    };
    validateConfig(config);

    console.log(chalk.blue('\PR Engagement Metrics'));
    console.log(chalk.gray(`Analyzing ${chalk.white(ORG + '/' + REPO)} between ${chalk.white(config.startDate.toLocaleString())} and ${chalk.white(config.endDate.toLocaleString())} `));

    // Create spinner
    const spinner = ora('Fetching GitHub data...').start();

    // Create temp directory
    config.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'github-engagement-'));

    // Register cleanup function
    process.on('exit', () => {
      try {
        fs.rmSync(config.tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error(`Error cleaning up temporary directory: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

    // Fetch and process data
    const data = await github.fetchGitHubData(config);
    spinner.text = 'Processing activity data...';
    const processedData = processor.processActivityData(data, config);
    spinner.succeed('GitHub data processed successfully');

    // Generate reports
    reporter.generateSummaryReport(processedData, config);

    if (DEBUG) {
      reporter.generateDetailedReport(processedData, config);
    }

  } catch (err) {
    console.error(chalk.red(`\nError: ${err instanceof Error ? err.message : String(err)}`));
    if (err instanceof Error && err.stack) {
      console.error(chalk.gray(err.stack.split('\n').slice(1).join('\n')));
    }
    process.exit(1);
  }
}

export { main }
