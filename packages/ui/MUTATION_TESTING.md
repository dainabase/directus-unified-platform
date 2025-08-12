# 🧬 Mutation Testing Guide

## 🎯 What is Mutation Testing?

Mutation testing is a technique to evaluate the quality of your test suite by introducing small changes (mutations) to your code and checking if tests detect these changes.

### How it Works
1. **Mutants are created**: Small changes to your code (e.g., `>` becomes `>=`)
2. **Tests are run**: Against each mutant
3. **Results evaluated**: 
   - **Killed**: Tests detected the mutation ✅
   - **Survived**: Tests didn't detect the mutation ⚠️
   - **Timeout**: Mutation caused infinite loop 🕰️

## 🚀 Getting Started

### Installation
```bash
# Install Stryker and plugins
pnpm add -D @stryker-mutator/core \
  @stryker-mutator/vitest-runner \
  @stryker-mutator/typescript-checker \
  @stryker-mutator/html-reporter \
  @stryker-mutator/json-reporter
```

### Running Mutation Tests

```bash
# Run mutation testing for all components
pnpm run test:mutation

# Run for specific component
pnpm run test:mutation -- --mutate "src/components/Button/**/*.{ts,tsx}"

# Run with specific configuration
pnpm run test:mutation -- --concurrency 2 --timeoutMS 60000
```

## 📊 Understanding Results

### Mutation Score
```
Mutation Score = (Killed / (Killed + Survived)) * 100
```

### Score Interpretation
- **90-100%**: Excellent test quality 🏆
- **80-89%**: Good test quality ✅
- **75-79%**: Acceptable, needs improvement ⚠️
- **< 75%**: Poor test quality, action required 🔴

### Report Structure
```
reports/mutation/
├── index.html           # Interactive HTML report
├── report.json          # JSON data for CI/CD
└── stryker.log          # Detailed logs
```

## 🧬 Types of Mutations

### 1. Arithmetic Operator
```typescript
// Original
const result = a + b;
// Mutation
const result = a - b;
```

### 2. Conditional Boundary
```typescript
// Original
if (value >= 10)
// Mutations
if (value > 10)
if (value < 10)
```

### 3. Logical Operator
```typescript
// Original
if (a && b)
// Mutation
if (a || b)
```

### 4. String Literal
```typescript
// Original
const message = "Success";
// Mutation
const message = "";
```

### 5. Boolean Literal
```typescript
// Original
const isEnabled = true;
// Mutation
const isEnabled = false;
```

## 🎯 Improving Mutation Score

### 1. Add Boundary Tests
```typescript
// If your code has: if (value > 10)
// Test both:
test('handles value exactly at boundary', () => {
  expect(fn(10)).toBe(false);
  expect(fn(11)).toBe(true);
});
```

### 2. Test Return Values
```typescript
// Don't just test that function runs
test('returns correct value', () => {
  const result = calculate(5, 3);
  expect(result).toBe(8); // Not just toBeDefined()
});
```

### 3. Test Edge Cases
```typescript
test('handles empty arrays', () => {
  expect(sum([])).toBe(0);
});

test('handles null values', () => {
  expect(process(null)).toBeNull();
});
```

### 4. Test Error Conditions
```typescript
test('throws on invalid input', () => {
  expect(() => fn(-1)).toThrow('Value must be positive');
});
```

## 📝 Configuration

### Basic Configuration
```javascript
// stryker.config.mjs
export default {
  testRunner: 'vitest',
  mutate: ['src/**/*.ts'],
  thresholds: { high: 90, low: 80, break: 75 }
};
```

### Advanced Configuration
```javascript
export default {
  mutator: {
    excludedMutations: [
      'BlockStatement',      // Don't remove {}
      'ConditionalExpression' // Don't mutate ternary
    ]
  },
  sandbox: {
    fileHeaders: {
      '**/*.ts': '// @ts-nocheck\n'
    }
  },
  timeoutMS: 30000,
  timeoutFactor: 2
};
```

## 🎯 Best Practices

### 1. Start Small
- Begin with critical components
- Gradually expand coverage
- Set realistic thresholds

### 2. Focus on Survived Mutants
```bash
# Find survived mutants
grep "Survived" reports/mutation/stryker.log
```

### 3. Incremental Testing
```javascript
// Use incremental mode for faster runs
{
  incremental: true,
  incrementalFile: '.stryker-incremental.json'
}
```

### 4. CI/CD Integration
- Run weekly, not on every commit
- Create issues for score drops
- Track score trends over time

## 📊 Metrics to Track

### Component Level
| Component | Score | Killed | Survived | Trend |
|-----------|-------|--------|----------|-------|
| Button | 95% | 95 | 5 | ↑ |
| Input | 88% | 88 | 12 | → |
| Dialog | 92% | 92 | 8 | ↑ |

### Project Level
- Overall mutation score
- Score by component category
- Most resilient components
- Components needing attention

## 🔍 Common Issues

### 1. Timeout Mutants
**Problem**: Mutation causes infinite loop
**Solution**: Add timeout checks in code

### 2. Equivalent Mutants
**Problem**: Mutation doesn't change behavior
**Solution**: Exclude via configuration

### 3. Slow Performance
**Problem**: Tests take too long
**Solution**: 
- Reduce concurrency
- Increase timeout
- Use incremental mode
- Test subset of files

## 📝 Example Workflow

1. **Run mutation testing**
   ```bash
   pnpm test:mutation
   ```

2. **Review HTML report**
   ```bash
   open reports/mutation/index.html
   ```

3. **Identify survived mutants**
   - Click on survived mutants in report
   - See exact code changes

4. **Improve tests**
   - Add test cases for survived mutants
   - Focus on boundary conditions

5. **Re-run and verify**
   ```bash
   pnpm test:mutation -- --incremental
   ```

## 🎯 Goals

### Short Term
- [ ] Achieve 80% mutation score
- [ ] Zero survived mutants in critical components
- [ ] Weekly automated runs

### Long Term
- [ ] Achieve 90% mutation score
- [ ] Mutation testing for all new components
- [ ] Integration with PR checks
- [ ] Historical tracking and trends

## 📚 Resources

- [Stryker Mutator Documentation](https://stryker-mutator.io/)
- [Mutation Testing Concepts](https://stryker-mutator.io/docs/mutation-testing-elements/)
- [Mutation Operators](https://stryker-mutator.io/docs/mutation-testing-elements/supported-mutators)

---

*Kill all mutants! 🧬*