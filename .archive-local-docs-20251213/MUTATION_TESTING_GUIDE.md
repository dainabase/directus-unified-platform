# 🧬 Mutation Testing Configuration Guide

**Scheduled Run**: Sunday, August 18, 2025 at 2:00 UTC  
**Tool**: Stryker Mutator  
**Target**: @dainabase/ui package (58 components)  
**Current Coverage**: 100%

## 🎯 What is Mutation Testing?

Mutation testing evaluates the quality of your test suite by introducing small bugs (mutations) into your code and checking if your tests catch them. It's the ultimate test for your tests!

### How it Works
1. **Mutation**: Stryker changes your code (e.g., `+` to `-`, `true` to `false`)
2. **Testing**: Runs your test suite against mutated code
3. **Detection**: If tests fail, the mutation is "killed" (good!)
4. **Survival**: If tests pass, the mutation "survives" (bad - tests missed it!)
5. **Score**: Percentage of mutations killed = mutation score

## 📋 Pre-Flight Checklist

### Before Sunday's Run
- [x] Stryker installed (`@stryker-mutator/core`)
- [x] Vitest runner configured
- [x] TypeScript checker ready
- [x] HTML reporter configured
- [x] 100% test coverage maintained
- [ ] Review high-risk components
- [ ] Ensure all tests are passing
- [ ] Clear test results cache

## ⚙️ Configuration

### stryker.config.js
```javascript
module.exports = {
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  packageManager: "pnpm",
  testRunner: "vitest",
  
  // Target files for mutation
  mutate: [
    "packages/ui/src/components/**/*.{ts,tsx}",
    "!packages/ui/src/**/*.test.{ts,tsx}",
    "!packages/ui/src/**/*.stories.{ts,tsx}",
    "!packages/ui/src/**/*.spec.{ts,tsx}",
    "!packages/ui/src/**/index.{ts,tsx}"
  ],
  
  // Test configuration
  vitest: {
    configFile: "packages/ui/vitest.config.ts",
    dir: "packages/ui"
  },
  
  // TypeScript checking
  checkers: ["typescript"],
  tsconfigFile: "packages/ui/tsconfig.json",
  
  // Reporting
  reporters: [
    "html",
    "clear-text",
    "progress",
    "dashboard",
    "json"
  ],
  
  // Performance tuning
  concurrency: 4,
  timeoutMS: 60000,
  timeoutFactor: 2,
  maxTestRunnerReuse: 50,
  
  // Thresholds
  thresholds: {
    high: 90,
    low: 70,
    break: 60
  },
  
  // Mutation levels
  mutationLevels: [
    "Level1", // Basic mutations
    "Level2", // Advanced mutations
    "Level3"  // Complex mutations
  ],
  
  // Dashboard
  dashboard: {
    project: "github.com/dainabase/directus-unified-platform",
    version: "1.0.1-beta.2",
    module: "packages/ui",
    baseUrl: "https://dashboard.stryker-mutator.io/api",
    reportType: "full"
  }
};
```

## 🎮 Running Mutation Tests

### Manual Execution (Before Sunday)
```bash
# Test a single component
pnpm test:mutation --mutate "packages/ui/src/components/button/**/*.tsx"

# Test high-risk components
pnpm test:mutation --mutate "packages/ui/src/components/{data-grid,form,charts}/**/*.tsx"

# Dry run (no actual mutations)
pnpm test:mutation --dryRun

# Generate report only
pnpm test:mutation --reporters html
```

### Automated Sunday Run
The workflow will automatically:
1. Trigger at 2:00 UTC
2. Run mutations on all 58 components
3. Generate comprehensive report
4. Upload results to dashboard
5. Create GitHub issue if score < 80%

## 📊 Interpreting Results

### Mutation Score Ranges
| Score | Rating | Action Required |
|-------|--------|-----------------|
| 90-100% | Excellent | Maintain quality |
| 80-89% | Good | Minor improvements |
| 70-79% | Fair | Review test gaps |
| 60-69% | Poor | Significant work needed |
| <60% | Critical | Immediate action |

### Common Mutations
```javascript
// Original code
if (count > 0) {
  return true;
}

// Possible mutations
if (count >= 0) { ... }  // Boundary mutation
if (count < 0) { ... }   // Operator mutation
if (count > 1) { ... }   // Literal mutation
if (true) { ... }        // Boolean mutation
// return true;           // Statement deletion
return false;            // Boolean flip
```

## 🔍 Component Priority Matrix

### Critical Components (Test Thoroughly)
| Component | Risk Level | Mutations Expected | Target Score |
|-----------|------------|-------------------|--------------|
| Form | HIGH | ~200 | >95% |
| DataGrid | HIGH | ~300 | >90% |
| DataGridAdvanced | HIGH | ~350 | >90% |
| Charts | HIGH | ~250 | >85% |
| DateRangePicker | MEDIUM | ~150 | >85% |
| Select | MEDIUM | ~100 | >90% |
| CommandPalette | MEDIUM | ~120 | >85% |

