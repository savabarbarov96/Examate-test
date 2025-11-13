import { useState, useRef, useEffect } from "react";
import { X, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DashboardWidget, WidgetData } from "@/utils/dashboard/types";
import { HorizontalBarChart, PieChart } from "@/components/dashboard/charts";
import { getStubDataForWidget } from "@/utils/dashboard/stubData";
import { getWidgetData } from "@/utils/dashboard/api";

interface WidgetCardProps {
  widget: DashboardWidget;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleLegend: (id: string, legendKey: string) => Promise<void>;
  isDragging?: boolean;
}

export default function WidgetCard({
  widget,
  onRename,
  onDelete,
  onToggleLegend,
  isDragging = false,
}: WidgetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(widget.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [legendState, setLegendState] = useState<Record<string, boolean>>(
    widget.legendVisibility || {}
  );
  const [dataLoading, setDataLoading] = useState(true);
  const [chartData, setChartData] = useState<WidgetData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local legend state in sync with server updates
  useEffect(() => {
    setLegendState(widget.legendVisibility || {});
  }, [widget.legendVisibility]);

  useEffect(() => {
    setEditedTitle(widget.title);
  }, [widget.title]);

  // Fetch widget data (falls back to stubbed data on error)
  useEffect(() => {
    let isMounted = true;
    setDataLoading(true);

    getWidgetData(widget.id)
      .then((data) => {
        if (isMounted) {
          setChartData(data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch widget data:", error);
        if (isMounted) {
          setChartData(getStubDataForWidget(widget.type));
        }
      })
      .finally(() => {
        if (isMounted) {
          setDataLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [widget.id, widget.type]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const resolvedData: WidgetData = chartData || getStubDataForWidget(widget.type);
  const legendKeys = legendState;

  const handleSaveTitle = async () => {
    const sanitizedTitle = editedTitle.trim();

    if (!sanitizedTitle) {
      setEditedTitle(widget.title);
      setIsEditing(false);
      return;
    }

    if (sanitizedTitle !== widget.title) {
      try {
        await onRename(widget.id, sanitizedTitle);
      } catch (error) {
        console.error("Failed to rename widget:", error);
        setEditedTitle(widget.title);
      }
    }

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setEditedTitle(widget.title);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(widget.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete widget:", error);
      setIsDeleting(false);
    }
  };

  const handleLegendToggle = async (key: string) => {
    const nextLegend = {
      ...legendKeys,
      [key]: legendKeys[key] === false ? true : false,
    };

    setLegendState(nextLegend);

    try {
      await onToggleLegend(widget.id, key);
    } catch (error) {
      console.error("Failed to update legend:", error);
      setLegendState(widget.legendVisibility || {});
    }
  };

  const isBarChart = widget.type === "activeAll" || widget.type === "historyAll";
  const isPassFail = widget.type === "passFail";
  const isDoughnut = ["paidUnpaid", "location", "proctoredOffline"].includes(widget.type);

  return (
    <>
      <Card
        className={`relative transition-shadow ${
          isDragging ? "shadow-xl opacity-50" : "hover:shadow-md"
        }`}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Drag handle */}
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
              <GripVertical className="h-5 w-5" />
            </div>

            {/* Editable title */}
            {isEditing ? (
              <Input
                ref={inputRef}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                className="h-8 text-base font-semibold"
                maxLength={50}
              />
            ) : (
              <h3
                className="text-base font-semibold cursor-pointer hover:text-primary transition-colors truncate"
                onClick={() => setIsEditing(true)}
                title={widget.title}
              >
                {widget.title}
              </h3>
            )}
          </div>

          {/* Delete button */}
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-sm hover:bg-destructive/10"
            aria-label="Delete widget"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <CardContent>
          <div className="h-64 w-full">
            {dataLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Loading data...
              </div>
            ) : isBarChart && resolvedData.data && resolvedData.series ? (
              <HorizontalBarChart
                data={resolvedData.data}
                series={resolvedData.series}
                legendKeys={legendKeys}
                onLegendToggle={handleLegendToggle}
              />
            ) : resolvedData.segments ? (
              <PieChart
                segments={resolvedData.segments}
                legendKeys={legendKeys}
                onLegendToggle={handleLegendToggle}
                isDoughnut={isDoughnut}
                showPercentage={isPassFail}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  No data available
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Widget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{widget.title}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
