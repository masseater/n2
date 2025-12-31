/**
 * タスク feature 固有の型定義
 * 共通型は @n2/shared から import
 */
export type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskWithRelations,
  ArchivedTask,
  TaskFilter,
  Status,
  StatusType,
  CreateStatusInput,
  Tag,
  CreateTagInput,
} from "@n2/shared";

/**
 * タスク移動操作の入力型
 */
export type MoveTaskInput = {
  taskId: string;
  newParentId: string | null;
  newPosition: number;
};

/**
 * タスク階層ツリーのノード
 */
export type TaskTreeNode = {
  id: string;
  title: string;
  statusId: string;
  parentId: string | null;
  path: string;
  position: number;
  children: TaskTreeNode[];
  depth: number;
};

/**
 * ドラッグ&ドロップイベントのデータ
 */
export type TaskDragData = {
  taskId: string;
  parentId: string | null;
  position: number;
};
