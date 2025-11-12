// src/stores/task-store.ts
import { create } from "zustand";
import {
  Task,
  TaskStatus,
  TaskPriority,
  Subtask,
  Attachment,
  UserLite,
} from "@/lib/types";

interface TaskStore {
  tasks: Task[];
  selectedTask: Task | null;

  // CRUD operations
  addTask: (task: Omit<Task, "taskId" | "createdAt">) => void;
  updateTask: (
    taskId: string,
    updated: Partial<Omit<Task, "taskId" | "createdAt">>
  ) => void;
  deleteTask: (taskId: string) => void;

  // selection
  selectTask: (task: Task | null) => void;

  // helper
  clearTasks: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTask: null,

  addTask: (newTaskData) => {
    const newTask: Task = {
      taskId: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...newTaskData,
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: (taskId, updated) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.taskId === taskId ? { ...t, ...updated } : t
      ),
      selectedTask:
        get().selectedTask?.taskId === taskId
          ? { ...get().selectedTask!, ...updated }
          : get().selectedTask,
    }));
  },

  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.taskId !== taskId),
      selectedTask:
        state.selectedTask?.taskId === taskId ? null : state.selectedTask,
    }));
  },

  selectTask: (task) => set({ selectedTask: task }),

  clearTasks: () => set({ tasks: [], selectedTask: null }),
}));
