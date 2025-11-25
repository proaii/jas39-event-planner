# ✅ AddTaskModal – Checklist to Fix

### State Management
* [x] Use Zustand only for UI state (`isAddTaskModalOpen`, `closeAddTaskModal`, etc.)
* [x] Move form data, `pending`, `error` out of Zustand into component local state or React Query
* [x] Server-side data like `assignees` or `eventMembers` → load via React Query

### React Query
* [x] Move task creation to `useMutation()`
* [x] After successful creation → `invalidateQueries(['tasks'])`
* [x] Stop using mock data → always fetch from real API
* [x] Move submit `error`/`pending` to mutation state

### Submit Logic
* [x] `handleSubmit` should use React Query mutation
* [x] Show toast error/success based on mutation state
* [x] Reset form using local state instead of Zustand (UI flags excepted)

---

# ✅ EditTaskModal – Checklist to Fix

### State Structure
* [x] Move `pending` and `error` out of Zustand
* [x] Use `mutation.isPending` and `mutation.error` from React Query

### Source of Truth
* [x] Load task via React Query:
```ts
  const { data: task } = useQuery(['task', taskId], fetchTask)
```

* [x] Zustand only for draft form or UI state (e.g., modal open/close)
* [x] Ensure task data in store comes from API, not mock data

### Component Structure

* [x] Split modal code into smaller components:

  * `EditTaskHeader`
  * `EditTaskTimeSection`
  * `EditTaskPriority`
  * `EditTaskStatus`
  * `EditTaskSubtasks`
  * `EditTaskAttachments`
  * `EditTaskAssignees`
* [x] Keep modal component only for orchestration and submit handler

### Utils

* [x] Move pure utility functions out of component:

  * `getFaviconFromUrl()`
  * `extractTitleFromUrl()`
* [x] Store in `lib/utils` or `features/tasks/utils`

### Sync Rules

* [x] Task list must sync from React Query (`useQuery(['tasks'])`)
* [x] After editing task → `invalidateQueries(['task', id])`
* [x] If list needs refresh → `invalidateQueries(['tasks'])`

---

# ✅ TaskDetail – Checklist to Fix

### State Management

* [x] Remove `detailLoading`, `detailError` from Zustand
* [x] Use React Query (`isLoading`, `isError`) as source of truth
* [x] Zustand only for panel or layout UI state

### React Query

* [x] Use `useFetchTask(taskId)` as main data source
* [x] Stop syncing loading/error to store
* [x] For refresh → `invalidateQueries(['task', taskId])`
* [x] For list update → `invalidateQueries(['tasks'])`

### Component Structure

* [x] Split sections into components:

  * `TaskDetailStatus`
  * `TaskDetailPriority`
  * `TaskDetailDates`
  * `TaskDetailDescription`
  * `TaskDetailAssignees`
  * `TaskDetailSubtasks`
  * `TaskDetailAttachments`
  * `TaskDetailEventInfo`
* [x] Keep main component only for data loading and layout wrapper

### Presentation Logic

* [x] Move date formatting (`formatFullDate()`) to utils
* [x] Split skeleton into `TaskDetailSkeleton`

### Error Handling

* [x] Don’t use Zustand error in error panel
* [x] Show error directly from React Query state
* [x] Toast errors from `error.message` of query

### Source of Truth

* [x] Task data must come 100% from React Query
* [x] Never read task data from Zustand (except UI flags)
* [x] If store has tasks array → sync with `useQuery(['tasks'])`

---

# 🧩 Global Checklist (Tasks + Events)

### Server State

* [x] Use React Query for all server state
* [x] Avoid duplication between Zustand ↔ Local state ↔ React Query

### UI State

* [x] Zustand only for UI flags like modal open/close, drawer, panel, sidebar

### Data Loading

* [x] All components that used mock data → must fetch from real API via React Query
* [x] All pages must have skeletons and error UI

### Submission / Mutation

* [x] Every mutation must handle `onSuccess`, `onError`, and invalidate queries
* [x] After create/edit/delete → invalidate related queries

### Utils / Pure Logic

