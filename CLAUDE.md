# Claude Development Workflow for ScaffAI

## 📋 Standard Development Flow

This document outlines the standard development workflow for ScaffAI using Claude Code and various MCP tools.

### 🔄 Complete Development Cycle

```
User Instructions/GitHub Issues → Todo Creation → Implementation → Testing → Debugging → Verification → PR Creation → Next Steps
```

### Step-by-Step Process

#### 1. **Issue Analysis & Todo Creation**
- Analyze user instructions or GitHub issues
- Use `TodoWrite` tool to create structured task breakdown
- Prioritize tasks and mark dependencies
- Set clear acceptance criteria

#### 2. **Implementation Phase**
- Mark todos as `in_progress` one at a time
- Follow existing code conventions and patterns
- Implement features incrementally
- Mark todos as `completed` immediately upon finishing

#### 3. **Testing with Playwright MCP**
- Use `mcp__playwright__*` tools for end-to-end testing
- Take screenshots and snapshots for verification
- Test user flows and interactions
- Verify responsive design across devices

#### 4. **Debugging with Context7 MCP**
- Use `mcp__Context7__resolve-library-id` to identify relevant documentation
- Use `mcp__Context7__get-library-docs` for framework-specific troubleshooting
- Reference official documentation for debugging complex issues
- Apply best practices from library documentation

#### 5. **Re-verification**
- Run final tests after bug fixes
- Verify all acceptance criteria are met
- Check that no regressions were introduced
- Ensure code quality standards

#### 6. **Pull Request Creation**
- Create comprehensive PR with clear description
- Include testing screenshots/videos when applicable
- Reference related issues and todos
- Follow PR template guidelines

#### 7. **Documentation Review & Next Steps**
- Review `@docs` for project context
- Update relevant documentation if needed
- Propose logical next development steps
- Suggest improvements or optimizations

### 🛠️ Key Tools & Commands

#### Todo Management
```bash
TodoWrite  # Create and update task lists
TodoRead   # Check current task status
```

#### Testing & Verification
```bash
# Playwright MCP commands
mcp__playwright__browser_navigate      # Navigate to pages
mcp__playwright__browser_snapshot      # Capture page state
mcp__playwright__browser_click         # Interact with elements
mcp__playwright__browser_take_screenshot # Visual verification
```

#### Documentation & Debugging
```bash
# Context7 MCP commands
mcp__Context7__resolve-library-id      # Find library documentation
mcp__Context7__get-library-docs        # Get specific framework docs
```

#### Code Quality
```bash
npm run lint        # Code linting
npm run typecheck   # TypeScript validation
npm run test        # Run test suite
```

### 📝 Best Practices

#### Todo Management
- Break complex features into 3-5 smaller tasks
- Use clear, actionable descriptions
- Mark only ONE task as `in_progress` at a time
- Complete tasks immediately, don't batch completions

#### Implementation
- Always check existing patterns before writing new code
- Follow project's TypeScript and ESLint configurations
- Write self-documenting code without excessive comments
- Verify dependencies exist before using external libraries

#### Testing Strategy
- Test critical user paths with Playwright
- Verify both mobile and web experiences
- Check offline functionality where applicable
- Test error states and edge cases

#### Documentation
- Keep CLAUDE.md updated with new workflows
- Reference specific file paths and line numbers
- Update README.md for user-facing changes
- Maintain clear commit messages
- **Update docs/ checkboxes**: Mark checkboxes as completed in relevant docs files (roadmap.md, parallel-development-plan.md) when tasks are finished

#### Component Architecture
- **Maximize component separation**: Break UI into small, focused, reusable components
- Create single-responsibility components with clear interfaces
- Separate business logic from presentation components
- Use composition over inheritance patterns
- Keep components small (< 100 lines when possible)

### 🔍 Quality Gates

Before marking any feature as complete:
- [ ] All related todos marked as `completed`
- [ ] Playwright tests passing
- [ ] No TypeScript errors
- [ ] No linting violations
- [ ] Manual testing completed
- [ ] Documentation updated if needed
- [ ] **docs/ checkboxes updated**: Relevant checkboxes in docs/roadmap.md and docs/parallel-development-plan.md marked as completed

### 🚀 Deployment Checklist

Before creating PR:
- [ ] Feature fully implemented and tested
- [ ] All dependencies properly installed
- [ ] Build process succeeds
- [ ] No console errors or warnings
- [ ] Mobile and web platforms tested
- [ ] Offline functionality verified (if applicable)

---

*This workflow ensures consistent, high-quality development while leveraging Claude Code's full capabilities.*

## Development Notes

- これで簡易計算のロジックは完璧なので今後は変更しないでください。どうしても変更が必要であればユーザーに確認してください。