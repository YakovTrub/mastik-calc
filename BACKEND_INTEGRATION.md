# Backend Integration Documentation

## Overview
The MASTIK calculator frontend has been updated to consume the FastAPI backend instead of performing calculations locally.

## Changes Made

### 1. API Service Layer (`src/services/api.ts`)
- Created `ApiService` class to handle HTTP requests
- Defined TypeScript interfaces for API communication
- Implemented methods for calculation, health check, and tax constants

### 2. Data Transformation (`src/utils/apiTransform.ts`)
- `transformToApiInputs()`: Converts frontend form data to backend API format
- `transformFromApiResult()`: Converts backend response to frontend result format
- Handles field name mapping (camelCase ↔ snake_case)

### 3. React Hook (`src/hooks/useCalculator.ts`)
- `useCalculator()` hook encapsulates API calls and state management
- Provides loading states, error handling, and health checking
- Returns calculation function and status indicators

### 4. Updated Main Page (`src/pages/Index.tsx`)
- Added backend status indicator in header
- Displays connection status (online/offline/checking)
- Shows error alerts for API failures
- Disables form when backend is offline
- Added loading spinner during calculations

### 5. Form Updates (`src/components/calculator/CalculatorForm.tsx`)
- Added `disabled` prop to prevent submissions when backend is offline
- Updated button text to show backend status

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check if backend is running |
| `/api/v1/calculator/calculate` | POST | Perform salary calculations |
| `/api/v1/calculator/constants` | GET | Get tax constants |
| `/api/v1/calculator/tax-brackets` | GET | Get tax brackets |

## Data Flow

```
Frontend Form → transformToApiInputs() → API Service → Backend
Backend Response → transformFromApiResult() → Frontend Display
```

## Field Mapping

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `employmentType` | `employment_type` | Enum values remain same |
| `grossSalary` | `gross_salary` | Direct mapping |
| `numberOfChildren` | `children` | Direct mapping |
| `maritalStatus` | `spouse` | Converted to boolean |
| `hasDisability` | `disabled` | Direct mapping |
| `isNewImmigrant` | `new_immigrant` | Direct mapping |

## Error Handling

1. **Network Errors**: Displayed as alerts in the UI
2. **Backend Offline**: Form disabled, status indicator shows offline
3. **Validation Errors**: API returns 400 with error details
4. **Server Errors**: API returns 500, generic error shown

## Testing

### Manual Testing
1. Start backend: `cd /home/njama/mastik_calc_backend && python start_server.py`
2. Start frontend: `cd /home/njama/mastik_calc && npm run dev`
3. Open browser to `http://localhost:5173`
4. Check status indicator shows "Backend Online"
5. Fill form and submit calculation

### Automated Testing
Run the connection test:
```bash
cd /home/njama/mastik_calc
node test_connection.js
```

## Configuration

### Backend URL
Currently hardcoded to `http://localhost:8000` in `src/services/api.ts`.

For production, create environment variable:
```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000';
```

### CORS
Backend is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev port)

## Troubleshooting

### Backend Not Starting
- Check if port 8000 is available
- Verify Python dependencies are installed
- Check backend logs for errors

### CORS Issues
- Ensure frontend URL is in backend CORS origins
- Check browser console for CORS errors

### Calculation Errors
- Verify input data format matches API expectations
- Check backend logs for validation errors
- Ensure all required fields are provided

## Future Improvements

1. **Environment Configuration**: Use environment variables for API URL
2. **Retry Logic**: Implement automatic retry for failed requests
3. **Caching**: Cache tax constants and brackets
4. **Offline Mode**: Fallback to local calculations when backend unavailable
5. **Real-time Status**: WebSocket connection for real-time backend status
