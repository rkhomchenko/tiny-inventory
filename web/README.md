# Tiny Inventory - Frontend Application

A modern React TypeScript application for managing stores and product inventory.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query (React Query)** - Server state management and caching
- **Tailwind CSS** - Utility-first styling

## Features

### Stores Management
- **List View**: Grid display of all stores with quick actions
- **Detail View**: Store information with complete inventory table
- **Create/Edit**: Form validation for store data
- **Delete**: Confirmation dialog before deletion
- **Inventory Management**: Add products to store, update quantities, remove products

### Products Management
- **List View**: Grid display with pagination
- **Filtering**: Filter by category, price range
- **Sorting**: Sort by name, price, category, or date created
- **Detail View**: Complete product information
- **Create/Edit**: Form validation for product data
- **Delete**: Confirmation dialog before deletion

### UI/UX Features
- **Loading States**: Spinner animations during data fetching
- **Error States**: User-friendly error messages with retry options
- **Empty States**: Helpful prompts when no data exists
- **Form Validation**: Client-side validation with error messages
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Navigation**: Clean navigation bar with active state indicators

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── EmptyState.tsx
│   ├── ErrorMessage.tsx
│   ├── Layout.tsx
│   ├── LoadingSpinner.tsx
│   └── Pagination.tsx
├── pages/               # Page components (one per route)
│   ├── Home.tsx
│   ├── StoresList.tsx
│   ├── StoreDetail.tsx
│   ├── StoreForm.tsx
│   ├── ProductsList.tsx
│   ├── ProductDetail.tsx
│   ├── ProductForm.tsx
│   ├── AddProductToStore.tsx
│   └── UpdateInventory.tsx
├── services/            # API client
│   └── api.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx              # Main app component with routing
├── main.tsx             # Application entry point
└── index.css            # Global styles with Tailwind

```

## Development

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

### Run Tests
```bash
npm test
```

## API Integration

The application connects to the backend API at `http://localhost:3000`. API calls are automatically proxied through Vite during development (configured in `vite.config.ts`).

All API endpoints are abstracted in `src/services/api.ts` for easy maintenance and testing.

## Design Decisions

### State Management
- **TanStack Query** for server state: Automatic caching, background refetching, and request deduplication
- **React useState** for local UI state: Simple and sufficient for form inputs and UI toggles
- **URL state** for filters and pagination: Enables shareable URLs and better UX

### Styling
- **Tailwind CSS**: Rapid development with utility classes, easy customization, and small bundle size
- **Component-based**: Reusable components (Button, Card, etc.) for consistency

### Forms
- **Controlled components** with local validation
- Error messages displayed inline
- Loading states on submit buttons
- Cancel actions to improve UX

### Error Handling
- API errors caught and displayed with user-friendly messages
- Retry functionality where appropriate
- Form-specific error handling with field-level feedback

## Future Enhancements

If I had more time, I would add:

1. **Enhanced Testing**: Unit tests for components, integration tests for user flows, E2E tests with Playwright
2. **Advanced Features**: Bulk operations, CSV export/import, search functionality, analytics dashboard
3. **Performance**: Virtual scrolling for large lists, optimistic updates, service worker for offline support
4. **Accessibility**: ARIA labels, keyboard navigation, screen reader support, focus management
5. **User Experience**: Toast notifications, undo/redo, drag-and-drop for inventory, dark mode
