# Registration System - Implementation Guide

## Overview

The registration system has been refactored to follow the **4-layer architecture** pattern:

1. **API Service** (`services/api.ts`) - Base HTTP client with auth handling
2. **Feature Services** (`features/auth/services/registrationService.ts`) - Domain API functions
3. **React Query Hooks** (`features/auth/hooks/useRegistration.ts`) - Mutation wrappers
4. **Components** (`app/register/page.tsx`) - UI that consumes hooks

## Architecture

### Layer 1: API Service (`services/api.ts`)

**Base HTTP Client:**
- Uses Axios with env-based base URL (`NEXT_PUBLIC_API_URL` or `http://localhost:8000/api`)
- Default `Content-Type: application/json`
- Response interceptors handle:
  - **401 Unauthorized**: Clears token, shows toast, redirects to `/login`
  - **403 Forbidden**: Shows permission error toast
  - **422 Validation Error**: Passes through for field-level handling

**Token Management:**
- `getToken()`: Reads `bidooze_auth_token` from cookie
- `setToken(token)`: Sets token in cookie (7 days expiry)
- `removeToken()`: Removes token from cookie

**Auth Wrappers:**
- `withAuth`: Adds `Authorization: Bearer {token}` header
- `withoutAuth`: No auth header (for public endpoints)

### Layer 2: Registration Service (`features/auth/services/registrationService.ts`)

**Endpoints:**
- `submitStepOne(data)` - Company information
- `submitStepTwo(data)` - Personal information
- `submitStepThree(data)` - Address information
- `submitStepFour(data)` - Credentials & documents (multipart/form-data)
- `submitStepFive(data)` - Bank information (final step)

**Pattern:**
- Uses `withoutAuth` (registration is public)
- Handles both direct data and `{ data }` wrapped responses
- Step 4 uses `FormData` for file uploads
- Throws normalized error objects with `message` property

### Layer 3: React Query Hooks (`features/auth/hooks/useRegistration.ts`)

**Mutations:**
```typescript
const { stepOne, stepTwo, stepThree, stepFour, stepFive } = useRegistration();
```

Each mutation provides:
- `mutateAsync(data)` - Execute mutation
- `isPending` - Loading state
- `isError` - Error state
- `error` - Error object
- `data` - Response data

### Layer 4: Registration Page (`app/register/page.tsx`)

**Flow:**
1. User fills Step 1 → calls `stepOne.mutateAsync()`
2. Receives `registration_token` → stored in state
3. Subsequent steps include `registration_token` in payload
4. Step 4 handles file uploads (license documents)
5. Step 5 completes registration → shows success message

**Error Handling:**
- Extracts `error.message` or `error.response.data.message`
- Handles validation errors (`error.errors` object)
- Shows field-level error messages via toast

## Registration Steps

### Step 1: Company Information
- Company Name
- Registration Number
- TIN (Tax Identification Number)
- Business Type
- Specialization (array)
- Years in Business

**Endpoint:** `POST /api/registration/step-one`
**Response:** `{ registration_token: string }`

### Step 2: Personal Information
- First Name
- Last Name
- Email
- Phone
- Password
- Password Confirmation

**Endpoint:** `POST /api/registration/step-two`
**Payload:** Includes `registration_token`

### Step 3: Address Information
- Address
- City
- State
- Zip Code
- Country

**Endpoint:** `POST /api/registration/step-three`
**Payload:** Includes `registration_token`

### Step 4: Credentials & Documents
- License Number
- License Expiration Date
- Certifications (optional)
- Associations (optional)
- License Documents (FileList - PDF, JPG, JPEG, PNG, max 10MB)

**Endpoint:** `POST /api/registration/step-four`
**Content-Type:** `multipart/form-data`
**Payload:** Includes `registration_token` and files as `licenseDocuments[0]`, `licenseDocuments[1]`, etc.

### Step 5: Bank Information
- Bank Name
- Account Number
- Routing Number
- Account Holder Name

**Endpoint:** `POST /api/registration/step-five`
**Payload:** Includes `registration_token`
**Response:** `{ message: string, user?: {...} }`

## Testing the Registration Flow

### 1. Start Backend Server
```bash
# Ensure Laravel backend is running on http://localhost:8000
php artisan serve
```

### 2. Set Environment Variable
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Test Registration Steps

**Step 1 Test:**
```typescript
// Should return registration_token
const result = await stepOne.mutateAsync({
  companyName: "Test Company",
  registerationNumber: "123456789",
  tin: "987654321",
  businessType: "LLC",
  specialization: ["Art", "Antiques"],
  yearsInBusiness: "5"
});
console.log(result.registration_token);
```

**Step 2-5:**
- Each step requires `registration_token` from Step 1
- Step 4 requires file uploads (FormData)
- Step 5 completes registration

### 4. Error Scenarios

**Validation Errors (422):**
```typescript
try {
  await stepOne.mutateAsync({ /* invalid data */ });
} catch (error: any) {
  if (error.errors) {
    // Field-level errors
    Object.entries(error.errors).forEach(([field, messages]) => {
      console.log(`${field}: ${messages.join(", ")}`);
    });
  } else {
    // General error
    console.log(error.message);
  }
}
```

**Network Errors:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check CORS settings on backend

## Key Improvements

1. ✅ **React Query Integration**: Proper mutation handling with loading states
2. ✅ **Error Handling**: Extracts backend error messages and validation errors
3. ✅ **File Upload Support**: Step 4 properly handles multipart/form-data
4. ✅ **Type Safety**: Full TypeScript types for all payloads and responses
5. ✅ **Token Management**: Proper cookie handling for registration token
6. ✅ **Consistent Architecture**: Follows same pattern as auction service

## Next Steps

1. **Login Integration**: After registration, user should be able to login
2. **Token Storage**: On successful registration, store auth token if backend returns it
3. **Email Verification**: Handle email verification flow if required
4. **Account Approval**: Handle pending approval state for auctioneers

## API Endpoints Reference

All endpoints are under `/api/registration/`:

- `POST /api/registration/step-one` - Company info
- `POST /api/registration/step-two` - Personal info
- `POST /api/registration/step-three` - Address info
- `POST /api/registration/step-four` - Credentials (multipart)
- `POST /api/registration/step-five` - Bank info (final)

All steps after Step 1 require `registration_token` in payload.

