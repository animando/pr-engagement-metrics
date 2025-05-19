# Contributing to PR Engagement Metrics

Thank you for considering contributing to PR Engagement Metrics! This document outlines the process for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please report unacceptable behavior to [animandosolutions@gmail.com].

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the [Issues](https://github.com/animando/pr-engagement-metrics/issues)
- If not, create a new issue with a descriptive title and clear steps to reproduce
- Include any relevant details about your environment (Node.js version, OS, etc.)
- If possible, include a minimal code example that reproduces the issue

### Suggesting Enhancements

- Check if the enhancement has already been suggested in the [Issues](https://github.com/animando/pr-engagement-metrics/issues)
- If not, create a new issue with a descriptive title
- Provide a clear description of the enhancement and why it would be valuable
- If possible, outline how the enhancement might be implemented

### Pull Requests

1. Fork the repository
2. Create a new branch from `main` for your changes
3. Make your changes
4. Run tests and linting to ensure your changes pass: `npm test && npm run lint`
5. Commit your changes with a descriptive commit message
6. Push your branch to your fork
7. Create a pull request to the `main` branch of the main repository

### Development Workflow

1. Install dependencies: `npm install`
2. Make your changes
3. Run the linter: `npm run lint`
4. Fix any linting issues: `npm run lint:fix`
5. Run tests: `npm test`
6. Run the tool locally to test your changes: `node index.js`

## Style Guidelines

- Follow the existing code style
- Use clear, descriptive variable and function names
- Add comments for complex logic
- Write tests for new features

## Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description

longer description if needed
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
