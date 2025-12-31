import { useMemo } from "react";
import type { TaskWithRelations, TaskTreeNode } from "../types";

/**
 * フラットなタスク配列をツリー構造に変換するフック
 *
 * @param tasks - タスク配列
 * @returns ツリー構造のタスクノード配列
 *
 * 使用例:
 * ```tsx
 * const { data: tasks } = useTasks();
 * const tree = useTaskTree(tasks ?? []);
 * ```
 */
export function useTaskTree(tasks: TaskWithRelations[]): TaskTreeNode[] {
  return useMemo(() => buildTaskTree(tasks), [tasks]);
}

/**
 * フラットなタスク配列をツリー構造に変換
 *
 * @param tasks - タスク配列
 * @returns ツリー構造のタスクノード配列
 */
function buildTaskTree(tasks: TaskWithRelations[]): TaskTreeNode[] {
  const taskMap = new Map<string, TaskTreeNode>();
  const rootNodes: TaskTreeNode[] = [];

  // まず全タスクをマップに登録
  for (const task of tasks) {
    taskMap.set(task.id, {
      id: task.id,
      title: task.title,
      statusId: task.statusId,
      parentId: task.parentId,
      path: task.path,
      position: task.position,
      children: [],
      depth: task.path ? task.path.split("/").filter(Boolean).length : 0,
    });
  }

  // 親子関係を構築
  for (const task of tasks) {
    const node = taskMap.get(task.id);
    if (!node) continue;

    if (task.parentId) {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  }

  // 各レベルで position でソート
  const sortByPosition = (nodes: TaskTreeNode[]) => {
    nodes.sort((a, b) => a.position - b.position);
    for (const node of nodes) {
      sortByPosition(node.children);
    }
  };
  sortByPosition(rootNodes);

  return rootNodes;
}

/**
 * ツリーをフラットな配列に展開（DFS順）
 *
 * @param tree - ツリー構造のタスクノード配列
 * @returns フラットなタスクノード配列
 */
export function flattenTaskTree(tree: TaskTreeNode[]): TaskTreeNode[] {
  const result: TaskTreeNode[] = [];

  const traverse = (nodes: TaskTreeNode[]) => {
    for (const node of nodes) {
      result.push(node);
      traverse(node.children);
    }
  };

  traverse(tree);
  return result;
}
