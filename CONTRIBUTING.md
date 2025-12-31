# Contributing to Noor SuperApp

**As-salamu alaykum!** Thank you for your interest in contributing to the Noor SuperApp project. This document provides guidelines for contributing to ensure a smooth and collaborative development process.

## Vision and Values

The Noor SuperApp is built to serve the Muslim Ummah with authentic Islamic content and practical tools for daily spiritual practice. All contributions should align with Islamic values and principles of accuracy, respect, and benefit to the community.

## Getting Started

Before you begin contributing, please familiarize yourself with the project by reading the main documentation files, including the README, ROADMAP, and STATUS documents. These provide context on the project's goals, current status, and planned features.

## How to Contribute

There are several ways to contribute to the project, including reporting bugs, suggesting features, improving documentation, and submitting code changes. Each contribution type has specific guidelines to ensure quality and consistency.

### Reporting Bugs

If you encounter a bug, please create an issue using the bug report template. Provide as much detail as possible, including steps to reproduce the issue, expected behavior, actual behavior, and your environment details. Screenshots are helpful when applicable.

### Suggesting Features

Feature requests are welcome and should be submitted using the feature request template. Clearly describe the problem the feature would solve, your proposed solution, and any alternatives you've considered. If the feature relates to Islamic practices or content, please explain how it aligns with Islamic values.

### Code Contributions

Code contributions should follow the established project structure and coding standards. Before starting work on a significant change, please open an issue to discuss your approach with the maintainers.

## Development Workflow

The project uses a standard Git workflow with feature branches and pull requests. Follow these steps when contributing code:

1. **Fork the repository** and clone it to your local machine.
2. **Create a new branch** from `main` for your feature or fix. Use a descriptive name like `feature/quran-search` or `fix/prayer-time-calculation`.
3. **Make your changes** following the coding standards outlined below.
4. **Test your changes** thoroughly on multiple browsers and devices when applicable.
5. **Commit your changes** with clear, descriptive commit messages.
6. **Push your branch** to your fork on GitHub.
7. **Create a pull request** using the pull request template, linking to any related issues.

## Coding Standards

Maintaining consistent code quality is essential for the project's long-term success. Please adhere to the following standards:

### General Guidelines

Write clean, readable code with meaningful variable and function names. Add comments to explain complex logic or non-obvious decisions. Keep functions small and focused on a single responsibility. Avoid unnecessary complexity and premature optimization.

### JavaScript and TypeScript

Use TypeScript for all new frontend code to ensure type safety. Follow the existing code style, which uses ES6+ features and functional programming patterns where appropriate. Use async/await for asynchronous operations rather than callbacks or raw promises.

### React Components

Components should be functional components using hooks rather than class components. Keep components small and focused, extracting reusable logic into custom hooks. Use proper prop types and default values. Implement proper error boundaries for production resilience.

### Backend Code

Follow RESTful API design principles for all endpoints. Use proper HTTP status codes and consistent error handling. Validate all input data using express-validator or similar tools. Implement proper authentication and authorization for protected routes.

### Database

Use Mongoose schemas with proper validation and indexes. Avoid N+1 query problems by using proper population and aggregation. Keep database queries efficient and avoid loading unnecessary data.

## Testing

All code contributions should include appropriate tests. The project uses Jest for testing on both the frontend and backend. Write unit tests for individual functions and components, integration tests for API endpoints, and end-to-end tests for critical user flows when applicable.

## Documentation

Update documentation when adding new features or changing existing behavior. This includes inline code comments, API documentation in the docs folder, and the main README file when necessary. Use clear, concise language and provide examples where helpful.

## Islamic Content Accuracy

Content related to the Quran, Hadith, or Islamic teachings must be accurate and from authentic sources. When adding or modifying such content, please cite your sources and have the content reviewed by someone knowledgeable in Islamic studies if possible. Translations should be from recognized scholars and clearly attributed.

## Code Review Process

All pull requests will be reviewed by project maintainers before merging. Reviewers will check for code quality, adherence to standards, proper testing, and alignment with project goals. Be responsive to feedback and be prepared to make changes based on review comments.

## Community Guidelines

Be respectful and considerate in all interactions with other contributors. Provide constructive feedback during code reviews. Help newcomers get started with the project. Follow Islamic principles of good character in all communications.

## Questions and Support

If you have questions about contributing, please open an issue with the "question" label or reach out to the maintainers. We're here to help and appreciate your interest in improving the Noor SuperApp.

---

**JazakAllah Khair** for contributing to this project and helping serve the Muslim community!
