# Test Suite

This directory contains unit tests for the Israeli Tax Calculator application.

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

### Calculation Modules
- **Income Tax** (`incomeTax.test.ts`) - Progressive tax bracket calculations
- **Pension** (`pension.test.ts`) - Employee and self-employed pension contributions
- **Bituach Leumi** - National insurance calculations (to be added)
- **Credit Points** - Tax credit point calculations (to be added)
- **Donations** (`donations.test.ts`) - Donation tax credits (§46)
- **Disability** (`disability.test.ts`) - Disability exemption calculations
- **Locality** (`locality.test.ts`) - Geographic tax discounts
- **Self-Employed** (`selfEmployed.test.ts`) - Profit and tax base calculations
- **Fringe Benefits** (`fringeBenefits.test.ts`) - Taxable benefit calculations

### Tax Engines
- **Self-Employed Engine** (`selfEmployedEngine.test.ts`) - Complete self-employed tax calculations
- **Tax Engine** - Employee tax calculations (to be added)
- **Multi-Source Engine** - Multiple income source calculations (to be added)

## Writing Tests

Tests use Vitest and follow these conventions:

1. **File naming**: `*.test.ts` or `*.test.tsx`
2. **Location**: Tests are placed in `__tests__` folders alongside the code they test
3. **Structure**: Use `describe` blocks to group related tests
4. **Assertions**: Use Vitest's `expect` API

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

## Test Configuration

- Configuration file: `vitest.config.ts`
- Setup file: `src/test/setup.ts`
- Path aliases: `@/` points to `src/`
