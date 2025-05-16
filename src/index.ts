#!/usr/bin/env ts-node
/**
 * PR Engagement Metrics
 * 
 * A CLI tool for analyzing team engagement patterns on GitHub pull requests.
 * 
 * @author Animando <animandosolutions@gmail.com>
 * @license MIT
 */

import * as dotenv from 'dotenv';
import { main } from './main';

dotenv.config();

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});