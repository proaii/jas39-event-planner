# Front-End Development Ruleset

This document outlines the rules and best practices for front-end development in this project. Adhering to these guidelines will ensure a consistent, maintainable, and high-quality codebase.

## 1. TypeScript and Strict Typing

***Enforce Strict Types:** All new code must be strictly typed. Enable `strict` mode in your `tsconfig.json` to enforce this.
***Type Everything:** All variables, function parameters, and return values must have explicit types. Avoid using `any` whenever possible. If you must use `any`, provide a comment explaining why.
***Interfaces and Types:** Use interfaces for defining the shape of objects and classes. Use types for defining unions, intersections, and other complex types.

## 2. Styling and Colors

***NO STATIC COLORS:** Static colors (e.g., `#FFFFFF`, `rgb(255, 0, 0)`) are strictly forbidden in the codebase. All colors must be defined as CSS variables in the `app/globals.css` file and accessed through the Tailwind CSS configuration.
***Theming:** The application must support both light and dark themes. All colors must be defined for both themes.
***Tailwind CSS:** All styling must be done using Tailwind CSS utility classes. Do not write custom CSS unless absolutely necessary. If you must write custom CSS, it should be placed in the `app/globals.css` file.

## 3. Directory Structure

***Keep it Organized:** The directory structure should be kept clean and organized. All new components should be placed in the appropriate subdirectory of the `components` or `app/ui/components` directory.
***Feature-Based Structure:** Group files by feature, not by type. For example, all files related to the login feature should be placed in the `app/auth/login` directory.
***Component Naming:** Component files should be named using PascalCase (e.g., `MyComponent.tsx`).

## 4. Component Design

***Single Responsibility Principle:** Each component should have a single responsibility. Avoid creating large, monolithic components that do too many things.
***Reusable Components:** Create reusable components whenever possible. If you find yourself writing the same code in multiple places, it's a good indication that you should create a reusable component.
***Props:** All component props must be typed using interfaces or types.

## 5. State Management (To be edited...)

***Component State:** For simple component state, use the `useState` hook.
***Global State:** For global application state, use a state management library like Zustand or Redux. Do not use the `useState` hook for global state.

## 6. API Requests

***Supabase Client:** All API requests to the Supabase backend must be made through the Supabase client. Do not use `fetch` or other HTTP clients directly.
***Error Handling:** All API requests must have proper error handling. Display a user-friendly error message if an API request fails.

## 7. Linting and Formatting

***ESLint:** All code must adhere to the ESLint rules defined in the `.eslintrc.json` file.
***Prettier:** All code must be formatted using Prettier. Configure your editor to format on save to ensure consistent formatting.

## 8. Testing

***Unit Tests:** All new components and functions must have unit tests. Use a testing framework like Playwright write your tests.
***Integration Tests:** Write integration tests to test the interaction between multiple components.
***End-to-End Tests:** Write end-to-end tests to test the application as a whole. Use a tool like Cypress or Playwright to write your end-to-end tests.

By following these rules, we can create a high-quality, maintainable, and scalable front-end application.
