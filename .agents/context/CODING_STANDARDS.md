# Coding Standards

## General Style
- Use `camelCase` for variables and functions, `PascalCase` for classes and Prisma models.
- Prefer `const` over `let`. Never use `var`.
- Use async/await syntax. Avoid raw Promise chains (`.then().catch()`) unless absolutely necessary.

## Error Handling
- All controllers must be wrapped in an `asyncHandler` to catch asynchronous errors without writing repetitive try/catch blocks.
- Throw custom `AppError` instances (with HTTP status codes) from services, which are then caught by a global error middleware.

## API Responses
All API responses must follow a standardized format:
```javascript
{
  "success": true | false,
  "data": { ... }, // Omitted if error
  "message": "Human readable message",
  "error": { ... } // Omitted if success
}
```