* [x] All pure utilities must be moved out of components
* [x] Store in `lib/utils/*` or `features/tasks/utils/*`

### Component Hygiene

* [x] Modals, drawers, detail panels → only orchestration
* [x] Subcomponents → presentation + isolated logic
* [x] No business logic inside JSX

---

# ✅ tasks/page – Checklist to Fix

### State Management

* [x] Move `events` out of Zustand → use React Query as source of truth
* [x] Remove `setEvents()` syncing from fetchedEvents → use `fetchedEvents.items` directly
* [x] Zustand only for UI state (`searchQuery`, filter panel, modal flags)
* [x] Move `prefillData` to local state or pass via modal props

### React Query

* [x] Fix `useFetchEvents()` to return ready-to-use data `{ items }`
* [x] Component should use `fetchedEvents.items` instead of store
* [x] Create/Delete event:

  * [x] Use mutation state (`isPending`) instead of manual state
  * [x] Refresh list via `invalidateQueries(['events'])`
* [x] Remove reading events from store

### Filter & Sort Logic

* [x] Apply filter/sort on `fetchedEvents.items`, not store
* [x] Refactor filter logic to utils (`/features/events/utils/filterEvents.ts`)
* [x] Refactor sort logic to utils (`/features/events/utils/sortEvents.ts`)

### Component Cleanup

* [ ] Split UI:

  * SearchBar → `EventsSearchBar`
  * FilterPopover → `EventsFilterPanel`
  * SortSelect → `EventsSortSelect`
  * EventsGrid → `EventsGrid`
* [x] Keep AllEventsPage only for orchestration + layout

### Remove Legacy Logic

* [x] Remove hard-coded progress/date filters → move to utils
* [x] Remove unused handlers (`onEdit`, `onAddTask`) from EventCard
* [x] Remove custom sync logic in `useEffect`

### Modals

* [x] AddEventModal → use React Query for creation; do not read events from store
* [x] CreateFromTemplateModal → fetch template list from API; use `fetchedEvents.items` instead of store

### Error & Loading Handling

* [x] Show skeleton while loading `<EventsGridSkeleton />`
* [x] Show error from React Query, not store
* [x] Remove loading/error state from store

### Source of Truth

* [x] Events must come from React Query only
* [x] No event array in Zustand
* [x] After refactor, ensure `useEventStore` is removed

### Minor Improvements

* [x] Convert `filteredAndSortedEvents` to `useMemo` on query data
* [x] Handle empty state using React Query (`isLoading`, `isError`)
* [x] Fix template modal to avoid creating objects repeatedly in render

---

# ✅ Event Page – Checklist

### State Management

* [x] Move server state (`events`) out of `useEventStore` → React Query as source of truth
* [x] `setEvents` in store only for temporary UI state if needed
* [x] UI flags (modal open/close, filters, search) → Zustand
* [x] Temporary local state (prefill data, temp filters) → component state (`useState`)
* [x] Remove mock data/local state duplicated with query

### React Query

* [x] Load events via `useQuery(['events'])` instead of store
* [x] Create event → `useMutation(createEventMutation)`
* [x] After create → `invalidateQueries(['events'])`
* [x] Remove logic copying fetchedEvents → setEvents
* [x] Remove `useEventStore().events` as source of truth

### Mutations

* [x] Use `mutation.isLoading`, `mutation.isError`, `mutation.isSuccess` instead of local pending/error
* [x] Remove toast/error tied to store; use mutation state
* [x] Delete event → `useMutation` + invalidate query

### Search / Filter / Sort

* [x] `searchQuery` → Zustand OK
* [x] `sortBy`, `isFilterOpen`, `progressFilters`, `dateFilters` → Zustand UI state
* [x] Temp filters → local state
* [x] `filteredAndSortedEvents` → pure filtering on query data, no store

### Component Structure

* [ ] Split UI components:

  * `EventPageHeader` → header + create button + template menu
  * `EventPageFilters` → search + filter + sort
  * `EventGrid` → grid of EventCards
  * `EventEmptyState` → empty display
  * `EventResultsCounter` → display count
* [x] Keep main page only for layout + query + orchestration

### Modals

