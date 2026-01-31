# Contributing to Digital Twin Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment (see below)
4. Create a feature branch
5. Make your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- **Java 17+** - Required for backend services
- **Node.js 20+** - Required for dashboard UI
- **Python 3.11+** - Required for ML service
- **Docker & Docker Compose** - Required for infrastructure
- **Maven 3.9+** - For building Java projects

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/digital-twin.git
cd digital-twin

# Start infrastructure
make dev

# Build all services
make build

# Run tests
make test

# Start UI development server
make ui
```

### IDE Setup

#### IntelliJ IDEA (Recommended for Java)
1. Open the project as a Maven project
2. Enable annotation processing for Lombok
3. Install the Spring Boot plugin

#### VS Code (Recommended for Frontend)
1. Install recommended extensions
2. Open the `dashboard-ui` folder

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-twin-templates`
- `fix/websocket-connection-timeout`
- `docs/update-api-reference`
- `refactor/improve-state-engine`

### Development Workflow

1. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following coding standards

3. **Test your changes**
   ```bash
   make test
   ```

4. **Commit frequently** with clear messages

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, etc) |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `build` | Build system changes |
| `ci` | CI/CD changes |
| `perf` | Performance improvements |
| `chore` | Maintenance tasks |

### Examples

```
feat(prediction): add ARIMA model support

fix(gateway): handle malformed event payload

docs(readme): update installation instructions

test(anomaly): add unit tests for detection algorithms
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**: `make test`
4. **Ensure no lint errors**: `make lint`
5. **Update CHANGELOG.md** if applicable
6. **Request review** from maintainers

### PR Title Format

Same as commit messages:
```
feat(component): description of change
```

### PR Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Lint checks pass
- [ ] All tests pass

## Coding Standards

### Java

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use Lombok annotations where appropriate
- Write JavaDoc for public APIs
- Prefer immutable objects
- Use Optional instead of null

```java
// Good
public Optional<Twin> findById(String id) {
    return repository.findById(id);
}

// Avoid
public Twin findById(String id) {
    return repository.findById(id).orElse(null);
}
```

### TypeScript/React

- Use functional components with hooks
- Prefer TypeScript strict mode
- Use named exports
- Keep components small and focused

```typescript
// Good
export const TwinCard: FC<TwinCardProps> = ({ twin }) => {
  return <div>{twin.name}</div>;
};

// Avoid
export default function(props) {
  return <div>{props.twin.name}</div>;
}
```

### Python

- Follow [PEP 8](https://pep8.org/)
- Use type hints
- Write docstrings for functions
- Use f-strings for formatting

```python
# Good
def predict(self, twin_id: str, features: dict[str, float]) -> Prediction:
    """Generate prediction for a digital twin."""
    ...

# Avoid
def predict(self, twin_id, features):
    ...
```

## Testing

### Java Tests

```bash
# Run all tests
./mvnw test

# Run specific module tests
./mvnw test -pl twin-state-engine

# Run with coverage
./mvnw test jacoco:report
```

### Frontend Tests

```bash
cd dashboard-ui
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### ML Service Tests

```bash
cd ml-service
pytest               # Run all tests
pytest -v            # Verbose
pytest --cov=.       # With coverage
```

## Questions?

- Open a [GitHub Issue](https://github.com/your-org/digital-twin/issues)
- Join our Slack/Discord channel
- Email: maintainers@digitaltwin.example.com

Thank you for contributing! 🎉
