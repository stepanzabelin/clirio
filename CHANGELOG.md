# Changelog

### [4.0.0] - July 5, 2026

Moved to Yarn 4 and refreshed the toolchain
Raised the Node.js baseline
Regenerated the lockfile and kept audit clean
Fixed package archives and declarations
Covered the built CommonJS entrypoint
Clarified README docs for parsing, validation, transforms, pipes, and helpers

### [3.1.0] - April 11, 2026

Improved strict option handling for DTO-defined aliases and property-name fallbacks
Fixed pipe chaining so each next pipe receives the transformed result of the previous one
Hardened raw input handling for reserved keys such as `hasOwnProperty` and `__proto__`
Expanded regression coverage for option safety, pipe context, and validation helpers
Refined README examples and clarified validation, pipe, filter, and error-handling behavior

### [3.0.0] - November 14, 2023

Improved args parser (integer types for actions added)
Refactored and simplified core code
Reworked ClirioHelper class
Added method for obtaining the initial keys for DTO

### [2.0.0] - October 1, 2023

Implemented @Envs, @Env decorators.
Reworked properties in Clirio exceptions

#### [1.2.0] - August 25, 2023

Improved the app lifecycle.

#### [1.1.0] - August 21, 2023

Changed properties in Clirio exceptions to optional.
    
### [1.0.0] - August 1, 2023

The lib has been completely redone.

### [0.1.0] - February 7, 2022

Implemented the first working version of the project.
