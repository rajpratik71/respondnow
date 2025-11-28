# RespondNow Project Architecture Documentation

---

## Overview

RespondNow is an open-source incident management platform that integrates seamlessly with Slack. It enables teams to manage incidents within their existing communication tool, enhancing collaboration and response times. The system consists of a Java-based backend server, a React-based frontend portal, and a Slack application. It is containerized using Docker and deployable via Helm charts on Kubernetes clusters.

---

## Why

**Purpose and Goals:**
- **Incident Management:** Provide a robust platform for managing incidents efficiently.
- **Slack Integration:** Leverage Slack as the main interface for incident management, minimizing context switching.
- **Open Source:** Build a community-driven, easily extensible, and customizable incident management tool.
- **Collaboration:** Enhance team collaboration during incident responses with real-time updates and communication.

---

## What

**Project Components:**

1. **Backend Server:**
   - **Tech Stack:** Java, Spring Boot, MongoDB
   - **Responsibilities:** Handle business logic, data storage, and API endpoints for incident management.
   - **Key Classes and Methods:**
     - [ProjectService](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectService.java): Interface defining project-related operations.
     - [ProjectServiceImpl](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectServiceImpl.java): Implementation of [ProjectService](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectService.java) with methods like [createProject](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectService.java), [createProjectWithRetry](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectService.java), [deleteProject](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectService.java), etc.
     - [ProjectRepository](./../../../server/src/main/java/io/respondnow/repository/ProjectRepository.java): MongoDB repository for project data.

2. **Frontend Portal:**
   - **Tech Stack:** React, TypeScript, Webpack
   - **Responsibilities:** Provide a web-based dashboard for monitoring and managing incidents.
   - **Key Components:**
     - `GettingStartedView`, `IncidentDetailsView`, `SideNav`, `StatusBadge`, etc.

3. **Slack App:**
   - **Responsibilities:** Allow users to perform incident management tasks directly from Slack.
   - **Integration:** Use Slack APIs to interact with the backend server for incident operations.

4. **Containerization:**
   - **Docker:** Dockerfiles for building and deploying the application in containers.
   - **Helm Charts:** For Kubernetes deployments.

---

## Where

**Project Structure:**

- **Backend Server:**
  - Located in `server/src/main/java/io/respondnow/...`.
  - Key Directories:
    - `service/hierarchy`: Contains services like [ProjectService](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectService.java), [ProjectServiceImpl](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectServiceImpl.java).
    - `model/hierarchy`: Contains data models like [Project](./../../../server/src/main/java/io/respondnow/model/hierarchy/Project.java).
    - `repository`: Contains repository interfaces.

- **Frontend Portal:**
  - Located in `portal/src/...`.
  - Key Directories:
    - `components`: Reusable UI components.
    - `views`: Main views like `GettingStarted`, `IncidentDetails`.
    - `services`: API service hooks.
    - `context`: Context providers for global state management.

- **Slack App:**
  - Not explicitly detailed in the provided snippets, but it would typically reside in its own directory with integration points in the backend server.

- **Containerization:**
  - Dockerfiles located in [server/Dockerfile](./../../../server/Dockerfile) and [server/src/main/docker/Dockerfile](./../../../server/src/main/docker/Dockerfile).
  - Helm charts stored in a separate repository as referenced in the documentation.

---

## How

**Key Processes and Workflows:**

1. **Project Creation:**
   - Method: `ProjectServiceImpl.createProject` and [createProjectWithRetry](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectService.java).
   - Workflow: Validate project existence -> Save to repository -> Handle retries if necessary.

2. **Project Deletion:**
   - Method: `ProjectServiceImpl.deleteProject`.
   - Workflow: Fetch project by identifier -> Soft delete by setting `removed` flag -> Save changes.

3. **Project Retrieval:**
   - Methods: `ProjectServiceImpl.findById`, [getAllProjects](./../../../server/src/main/java/io/respondnow/service/hierarchy/ProjectServiceImpl.java).
   - Workflow: Fetch from repository -> Return project data.

4. **Deployment:**
   - Docker: Multi-stage Dockerfile to build and run the application.
   - Kubernetes: Helm charts for deploying on Kubernetes clusters.

---

## When

**Development and Deployment Timeline:**
- **Initial Development:**
  - Backend server and frontend portal development started with fundamental features.
  - Slack integration was added to enhance real-time communication.

- **Milestones:**
  - **Release 0.1.0:** Initial cut of the platform with core features and Slack integration.
  - **Subsequent Releases:** Incremental improvements, bug fixes, and feature additions based on community feedback and internal roadmap.

- **Deployment Schedule:**
  - Continuous Integration (CI) setup to ensure code quality and automated testing.
  - Regular deployments to Kubernetes clusters using Helm charts for consistent updates and scaling.

---

## Where

**Deployment Environment:**
- The RespondNow platform is designed to be deployed on Kubernetes clusters, ensuring high availability and scalability.
- Docker is used for containerizing the application, making it portable and easy to deploy across different environments.
- Helm charts are used for managing Kubernetes deployments, providing a standardized way to deploy, upgrade, and maintain the application.

---

## Conclusion

This architecture document provides a comprehensive overview of the RespondNow project, detailing its purpose, components, structure, workflows, and deployment strategies. By leveraging modern technologies and best practices, RespondNow aims to be a powerful tool for incident management, fostering collaboration and efficiency in handling incidents.

For more detailed information, please refer to the specific documentation and code comments within the project repositories.