# Mastik Calc - Israeli Tax & Social Benefits Calculator

A comprehensive React-based calculator for computing Israeli income tax, national insurance contributions, pension deductions, and tax credits. Built with modern TypeScript, React, and Vite, featuring multilingual support (English, Hebrew, Russian) and integration with a FastAPI backend.

## Project Overview

Mastik Calc provides an interactive web interface for Israeli taxpayers to calculate their net salary, tax obligations, and available tax credits based on various personal and employment circumstances. It supports multiple employment types including:

- Single employment (employee)
- Self-employed (various business types)
- Combined employment and self-employment
- Multiple employers

## Technology Stack

### Frontend

- **Vite** - Fast build tool and development server
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-ui** - High-quality React components
- **React Router** - Client-side routing (pages: Index, About, Login, Signup)
- **React Hook Form** - Efficient form state management
- **i18next** - Internationalization (EN, HE, RU)

### Additional Libraries

- **Recharts** - Data visualization for charts
- **Sonner** - Toast notifications
- **React Query** - Server state management
- **Zod** - Schema validation
- **date-fns** - Date utilities
- **Lucide React** - Icon library

### Backend Integration

- **FastAPI** - RESTful API server
- API Base URL: `http://localhost:8000/api/v1`
- Handles tax calculations, credit points, and deductions

## Getting Started

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- FastAPI backend service running locally or accessible via API_BASE_URL

### Installation & Development

```sh
# Clone the repository
git clone https://github.com/YakovTrub/mastik-calc.git

# Navigate to the project directory
cd mastik-calc

# Install dependencies
npm install

# Start the development server with hot reload
npm run dev

# The app will be available at http://localhost:5173
```

### Available Scripts

```sh
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Build in development mode
npm run build:dev

# Preview production build locally
npm run preview

# Run tests with Vitest
npm test

# Run tests with UI
npm test:ui

# Generate test coverage report
npm run test:coverage

# Lint code with ESLint
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── calculator/          # Calculator-specific components
│   │   ├── CalculatorForm.tsx
│   │   ├── MultipleJobsInput.tsx
│   │   ├── SelfEmployedInput.tsx
│   │   ├── MultiSourceResultsDisplay.tsx
│   │   └── ResultsDisplay.tsx
│   ├── ui/                  # shadcn-ui components and custom inputs
│   │   ├── NumericInput.tsx
│   │   ├── DatePickerInput.tsx
│   │   └── [other UI components]
│   └── LanguageSelector.tsx # Multilingual support
├── pages/
│   ├── Index.tsx            # Main calculator page
│   ├── About.tsx            # About page
│   ├── Login.tsx            # Login page
│   ├── Signup.tsx           # Registration page
│   └── NotFound.tsx         # 404 error page
├── services/
│   └── api.ts               # FastAPI client and interface definitions
├── hooks/
│   ├── useCalculator.ts     # Main calculation hook
│   ├── use-toast.ts         # Toast notifications
│   └── use-mobile.tsx       # Mobile detection
├── types/
│   ├── calculator.ts        # Frontend calculator types
│   └── incomeSource.ts      # Income source types
├── utils/
│   └── apiTransform.ts      # Frontend-to-backend data transformation
├── i18n/
│   ├── config.ts            # i18next configuration
│   └── locales/             # Translation files (en.json, he.json, ru.json)
├── lib/
│   └── utils.ts             # Utility functions
└── test/
    ├── setup.ts             # Test configuration
    └── README.md            # Testing documentation
```

## Features

### Tax Calculation

- Income tax calculation based on Israeli tax brackets
- National insurance (Bituach Leumi) contributions
- Health insurance tax
- Pension (Kupat Pensia) contributions
- Accurate deductions and net salary calculation

### Tax Credits

- Calculation of available tax credit points
- Annual and monthly credit value computation
- Support for various credit categories

### Multilingual Support

- English (EN)
- Hebrew (HE)
- Russian (RU)
- Automatic language detection

### Employment Types

- Standard employee income
- Self-employed income (Esek Patur, Esek Murshe, Esek Zair)
- Combined employment scenarios
- Multiple employer support

### Personal Circumstances

- Family status (single, married, widowed, divorced)
- Children and dependent support
- Disability status
- New immigrant (Aliyah) status
- Student status
- Military service (reserve duty)
- Single parent status

## API Integration

The frontend communicates with a FastAPI backend for tax calculations:

### Request Interface

```typescript
interface ApiCalculatorInputs {
  employment_type:
    | "employee"
    | "self_employed"
    | "combined"
    | "multiple_employers";
  gross_salary: number;
  age: number;
  gender: "male" | "female" | "other";
  children: number;
  spouse: boolean;
  // ... and many more fields for comprehensive tax calculation
}
```

### Response Interface

```typescript
interface ApiCalculationResult {
  gross_salary: number;
  net_salary: number;
  credit_points: number;
  tax_credit_annual: number;
  tax_credit_monthly: number;
  effective_tax_rate: number;
  tax_breakdown: {
    income_tax: number;
    national_insurance_employee: number;
    health_tax: number;
    pension_employee: number;
    // ... other deductions
  };
}
```

See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for detailed API documentation.

## Testing

The project uses **Vitest** for unit and integration testing:

```sh
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test:ui

# Generate coverage report
npm run test:coverage
```

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Ensure tests pass: `npm test`
4. Lint code: `npm run lint`
5. Commit with clear messages
6. Push to remote: `git push origin feature/your-feature`
7. Create a Pull Request

## Environment Configuration

### Development

- Frontend runs on: `http://localhost:5173` (Vite default)
- Backend expected at: `http://localhost:8000/api/v1`

### Configuration Files

- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind CSS customization
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - Linting rules
- `postcss.config.js` - PostCSS configuration

## Troubleshooting

### Backend Connection Issues

If you encounter API errors, verify:

1. FastAPI backend is running on `http://localhost:8000`
2. CORS is properly configured on the backend
3. Check browser console for detailed error messages

### Module Import Errors

Run `npm install` again to ensure all dependencies are installed correctly.

### Build Issues

Clear the dist folder and rebuild:

```sh
rm -rf dist
npm run build
```

## Contributing

Contributions are welcome! Please follow the existing code style and ensure all tests pass before submitting a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Repository

- **Owner**: YakovTrub
- **Repository**: mastik-calc
- **Current Branch**: dev
- **Default Branch**: main
- **Remote URL**: https://github.com/YakovTrub/mastik-calc