* [x] `AddEventModal` → local prefillData + mutation state
* [x] `CreateFromTemplateModal` → fetch from query, not store
* [x] Modal state (open/close) → Zustand UI store

### Error & Loading Handling

* [x] Skeleton/loading → React Query
* [x] Error → show from query
* [x] Toast → use mutation state

### General Cleanup

* [x] Remove commented/unused code
* [x] Remove redundant state/store
* [x] Move pure utilities → `lib/utils` (`applyFilters`, `sortEvents`)

---

# ✅ EventDetailPage – Checklist

### State Management

* [x] Do not keep server state (event/tasks) in local store
* [x] Use React Query for event data (`useEventById`)
* [x] `addTask` and `updateTaskStatusInStore` → use mutation + invalidate query
* [x] UI flags → Zustand
* [x] Temporary local state (prefill data) → component state

### React Query

* [x] Load event → `useQuery(['event', eventId], fetchEventById)`
* [x] Load tasks → `useQuery(['tasks', eventId])`
* [x] Event deletion → `useMutation` + invalidate `['events']` + redirect
* [x] Task addition → `useMutation` + invalidate `['tasks', eventId]`
* [x] Task status update → `useMutation` + invalidate `['tasks', eventId]`
* [x] Template save → mutation + toast from state

### UI / Component Structure

* [ ] Split EventDetail into presentation-only components
* [x] Keep EventDetailPage for query + orchestration + handlers
* [x] EditEventModal → receive event via query; modal open/close via Zustand
* [x] Error/loading → from React Query

### Error & Loading Handling

* [x] Skeleton/spinner → `isLoading` from query
* [x] Error → show from query, not store
* [x] Toast → use mutation state

### Auth / Users

* [x] Use React Query/custom hook (`useFetchCurrentUser`, `useFetchUsers`)
* [x] Do not store user info locally; query is source of truth
* [x] Loading/error state → render skeleton/error message

### Handlers / Actions

* [x] `handleAddTask`, `handleTaskStatusChange` → mutation + invalidate queries
* [x] `handleDeleteEvent` → mutation + invalidate `['events']`
* [x] `handleSaveTemplate` → mutation + toast
* [x] `handleEditEvent` → open modal via Zustand UI store

### General Cleanup

* [x] Remove store sync logic (`useTasksStore`, `useEventStore`)
* [x] Remove commented/unused imports
* [x] Move pure functions → `lib/utils` (toast helpers, format functions)

---

# ✅ Dashboard Page – Checklist

### State Management

* [x] Use React Query as source of truth for events, tasks, users
* [x] UI flags (modal open/close) → Zustand UI store
* [x] Do not store server state in local component state
* [x] Temporary prefill data → UI store or modal component state

### Data Fetching / Queries

* [x] Events → `useFetchEvents` (check pagination/infinite)
* [x] Tasks → `useFetchAllTasks` (`items` properly set)
* [x] Users → `useFetchUsers` + `useFetchUser` for current user
* [x] Check loading/error handling of all queries (`isLoading`, `isError`)

### Mutations

* [x] Create Event → `useCreateEvent` + toast + close modal + invalidate `['events']`
* [x] Handle Template → store prefill data + open AddEventModal
* [x] Toast feedback for success/error

### Modals

* [x] `AddEventModal` → pass `onCreateEvent` handler
* [x] `AddTaskModal` → pass `currentUser` + `eventMembers`
* [x] `CustomizeDashboardModal` → only `isOpen` + `onClose`
* [x] `CreateFromTemplateModal` → fetch templates itself; send prefill handler

### Dashboard Component

* [x] Props → events, tasks, visibleWidgets, handlers
* [x] Event click → currently console.log, should navigate/modal per UX
* [x] Check widget visibility

### Error / Loading Handling

* [x] Show skeleton/spinner while fetching events/tasks/users
* [x] Errors → toast or UI message

### General Cleanup

* [x] Remove commented/unused imports
* [x] Remove old placeholder logic (e.g., console.log)
* [x] Split handlers into pure functions (create event, use template)
* [x] Check type safety for `DashboardCreateEventInput`
