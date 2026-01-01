/**
 * API アクション
 * サーバーとの通信とストア更新を統合
 */

import type {
  CreateTaskInput,
  DailyReportWithTasks,
  Status,
  Tag,
  TaskWithRelations,
  UpdateTaskInput,
} from "@n2/shared";
import { appActions, dailyReportActions } from "./app-store";

const API = {
  tasks: "/api/tasks",
  statuses: "/api/statuses",
  tags: "/api/tags",
  dailyReports: "/api/daily-reports",
} as const;

/**
 * タスク関連のAPIアクション
 */
export const taskApi = {
  /** タスク一覧を取得してストアに反映 */
  async fetchAll(): Promise<TaskWithRelations[]> {
    appActions.setLoading("tasks", true);
    try {
      const res = await fetch(`${API.tasks}/`);
      if (!res.ok) throw new Error("タスクの取得に失敗しました");
      const tasks: TaskWithRelations[] = await res.json();
      appActions.setTasks(tasks);
      return tasks;
    } finally {
      appActions.setLoading("tasks", false);
    }
  },

  /** タスクを作成 */
  async create(input: CreateTaskInput): Promise<TaskWithRelations> {
    const res = await fetch(`${API.tasks}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("タスクの作成に失敗しました");
    const task: TaskWithRelations = await res.json();
    await this.fetchAll();
    return task;
  },

  /** タスクを更新 */
  async update(taskId: string, input: UpdateTaskInput): Promise<TaskWithRelations> {
    const res = await fetch(`${API.tasks}/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("タスクの更新に失敗しました");
    const task: TaskWithRelations = await res.json();
    await this.fetchAll();
    return task;
  },

  /** タスクを削除（アーカイブ） */
  async delete(taskId: string): Promise<void> {
    const res = await fetch(`${API.tasks}/${taskId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("タスクの削除に失敗しました");
    appActions.setSelectedTask(null);
    await this.fetchAll();
  },

  /** ステータスを変更 */
  async updateStatus(taskId: string, statusId: string): Promise<void> {
    await this.update(taskId, { statusId });
  },
};

/**
 * ステータス関連のAPIアクション
 */
const statusApi = {
  /** ステータス一覧を取得してストアに反映 */
  async fetchAll(): Promise<Status[]> {
    appActions.setLoading("statuses", true);
    try {
      const res = await fetch(`${API.statuses}/`);
      if (!res.ok) throw new Error("ステータスの取得に失敗しました");
      const statuses: Status[] = await res.json();
      appActions.setStatuses(statuses);
      return statuses;
    } finally {
      appActions.setLoading("statuses", false);
    }
  },
};

/**
 * タグ関連のAPIアクション
 */
const tagApi = {
  /** タグ一覧を取得してストアに反映 */
  async fetchAll(): Promise<Tag[]> {
    appActions.setLoading("tags", true);
    try {
      const res = await fetch(`${API.tags}/`);
      if (!res.ok) throw new Error("タグの取得に失敗しました");
      const tags: Tag[] = await res.json();
      appActions.setTags(tags);
      return tags;
    } finally {
      appActions.setLoading("tags", false);
    }
  },
};

/**
 * 日報関連のAPIアクション
 */
export const dailyReportApi = {
  /** 特定日の日報を取得 */
  async fetchByDate(date: string): Promise<DailyReportWithTasks> {
    const res = await fetch(`${API.dailyReports}/${date}`);
    if (!res.ok) throw new Error("日報の取得に失敗しました");
    const report: DailyReportWithTasks = await res.json();
    dailyReportActions.setCurrentReport(report);
    return report;
  },

  /** 日付範囲の日報を取得 */
  async fetchRange(from: string, to: string): Promise<DailyReportWithTasks[]> {
    const res = await fetch(`${API.dailyReports}/?from=${from}&to=${to}`);
    if (!res.ok) throw new Error("日報の取得に失敗しました");
    return res.json();
  },

  /** 週間日報を取得 */
  async fetchWeekly(from: string, to: string): Promise<DailyReportWithTasks[]> {
    const reports = await this.fetchRange(from, to);
    dailyReportActions.setWeeklyReports(reports);
    return reports;
  },

  /** 月間日報を取得 */
  async fetchMonthly(from: string, to: string): Promise<DailyReportWithTasks[]> {
    const reports = await this.fetchRange(from, to);
    dailyReportActions.setMonthlyReports(reports);
    return reports;
  },

  /** 日報メモを更新 */
  async updateNotes(date: string, notes: string): Promise<void> {
    const res = await fetch(`${API.dailyReports}/${date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) throw new Error("日報の更新に失敗しました");
    await this.fetchByDate(date);
  },

  /** タスクノートを更新 */
  async updateTaskNote(
    date: string,
    taskId: string,
    field: "yesterdayNote" | "todayNote",
    value: string | null,
  ): Promise<void> {
    const res = await fetch(`${API.dailyReports}/${date}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, field, value }),
    });
    if (!res.ok) throw new Error("タスクノートの更新に失敗しました");
    await this.fetchByDate(date);
  },

  /** 次のステータスを更新 */
  async updateNextStatus(date: string, taskId: string, nextStatusId: string | null): Promise<void> {
    const res = await fetch(`${API.dailyReports}/${date}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, field: "nextStatus", value: nextStatusId }),
    });
    if (!res.ok) throw new Error("次のステータスの更新に失敗しました");
    await this.fetchByDate(date);
  },
};

/**
 * 初期データを一括取得
 */
export async function initializeAppData(): Promise<void> {
  await Promise.all([taskApi.fetchAll(), statusApi.fetchAll(), tagApi.fetchAll()]);
}
