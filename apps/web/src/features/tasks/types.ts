/**
 * タスク feature 固有の型定義
 * 共通型は @n2/shared から import
 */
export type {
  CreateStatusInput,
  CreateTagInput,
  CreateTaskInput,
  Status,
  StatusType,
  Tag,
  TaskFilter,
  TaskWithRelations,
  UpdateTaskInput,
} from "@n2/shared";

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
