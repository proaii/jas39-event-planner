'use client'

import { create } from "zustand"
import { Task, Subtask, Attachment, TaskStatus, TaskPriority, UserLite } from "@/lib/types"

interface AddTaskState {
  // Modal state
  isOpen: boolean
  
  // Task form data
  taskData: {
    title: string
    description?: string
    assignees: UserLite[]
    startAt: string | null
    endAt: string | null
    taskStatus: TaskStatus
    taskPriority: TaskPriority
    subtasks: Subtask[]
    attachments: Attachment[]
  }
  
  // UI state
  hasTimePeriod: boolean
  newAttachmentUrl: string
  isPending: boolean
  error: string | null
  
  // Modal actions
  openModal: () => void
  closeModal: () => void
  
  // Form data actions
  setTitle: (title: string) => void
  setDescription: (description: string) => void
  setStartAt: (date: string | null) => void
  setEndAt: (date: string | null) => void
  setTaskStatus: (status: TaskStatus) => void
  setTaskPriority: (priority: TaskPriority) => void
  
  // Assignee actions
  addAssignee: (user: UserLite) => void
  removeAssignee: (userId: string) => void
  setAssignees: (assignees: UserLite[]) => void
  toggleAssignee: (user: UserLite, isPersonal: boolean, currentUserId: string) => void
  
  // Subtask actions
  addSubtask: () => void
  updateSubtask: (index: number, title: string) => void
  removeSubtask: (index: number) => void
  
  // Attachment actions
  addAttachment: () => void
  removeAttachment: (attachmentId: string) => void
  setNewAttachmentUrl: (url: string) => void
  
  // Time period toggle
  setHasTimePeriod: (val: boolean) => void
  
  // Loading & error states
  setIsPending: (val: boolean) => void
  setError: (msg: string | null) => void
  
  // Form validation
  isFormValid: (isPersonal: boolean) => boolean
  
  // Reset
  resetForm: (currentUser: UserLite, isPersonal?: boolean) => void
}

interface EditTaskState {
  // Edit Modal state
  isEditOpen: boolean
  editingTask: Task | null
  
  // Edit form data
  editFormData: {
    title: string
    description?: string
    assignees: UserLite[]
    startAt: string | null
    endAt: string | null
    taskStatus: TaskStatus
    taskPriority: TaskPriority
    subtasks: Subtask[]
    attachments: Attachment[]
  }
  
  // Edit UI state
  editHasTimePeriod: boolean
  editNewAttachmentUrl: string
  isEditPending: boolean
  editError: string | null
  
  // Edit Modal actions
  openEditModal: (task: Task) => void
  closeEditModal: () => void
  
  // Edit Form actions
  setEditTitle: (title: string) => void
  setEditDescription: (description: string) => void
  setEditStartAt: (date: string | null) => void
  setEditEndAt: (date: string | null) => void
  setEditTaskStatus: (status: TaskStatus) => void
  setEditTaskPriority: (priority: TaskPriority) => void
  
  // Edit Assignee actions
  toggleEditAssignee: (user: UserLite) => void
  removeEditAssignee: (userId: string) => void
  
  // Edit Subtask actions
  addEditSubtask: (taskId: string) => void
  updateEditSubtask: (index: number, field: keyof Subtask, value: string) => void
  removeEditSubtask: (index: number) => void
  
  // Edit Attachment actions
  addEditAttachment: (taskId: string) => void
  removeEditAttachment: (attachmentId: string) => void
  setEditNewAttachmentUrl: (url: string) => void
  
  // Edit Time period toggle
  setEditHasTimePeriod: (val: boolean) => void
  
  // Edit Loading & error states
  setEditIsPending: (val: boolean) => void
  setEditError: (msg: string | null) => void
  
  // Edit Form validation
  isEditFormValid: () => boolean
  
  // Reset edit form
  resetEditForm: () => void
}

interface TaskDetailState {
  // Task Detail UI state
  selectedTaskId: string | null
  isDetailLoading: boolean
  detailError: string | null
  
