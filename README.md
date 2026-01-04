# Software Spring 2026 Template

## Repo Structure
You are free to structure your respective repositories as you wish. However we recommend keeping everything in a
_monorepo_ so that deployments are easier to handle.

## Builds and Deployments 
It is sometimes recommended to have multiple _[Dockerfiles](https://docs.docker.com/reference/dockerfile/)_. I.e. one
for your backend, frontend, and any other services that you guys will rely on. Using a docker-compose file to
orchestrate building all your services in conjunction. For further development, you can choose to seperate out
production and development _Dockerfiles_ seperately (i.e. for compiled projects the build portion is usually different
if one wishes to develop vs to deploy).

Once completed, please reach out to a _Technical Chief_ if you wish to have some aid deploying.

## Documentation
Documentation, style-guides, and best practices should be kept in a repo level folder `docs/`. It is crucial to have
your team reference these docs extensively to provide a consistent styling of code across the repo.

## CI/CD
It is critical that on every single merge to main, you enable a specific subset of checks to run. These should include
- Linting/Formatting
- Unit/Integration Tests
- Deployments (Sometimes its better to allocate another branch for deployments, such as `release` or `production`)

You might find it useful to call some upstream workflows from [Shiperate](https://github.com/GenerateNU/shiperate/tree/main)
