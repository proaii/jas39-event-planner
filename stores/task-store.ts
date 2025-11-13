import { create } from "zustand";
import type { Task } from "@/lib/types";

// Define the structure of the TaskStore
interface TaskStore {
  tasks: Task[];                     // Array of all tasks
  selectedTask: Task | null;         // Currently selected task, if any

  // CRUD operations
  addTask: (task: Omit<Task, "taskId" | "createdAt">) => void; 
  updateTask: (
    taskId: string,
    updated: Partial<Omit<Task, "taskId" | "createdAt">>
  ) => void;
  deleteTask: (taskId: string) => void;

  // Selection helpers
  selectTask: (task: Task | null) => void;

  // Clear all tasks
  clearTasks: () => void;
}

// Create Zustand store
export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  selectedTask: null,

  // Add a new task
  addTask: (newTaskData) => {
    const newTask: Task = {
      // Unique task ID using timestamp
      taskId: `task_${Date.now()}`,
      // Store creation time in ISO format
      createdAt: new Date().toISOString(),
      ...newTaskData,
    };
    // Add new task to existing tasks array
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  // Update an existing task by ID
  updateTask: (taskId, updated) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.taskId === taskId ? { ...t, ...updated } : t
      ),
      // If the updated task is currently selected, update selectedTask as well
      selectedTask:
        get().selectedTask?.taskId === taskId
          ? { ...get().selectedTask!, ...updated }
          : get().selectedTask,
    }));
  },

  // Delete a task by ID
  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.taskId !== taskId),
      // Deselect if the deleted task was selected
      selectedTask:
        state.selectedTask?.taskId === taskId ? null : state.selectedTask,
    }));
  },

  // Select a task
  selectTask: (task) => set({ selectedTask: task }),

  // Clear all tasks and selected task
  clearTasks: () => set({ tasks: [], selectedTask: null }),
}));
