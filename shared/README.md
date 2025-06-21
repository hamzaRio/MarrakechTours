# MarrakechDeserts - Shared

This directory contains shared code and types that are used by both the client and server parts of the MarrakechDeserts project.

## Contents

- `schema.ts` - Shared data models and validation schemas

## Usage

These shared types and schemas ensure type consistency between the client and server, reducing errors and making the codebase more maintainable.

### In Client Code

```typescript
import { Activity, BookingFormData } from "@shared/schema";
```

### In Server Code

```typescript
import { Activity, InsertActivity } from "@shared/schema";
```