  // Task Detail actions
  setSelectedTaskId: (taskId: string | null) => void
  setDetailLoading: (loading: boolean) => void
  setDetailError: (error: string | null) => void
  clearDetailError: () => void
}

// ✅ เพิ่ม TaskStore interface สำหรับ tasks data
interface TaskStore {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  setTasks: (tasks: Task[]) => void
}

type TasksStoreState = AddTaskState & EditTaskState & TaskDetailState & TaskStore

export const useTasksStore = create<TasksStoreState>()(
  (set, get) => ({
  // ==================== TASK DATA ====================
  tasks: [],
  
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.taskId === taskId ? { ...task, ...updates } : task
      ),
    })),
  
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.taskId !== taskId),
    })),
  
  setTasks: (tasks) => set({ tasks }),

  // ==================== ADD TASK STATE ====================
  isOpen: false,
  taskData: {
    title: "",
    description: "",
    assignees: [],
    startAt: null,
    endAt: null,
    taskStatus: "To Do",
    taskPriority: "Normal",
    subtasks: [],
    attachments: [],
  },
  hasTimePeriod: false,
  newAttachmentUrl: "",
  isPending: false,
  error: null,

  // Add Modal actions
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),

  // Add Form data actions
  setTitle: (title) =>
    set((state) => ({
      taskData: { ...state.taskData, title },
    })),

  setDescription: (description) =>
    set((state) => ({
      taskData: { ...state.taskData, description },
    })),

  setStartAt: (startAt) =>
    set((state) => ({
      taskData: { ...state.taskData, startAt },
    })),

  setEndAt: (endAt) =>
    set((state) => ({
      taskData: { ...state.taskData, endAt },
    })),

  setTaskStatus: (taskStatus) =>
    set((state) => ({
      taskData: { ...state.taskData, taskStatus },
    })),

  setTaskPriority: (taskPriority) =>
    set((state) => ({
      taskData: { ...state.taskData, taskPriority },
    })),

  // Add Assignee actions
  addAssignee: (user) =>
    set((state) => ({
      taskData: {
        ...state.taskData,
        assignees: [...state.taskData.assignees, user],
      },
    })),

  removeAssignee: (userId) =>
    set((state) => ({
      taskData: {
        ...state.taskData,
        assignees: state.taskData.assignees.filter((a) => a.userId !== userId),
      },
    })),

  setAssignees: (assignees) =>
    set((state) => ({
      taskData: { ...state.taskData, assignees },
    })),

  toggleAssignee: (user, isPersonal, currentUserId) =>
    set((state) => {
      const alreadyAssigned = state.taskData.assignees.some(
        (a) => a.userId === user.userId
      )
      
      if (alreadyAssigned) {
        if (isPersonal && user.userId === currentUserId) {
          return state
        }
        return {
          taskData: {
            ...state.taskData,
            assignees: state.taskData.assignees.filter(
              (a) => a.userId !== user.userId
            ),
          },
        }
      } else {
        return {
          taskData: {
            ...state.taskData,
            assignees: [...state.taskData.assignees, user],
          },
        }
      }
    }),

  // Add Subtask actions
  addSubtask: () =>
    set((state) => ({
      taskData: {
        ...state.taskData,
        subtasks: [
          ...state.taskData.subtasks,
          {
            subtaskId: `st_${Date.now()}`,
            title: "",
            subtaskStatus: "To Do",
            taskId: "",
          },
        ],
      },
    })),

  updateSubtask: (index, title) =>
    set((state) => ({
      taskData: {
        ...state.taskData,
        subtasks: state.taskData.subtasks.map((st, i) =>
          i === index ? { ...st, title } : st
        ),
      },
    })),

  removeSubtask: (index) =>
    set((state) => ({
      taskData: {
        ...state.taskData,
        subtasks: state.taskData.subtasks.filter((_, i) => i !== index),
      },
    })),

  // Add Attachment actions
  addAttachment: () => {
    const state = get()
    const url = state.newAttachmentUrl.trim()
    if (!url) return

    set((state) => ({
      taskData: {
        ...state.taskData,
        attachments: [
          ...state.taskData.attachments,
          {
            attachmentId: `att_${Date.now()}`,
            attachmentUrl: url,
            taskId: "",
          },
        ],
      },
      newAttachmentUrl: "",
    }))
  },

  removeAttachment: (attachmentId) =>
    set((state) => ({
      taskData: {
        ...state.taskData,
        attachments: state.taskData.attachments.filter(
          (att) => att.attachmentId !== attachmentId
        ),
      },
    })),

  setNewAttachmentUrl: (url) => set({ newAttachmentUrl: url }),

  // Add Time period toggle
  setHasTimePeriod: (val) =>
    set((state) => ({
      hasTimePeriod: val,
      taskData: val ? state.taskData : { ...state.taskData, startAt: null },
    })),

  // Add Loading & error states
  setIsPending: (val) => set({ isPending: val }),
  setError: (msg) => set({ error: msg }),

  // Add Form validation
  isFormValid: (isPersonal) => {
    const state = get()
    const { taskData, hasTimePeriod } = state

    if (!taskData.title.trim()) return false
    if (!taskData.taskPriority || !taskData.taskStatus) return false
    if (!isPersonal && taskData.assignees.length === 0) return false
    
    if (hasTimePeriod) {
      if (!taskData.startAt || !taskData.endAt) return false
    } else {
      if (!taskData.endAt) return false
    }
    
    return true
  },

  // Add Reset form
  resetForm: (currentUser, isPersonal = false) =>
    set({
      taskData: {
        title: "",
        description: "",
        assignees: isPersonal ? [currentUser] : [],
        startAt: null,
        endAt: null,
        taskStatus: "To Do",
        taskPriority: "Normal",
        subtasks: [],
        attachments: [],
      },
      hasTimePeriod: false,
      newAttachmentUrl: "",
      error: null,
      isPending: false,
    }),

  // ==================== EDIT TASK STATE ====================
  isEditOpen: false,
  editingTask: null,
  editFormData: {
    title: "",
    description: "",
    assignees: [],
    startAt: null,
    endAt: null,
    taskStatus: "To Do",
    taskPriority: "Normal",
    subtasks: [],
    attachments: [],
  },
  editHasTimePeriod: false,
  editNewAttachmentUrl: "",
  isEditPending: false,
  editError: null,

  // Edit Modal actions
  openEditModal: (task) =>
    set({
      isEditOpen: true,
      editingTask: task,
      editFormData: {
        title: task.title,
        description: task.description || "",
        assignees: task.assignees || [],
        startAt: task.startAt || null,
        endAt: task.endAt || null,
        taskStatus: task.taskStatus,
        taskPriority: task.taskPriority,
        subtasks: task.subtasks || [],
        attachments: task.attachments || [],
      },
      editHasTimePeriod: !!(task.startAt || task.endAt),
      editNewAttachmentUrl: "",
      editError: null,
    }),

  closeEditModal: () =>
    set({
      isEditOpen: false,
      editingTask: null,
      editError: null,
    }),

  // Edit Form actions
  setEditTitle: (title) =>
    set((state) => ({
      editFormData: { ...state.editFormData, title },
    })),

  setEditDescription: (description) =>
    set((state) => ({
      editFormData: { ...state.editFormData, description },
    })),

  setEditStartAt: (startAt) =>
    set((state) => ({
      editFormData: { ...state.editFormData, startAt },
    })),

  setEditEndAt: (endAt) =>
    set((state) => ({
      editFormData: { ...state.editFormData, endAt },
    })),

  setEditTaskStatus: (taskStatus) =>
    set((state) => ({
      editFormData: { ...state.editFormData, taskStatus },
    })),

  setEditTaskPriority: (taskPriority) =>
    set((state) => ({
      editFormData: { ...state.editFormData, taskPriority },
    })),

  // Edit Assignee actions
  toggleEditAssignee: (user) =>
    set((state) => {
      const alreadyAssigned = state.editFormData.assignees.some(
        (a) => a.userId === user.userId
      )
      
      return {
        editFormData: {
          ...state.editFormData,
          assignees: alreadyAssigned
            ? state.editFormData.assignees.filter((a) => a.userId !== user.userId)
            : [...state.editFormData.assignees, user],
        },
      }
    }),

  removeEditAssignee: (userId) =>
    set((state) => ({
      editFormData: {
        ...state.editFormData,
        assignees: state.editFormData.assignees.filter((a) => a.userId !== userId),
      },
    })),

  // Edit Subtask actions
  addEditSubtask: (taskId) =>
    set((state) => ({
      editFormData: {
        ...state.editFormData,
        subtasks: [
          ...state.editFormData.subtasks,
          {
            subtaskId: `st_${Date.now()}`,
            taskId,
            title: "",
            subtaskStatus: "To Do",
          },
        ],
      },
    })),

  updateEditSubtask: (index, field, value) =>
    set((state) => ({
      editFormData: {
        ...state.editFormData,
        subtasks: state.editFormData.subtasks.map((st, i) =>
          i === index ? { ...st, [field]: value } : st
        ),
      },
    })),

  removeEditSubtask: (index) =>
    set((state) => ({
      editFormData: {
        ...state.editFormData,
        subtasks: state.editFormData.subtasks.filter((_, i) => i !== index),
      },
    })),

  // Edit Attachment actions
  addEditAttachment: (taskId) => {
    const state = get()
    const url = state.editNewAttachmentUrl.trim()
    if (!url) return

    set((state) => ({
      editFormData: {
        ...state.editFormData,
        attachments: [
          ...state.editFormData.attachments,
          {
            attachmentId: `att_${Date.now()}`,
            taskId,
            attachmentUrl: url,
          },
        ],
      },
      editNewAttachmentUrl: "",
    }))
  },

  removeEditAttachment: (attachmentId) =>
    set((state) => ({
      editFormData: {
        ...state.editFormData,
        attachments: state.editFormData.attachments.filter(
          (att) => att.attachmentId !== attachmentId
        ),
      },
    })),

  setEditNewAttachmentUrl: (url) => set({ editNewAttachmentUrl: url }),

  // Edit Time period toggle
  setEditHasTimePeriod: (val) =>
    set((state) => ({
      editHasTimePeriod: val,
      editFormData: val
        ? state.editFormData
        : { ...state.editFormData, startAt: null },
    })),

  // Edit Loading & error states
  setEditIsPending: (val) => set({ isEditPending: val }),
  setEditError: (msg) => set({ editError: msg }),

  // Edit Form validation
  isEditFormValid: () => {
    const state = get()
    const { editFormData, editHasTimePeriod } = state

    if (!editFormData.title.trim()) return false
    if (!editFormData.taskPriority || !editFormData.taskStatus) return false

    if (editHasTimePeriod) {
      if (!editFormData.startAt || !editFormData.endAt) return false
      if (editFormData.startAt > editFormData.endAt) return false
    } else {
      if (!editFormData.endAt) return false
    }

    return true
  },

  // Reset edit form
  resetEditForm: () =>
    set({
      editFormData: {
        title: "",
        description: "",
        assignees: [],
        startAt: null,
        endAt: null,
        taskStatus: "To Do",
        taskPriority: "Normal",
        subtasks: [],
        attachments: [],
      },
      editHasTimePeriod: false,
      editNewAttachmentUrl: "",
      editError: null,
      isEditPending: false,
    }),

  // ==================== TASK DETAIL STATE ====================
  selectedTaskId: null,
  isDetailLoading: false,
  detailError: null,

  // Task Detail actions
  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),
  setDetailLoading: (loading) => set({ isDetailLoading: loading }),
  setDetailError: (error) => set({ detailError: error }),
  clearDetailError: () => set({ detailError: null }),
})
)


export const useTaskStore = useTasksStore