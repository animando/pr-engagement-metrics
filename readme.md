# GitHub Engagement Analyzer

A powerful CLI tool for analyzing team engagement patterns on GitHub pull requests.

[![npm version](https://img.shields.io/npm/v/pr-engagement-metrics.svg)](https://www.npmjs.com/package/pr-engagement-metrics)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

- **Comprehensive Engagement Metrics**: Track both depth (comments/PR) and breadth (% of PRs reviewed) of engagement
- **Configurable Weighting**: Adjust importance of depth vs. breadth based on team priorities
- **Rich Visualizations**: Clear tables showing engagement patterns with sorting options
- **Detailed Reports**: Optional debug mode for deep dives into individual behaviors
- **Self-comment Filtering**: Automatically excludes comments on one's own PRs
- **Cross-platform**: Works on macOS, Linux, and Windows

## 📊 Why Track Engagement?

Understanding team engagement helps:

- Identify review bottlenecks
- Balance workload across team members
- Encourage collaboration on PRs
- Recognize top contributors
- Improve team review practices

## 📦 Installation

```bash
# Install globally
npm install -g pr-engagement-metrics

# Or run directly with npx
npx pr-engagement-metrics
```

## 🔑 Setup

Create a GitHub personal access token with `repo` permissions at [GitHub's token settings](https://github.com/settings/tokens).

Set it as an environment variable:

```bash
# For macOS/Linux
export GITHUB_TOKEN=your_github_token_here

# For Windows PowerShell
$env:GITHUB_TOKEN="your_github_token_here"
```

## 🚀 Usage

```bash

# Specify organization and repository
github-engagement --org your-org --repo your-repo

# Look back more days
github-engagement --days 14

# Prioritize breadth over depth (values > 1.0 prioritize breadth)
github-engagement --weight 1.5

# Adjust the rate at which increased depth has reduced impact on overall metric
github-engagement -s 0.6

# Show detailed breakdown per user
github-engagement --debug
```

### Options

```
Options:
  -o, --org <org>                                          GitHub organization
  -r, --repo <repo>                                        GitHub repository
  -t, --days <days>                                        Number of days to look back (default: "5")
  -w, --weight <weight>                                    Weight for engagement breadth (>=0.25) (default: "1.0")
  -s, --depth-diminishing-factor <depthDiminishingFactor>  The rate at which importance of ever-increasing depth diminishes (>0 <1) (default: "0.4")
  -d, --debug                                              Enable debug output with detailed activity
  -h, --help                                               Display help for command
```

## 📋 Sample Output

```
==========================================================================
        REPORT FOR LAST 5 DAYS (since 2025-05-09T17:05:43Z)
==========================================================================
--------------------------------------------------------------------------------------------------------------
| User                 | Comments | Approvals | Engagement Depth       | Engagement Breadth | Engagement (w=1.0) |
--------------------------------------------------------------------------------------------------------------
| john-developer       | 35       | 12        | 2.35 (47/20)           | 0.80 (16/20)       | 1.88               |
| alice-coder          | 27       | 6         | 1.83 (33/18)           | 0.67 (12/18)       | 1.23               |
| bob-engineer         | 15       | 3         | 0.82 (18/22)           | 0.41 (9/22)        | 0.34               |
| emma-qa              | 8        | 2         | 0.50 (10/20)           | 0.35 (7/20)        | 0.18               |
--------------------------------------------------------------------------------------------------------------
```

### With Debug Mode

```
>> User: john-developer
   === APPROVED PRs ===
   - PR #123 (author=bob-engineer): https://github.com/your-org/your-repo/pull/123
   - PR #127 (author=alice-coder): https://github.com/your-org/your-repo/pull/127
   
   === COMMENTS ===
   - PR #123 (author=bob-engineer): 4 comments - https://github.com/your-org/your-repo/pull/123
   - PR #127 (author=alice-coder): 6 comments - https://github.com/your-org/your-repo/pull/127
```

## 📊 Understanding the Metrics

- **Engagement Depth**: Average comments & approvals per PR
  - Formula: `(comments + approvals) / non-authored PRs`
  - High values indicate thorough reviews

- **Engagement Breadth**: Percentage of PRs a person engages with
  - Formula: `unique PRs interacted with / non-authored PRs`
  - High values indicate wide coverage

- **Engagement Score**: Combined metric with configurable weighting
  - Formula: `((1 - depthDiminishingFactor^depth) + (breadth * breadthWeighting)) / (1 + breadthWeighting);`
  - Weighted average of depth vs breadth (with increased depth having diminishing returns to a configurable degree)

## 🧠 Strategic Uses

1. **Set team expectations**: "Everyone should aim for engagement breadth of at least 0.5"

2. **Balance workloads**: Identify who's carrying review burden vs. who needs to increase participation

3. **Analyze patterns**: 
   - High depth, low breadth → Concentrating on few PRs
   - Low depth, high breadth → Superficial reviews of many PRs
   - High on both → Great contributor
   - Low on both → Limited participation

4. **Optimize for team size**:
   - Small teams: Lower weight (emphasize depth)
   - Large teams: Higher weight (emphasize breadth)

## 🔧 Advanced Configuration

### Weight Recommendations

- **0.5**: Heavily favor engagement depth (quality over quantity)
- **1.0**: Equal weight to depth and breadth
- **1.5**: Favor breadth (incentivize looking at more PRs)
- **2.0**: Strongly favor breadth (maximize PR coverage)

## 🛡️ License

MIT

## 🤝 Contributing

Contributions welcome! See our [contribution guidelines](CONTRIBUTING.md).

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for details on each release.

## 💻 Requirements

- Node.js v14 or higher
- GitHub Personal Access Token with repo permissions