### Standard Components
| Component | Risk Level | Mutations Expected | Target Score |
|-----------|------------|-------------------|--------------|
| Button | LOW | ~50 | >95% |
| Card | LOW | ~30 | >95% |
| Badge | LOW | ~25 | >95% |
| Icon | LOW | ~20 | >98% |
| Label | LOW | ~15 | >98% |
| Separator | LOW | ~10 | >100% |

## 📈 Optimization Strategies

### Before Mutation Testing
1. **Review Coverage Gaps**
   ```bash
   pnpm test:coverage
   ```

2. **Identify Weak Tests**
   - Tests with only positive cases
   - Missing edge cases
   - No error handling tests

3. **Strengthen Test Suite**
   - Add boundary value tests
   - Test error conditions
   - Verify state transitions
   - Check accessibility

### During Mutation Testing
1. **Monitor Progress**
   - Watch mutation count
   - Track time per mutation
   - Check memory usage

2. **Handle Timeouts**
   - Increase timeout for complex components
   - Reduce concurrency if needed
   - Use incremental mode

### After Mutation Testing
1. **Analyze Survivors**
   - Review HTML report
   - Identify patterns in surviving mutations
   - Prioritize high-impact fixes

2. **Improve Tests**
   ```typescript
   // Weak test
   it('renders', () => {
     render(<Button>Click</Button>);
   });
   
   // Strong test
   it('handles click events', () => {
     const onClick = jest.fn();
     const { getByRole } = render(
       <Button onClick={onClick}>Click</Button>
     );
     fireEvent.click(getByRole('button'));
     expect(onClick).toHaveBeenCalledTimes(1);
   });
   ```

## 🚨 Troubleshooting

### Common Issues
| Issue | Solution |
|-------|----------|
| Out of memory | Reduce concurrency, increase Node heap |
| Timeouts | Increase timeoutMS, reduce test scope |
| TypeScript errors | Check tsconfig, update types |
| Test failures | Clear cache, update snapshots |
| Slow performance | Use incremental mode, optimize tests |

### Emergency Commands
```bash
# Clear all caches
pnpm clean && rm -rf .stryker-tmp

# Run with debug logging
DEBUG=stryker* pnpm test:mutation

# Use specific Node memory
NODE_OPTIONS="--max-old-space-size=8192" pnpm test:mutation

# Kill stuck processes
pkill -f stryker
```

## 📅 Schedule

### Timeline for Sunday Run
```
01:00 UTC - Pre-flight checks
01:30 UTC - Clear caches and prepare
02:00 UTC - Automated run starts
02:00-06:00 UTC - Mutation testing (4 hours estimate)
06:00 UTC - Report generation
06:30 UTC - Dashboard upload
07:00 UTC - Issue creation (if needed)
08:00 UTC - Team notification
```

### Post-Run Actions
1. Review HTML report at `reports/mutation/index.html`
2. Check dashboard at https://dashboard.stryker-mutator.io
3. Create improvement tickets for survivors
4. Update test suite based on findings
5. Schedule follow-up run if score < 80%

## 🎯 Success Metrics

### Target Goals
- **Overall Score**: >85%
- **Critical Components**: >90%
- **Test Execution Time**: <5 minutes per component
- **Memory Usage**: <4GB
- **Timeout Rate**: <5%

### Tracking Progress
```bash
# Generate metrics
node scripts/mutation-metrics.js

# Compare with previous run
diff reports/mutation/previous.json reports/mutation/current.json

# Export to CSV
node scripts/export-mutation-results.js
```

## 📚 Resources

### Documentation
- [Stryker Mutator Docs](https://stryker-mutator.io/docs/)
- [Mutation Testing Best Practices](https://stryker-mutator.io/docs/stryker-js/guides/best-practices)
- [Vitest Integration](https://stryker-mutator.io/docs/stryker-js/vitest-runner)

### Internal Resources
- Previous mutation reports: `/reports/mutation/history/`
- Component test guide: `/packages/ui/TESTING_GUIDE.md`
- CI/CD configuration: `/.github/workflows/mutation-testing.yml`

## ✅ Final Checklist

### 24 Hours Before (Saturday)
- [ ] Review this guide completely
- [ ] Run manual test on 2-3 components
- [ ] Check CI/CD pipeline status
- [ ] Verify all tests passing
- [ ] Clear test caches
- [ ] Notify team about upcoming run

### Day of Run (Sunday)
- [ ] Monitor GitHub Actions
- [ ] Check memory/CPU usage
- [ ] Watch for timeout issues
- [ ] Be ready to intervene if needed

### After Run (Monday)
- [ ] Review mutation report
- [ ] Create improvement tickets
- [ ] Share results with team
- [ ] Plan test improvements
- [ ] Schedule next run

---

**Remember**: Mutation testing is CPU/memory intensive. The full suite may take 4-6 hours for all 58 components. Plan accordingly!

*Good luck with Sunday's mutation testing run! May your mutations be thoroughly killed! 🎯*
