# Changelog

All notable changes to PR Engagement Metrics tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-05-14

### Added
- Initial release with core functionality
- Engagement depth metrics (comments/PR ratio)
- Engagement breadth metrics (% of PRs reviewed)
- Combined weighted scoring system
- Debug mode for detailed per-user reporting
- Custom weighting parameter for depth vs. breadth emphasis
- Configuration for organization, repository, and time period
- Automatic filtering of self-comments

### Technical
- Proper error handling for GitHub API requests
- Progress indicators during data fetching
- Memory-efficient processing of GitHub data
- Cross-platform compatibility
