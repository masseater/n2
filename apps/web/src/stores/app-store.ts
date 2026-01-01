/**
 * アプリケーション全体の状態管理ストア
 * TanStack Store を使用してサーバー状態とUI状態を統合管理
 */

import type { DailyReportWithTasks, Status, Tag, TaskWithRelations } from "@n2/shared";
import { Store } from "@tanstack/react-store";

/**
 * アプリケーション状態の型定義
 */
type AppState = {
  /** タスク一覧 */
  tasks: TaskWithRelations[];
  /** ステータス一覧 */
  statuses: Status[];
  /** タグ一覧 */
  tags: Tag[];
  /** 選択中のタスク（詳細ダイアログ用） */
  selectedTask: TaskWithRelations | null;
  /** ローディング状態 */
  loading: {
    tasks: boolean;
    statuses: boolean;
    tags: boolean;
  };
};

/**
 * 初期状態
 */
const initialState: AppState = {
  tasks: [],
  statuses: [],
  tags: [],
  selectedTask: null,
  loading: {
    tasks: false,
    statuses: false,
    tags: false,
  },
};

/**
 * アプリケーションストア
 */
export const appStore = new Store<AppState>(initialState);

/**
 * ストア操作アクション
 */
export const appActions = {
  /** タスク一覧を設定 */
  setTasks: (tasks: TaskWithRelations[]) => {
    appStore.setState((state) => ({ ...state, tasks }));
  },

  /** ステータス一覧を設定 */
  setStatuses: (statuses: Status[]) => {
    appStore.setState((state) => ({ ...state, statuses }));
  },

  /** タグ一覧を設定 */
  setTags: (tags: Tag[]) => {
    appStore.setState((state) => ({ ...state, tags }));
  },

  /** 選択中のタスクを設定 */
  setSelectedTask: (task: TaskWithRelations | null) => {
    appStore.setState((state) => ({ ...state, selectedTask: task }));
  },

  /** ローディング状態を設定 */
  setLoading: (key: keyof AppState["loading"], value: boolean) => {
    appStore.setState((state) => ({
      ...state,
      loading: { ...state.loading, [key]: value },
    }));
  },

  /** 特定タイプのステータスを取得 */
  findStatusByType: (type: Status["type"]): Status | undefined => {
    return appStore.state.statuses.find((s) => s.type === type);
  },

  /** ルートタスクのみ取得 */
  getRootTasks: (): TaskWithRelations[] => {
    return appStore.state.tasks.filter((t) => !t.parentId);
  },
};

/**
 * 日報状態の型定義
 */
type DailyReportState = {
  /** 現在表示中の日報 */
  currentReport: DailyReportWithTasks | null;
  /** 週間日報 */
  weeklyReports: DailyReportWithTasks[];
  /** 月間日報 */
  monthlyReports: DailyReportWithTasks[];
  /** レポート粒度 */
  granularity: "day" | "week" | "month";
};

/**
 * 日報ストア
 */
export const dailyReportStore = new Store<DailyReportState>({
  currentReport: null,
  weeklyReports: [],
  monthlyReports: [],
  granularity: "day",
});

/**
 * 日報ストア操作アクション
 */
export const dailyReportActions = {
  /** 現在の日報を設定 */
  setCurrentReport: (report: DailyReportWithTasks | null) => {
    dailyReportStore.setState((state) => ({ ...state, currentReport: report }));
  },

  /** 週間日報を設定 */
  setWeeklyReports: (reports: DailyReportWithTasks[]) => {
    dailyReportStore.setState((state) => ({ ...state, weeklyReports: reports }));
  },

  /** 月間日報を設定 */
  setMonthlyReports: (reports: DailyReportWithTasks[]) => {
    dailyReportStore.setState((state) => ({ ...state, monthlyReports: reports }));
  },

  /** レポート粒度を設定 */
  setGranularity: (granularity: DailyReportState["granularity"]) => {
    dailyReportStore.setState((state) => ({ ...state, granularity }));
  },
};
