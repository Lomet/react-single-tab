<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# React Single Tab Enforcer - Copilot Instructions

This is a modern React TypeScript library for enforcing single-tab behavior in web applications.

## Project Structure
- `src/` - Main source code
  - `useSingleTabEnforcer.ts` - Main hook implementation
  - `types.ts` - TypeScript type definitions
  - `utils.ts` - Utility functions
  - `components/` - React components
  - `__tests__/` - Test files
- `dist/` - Built output (generated)
- Configuration files for TypeScript, Jest, ESLint, and Rollup

## Coding Guidelines
- Use TypeScript for type safety
- Follow React hooks best practices
- Write comprehensive tests for all functions
- Use descriptive variable and function names
- Include JSDoc comments for public APIs
- Handle errors gracefully with fallbacks
- Ensure browser compatibility

## Key Concepts
- Tab leadership is determined by localStorage timestamps
- BroadcastChannel is used for fast inter-tab communication when available
- Automatic cleanup prevents memory leaks
- Configurable timeouts and intervals for different use cases
- Custom fallback components for better UX

## Testing Approach
- Mock browser APIs (localStorage, BroadcastChannel)
- Test edge cases and error conditions
- Ensure proper cleanup in all scenarios
- Maintain high code coverage (>80%)

When making changes, always consider:
1. Backward compatibility
2. Performance impact
3. Browser support
4. Test coverage
5. Documentation updates
