/**
 * 日報ページ（日付指定）
 * 日報・週報・月報の表示を切り替え可能
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDateToString,
  getMonthEnd,
  getMonthStart,
  getWeekEnd,
  getWeekStart,
  parseDateString,
} from "@/lib/date";
import { dailyReportApi, initializeAppData, taskApi } from "@/stores/api-actions";
import { appActions, appStore, dailyReportActions, dailyReportStore } from "@/stores/app-store";
import { DailyReportView } from "../-components/daily-report-view";
import { MonthlyReportView } from "../-components/monthly-report-view";
import type { ReportGranularity } from "../-components/report-granularity-switcher";
import { TaskDetailDialog } from "../-components/task-detail-dialog";
import { TaskDialog } from "../-components/task-dialog";
import { ViewSwitcher } from "../-components/view-switcher";
import { WeeklyReportView } from "../-components/weekly-report-view";

export const Route = createFileRoute("/daily/$date")({
  component: DailyPage,
});

function DailyPage() {
  const { date } = Route.useParams();
  const navigate = useNavigate();

  const statuses = useStore(appStore, (s) => s.statuses);
  const tags = useStore(appStore, (s) => s.tags);
  const selectedTask = useStore(appStore, (s) => s.selectedTask);
  const loading = useStore(appStore, (s) => s.loading.tasks);

  const currentReport = useStore(dailyReportStore, (s) => s.currentReport);
  const weeklyReports = useStore(dailyReportStore, (s) => s.weeklyReports);
  const monthlyReports = useStore(dailyReportStore, (s) => s.monthlyReports);
  const granularity = useStore(dailyReportStore, (s) => s.granularity);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const selectedDate = parseDateString(date);

  useEffect(() => {
    initializeAppData();
  }, []);

  useEffect(() => {
    const parsedDate = parseDateString(date);
    if (granularity === "day") {
      dailyReportApi.fetchByDate(date);
    } else if (granularity === "week") {
      const weekStart = getWeekStart(parsedDate);
      const weekEnd = getWeekEnd(parsedDate);
      dailyReportApi.fetchWeekly(formatDateToString(weekStart), formatDateToString(weekEnd));
    } else if (granularity === "month") {
      const monthStart = getMonthStart(parsedDate);
      const monthEnd = getMonthEnd(parsedDate);
      dailyReportApi.fetchMonthly(formatDateToString(monthStart), formatDateToString(monthEnd));
    }
  }, [date, granularity]);

  const handleDateChange = (newDate: Date) => {
    navigate({
      to: "/daily/$date",
      params: { date: formatDateToString(newDate) },
    });
  };

  const handleGranularityChange = (newGranularity: ReportGranularity) => {
    dailyReportActions.setGranularity(newGranularity);
  };

  const handleDayClick = (clickedDate: Date) => {
    dailyReportActions.setGranularity("day");
    navigate({
      to: "/daily/$date",
      params: { date: formatDateToString(clickedDate) },
    });
  };

  const handleMonthChange = (newDate: Date) => {
    navigate({
      to: "/daily/$date",
      params: { date: formatDateToString(newDate) },
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">NippoNikki</h1>
          <p className="text-muted-foreground mt-1">日報ビュー</p>
        </div>
        <div className="flex items-center gap-4">
          <ViewSwitcher currentPath={`/daily/${date}`} />
          <Button onClick={() => setTaskDialogOpen(true)}>新規タスク</Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {granularity === "day" && currentReport && (
            <DailyReportView
              report={currentReport}
              statuses={statuses}
              tags={tags}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              granularity={granularity}
              onGranularityChange={handleGranularityChange}
              onNotesChange={async (notes) => {
                await dailyReportApi.updateNotes(date, notes);
              }}
              onTaskNoteChange={async (taskId, field, value) => {
                await dailyReportApi.updateTaskNote(date, taskId, field, value);
              }}
              onTaskUpdate={async (taskId, input) => {
                await taskApi.update(taskId, input);
                await dailyReportApi.fetchByDate(date);
              }}
              onNextStatusChange={async (taskId, nextStatusId) => {
                await dailyReportApi.updateNextStatus(date, taskId, nextStatusId);
              }}
              onAddTask={() => setTaskDialogOpen(true)}
            />
          )}

          {granularity === "day" && !currentReport && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">日報を読み込み中...</p>
              </CardContent>
            </Card>
          )}

          {granularity === "week" && (
            <WeeklyReportView
              weekStart={getWeekStart(selectedDate)}
              reports={weeklyReports}
              onDayClick={handleDayClick}
              onTaskClick={appActions.setSelectedTask}
            />
          )}

          {granularity === "month" && (
            <MonthlyReportView
              month={selectedDate}
              reports={monthlyReports}
              onDayClick={handleDayClick}
              onMonthChange={handleMonthChange}
            />
          )}
        </>
      )}

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={async (input) => {
          await taskApi.create(input);
          await dailyReportApi.fetchByDate(date);
          setTaskDialogOpen(false);
        }}
        statuses={statuses}
        tags={tags}
      />

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(open) => {
          if (!open) appActions.setSelectedTask(null);
        }}
        onUpdate={async (input) => {
          if (selectedTask) {
            await taskApi.update(selectedTask.id, input);
            await dailyReportApi.fetchByDate(date);
          }
        }}
        onDelete={async () => {
          if (selectedTask) {
            await taskApi.delete(selectedTask.id);
            await dailyReportApi.fetchByDate(date);
          }
        }}
        statuses={statuses}
        tags={tags}
      />
    </div>
  );
}
