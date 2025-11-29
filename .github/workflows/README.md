# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the RespondNow project.

## Available Workflows

### 1. Backend Tests (`backend-tests.yml`)
Automated testing for Java/Spring Boot backend.

**Triggers:**
- Push to `main` or `develop` (when `server/**` changes)
- Pull requests to `main` or `develop` (when `server/**` changes)
- Manual trigger

**Features:**
- Matrix testing (Java 11, 17)
- Unit tests
- Integration tests with MongoDB
- Coverage reports (JaCoCo)
- Docker-based testing
- SonarCloud integration

### 2. Frontend Tests (`frontend-tests.yml`)
Automated testing for React/TypeScript frontend.

**Triggers:**
- Push to `main` or `develop` (when `portal/**` changes)
- Pull requests to `main` or `develop` (when `portal/**` changes)
- Manual trigger

**Features:**
- Matrix testing (Node 16, 18)
- Unit tests
- Linting and type checking
- Coverage reports (Jest/Istanbul)
- Docker-based testing
- E2E tests (Playwright)
- Security scanning (npm audit, Snyk)

### 3. CI/CD Pipeline (`ci-cd-pipeline.yml`)
Complete continuous integration and deployment pipeline.

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Manual trigger with optional deployment

**Features:**
- Parallel execution
- Docker image building
- Integration testing
- Combined coverage reporting
- Conditional deployment
- Status summaries

## Workflow Status Badges

Add these badges to your README.md:

```markdown
![Backend Tests](https://github.com/[org]/[repo]/workflows/Backend%20Tests/badge.svg)
![Frontend Tests](https://github.com/[org]/[repo]/workflows/Frontend%20Tests/badge.svg)
![CI/CD Pipeline](https://github.com/[org]/[repo]/workflows/CI/CD%20Pipeline/badge.svg)
```

## Required Secrets

Configure these in: `Settings` → `Secrets and variables` → `Actions`

### Required:
- `GITHUB_TOKEN` - Automatically provided by GitHub

### Optional (for enhanced features):
- `SONAR_TOKEN` - SonarCloud code quality analysis
- `SNYK_TOKEN` - Snyk security vulnerability scanning
- `CODECOV_TOKEN` - Codecov coverage reporting

## Manual Workflow Triggers

You can manually trigger workflows from the Actions tab:

1. Go to `Actions` tab
2. Select the workflow
3. Click `Run workflow`
4. Select branch and options (if available)

## Viewing Results

### Test Results
- Go to workflow run
- Click on job name
- View test report in "Annotations" or "Artifacts"

### Coverage Reports
- Download artifacts from workflow run
- Or view on Codecov dashboard
- Check PR comments for coverage summary

## Debugging Failed Workflows

1. **Check Logs:**
   - Click on failed job
   - Expand failed step
   - Review error messages

2. **Re-run Jobs:**
   - Click "Re-run jobs" → "Re-run failed jobs"
   - Or "Re-run all jobs" for full retry

3. **Local Testing:**
   ```bash
   # Run tests locally first
   cd server && mvn test
   cd portal && yarn test
   
   # Or use Docker
   docker-compose -f docker-compose.test.yml up
   ```

## Performance Optimization

- **Caching:** Maven and Yarn dependencies are cached
- **Parallel Jobs:** Backend and frontend tests run in parallel
- **Conditional Execution:** Jobs only run when relevant files change
- **Docker Layer Caching:** Speeds up image builds

## Maintenance

- Review and update workflow files quarterly
- Keep action versions up to date
- Monitor workflow execution times
- Clean up old artifacts regularly

## Support

For issues with workflows:
1. Check workflow logs
2. Review this documentation
3. Consult [GitHub Actions Documentation](https://docs.github.com/en/actions)
4. Contact DevOps team

---

**Last Updated:** November 28, 2024
