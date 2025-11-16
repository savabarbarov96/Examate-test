import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/auth/label";
import { useDashboard } from "@/hooks/useDashboard";
import { toast } from "sonner";
import type { WidgetType } from "@/utils/dashboard/types";
import { listStatisticsWidgets } from "@/utils/statistics/api";
import {
  BarChart3,
  PieChart,
  MapPin,
  TrendingUp,
  CheckCircle2,
  MonitorCheck,
  Plus,
} from "lucide-react";

interface WidgetTypeConfig {
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ElementType;
  defaultName: string;
  category: "charts" | "analytics";
}

const iconMap: Record<WidgetType, React.ElementType> = {
  activeAll: BarChart3,
  historyAll: TrendingUp,
  paidUnpaid: PieChart,
  location: MapPin,
  passFail: CheckCircle2,
  proctoredOffline: MonitorCheck,
};

const fallbackWidgetCatalog: WidgetTypeConfig[] = [
  {
    type: "activeAll",
    title: "Active Participants",
    description: "Track total participants, proctored, and offline sessions over time",
    icon: BarChart3,
    defaultName: "Active Participants Overview",
    category: "charts",
  },
  {
    type: "historyAll",
    title: "Historical Performance",
    description: "Analyze pass/fail trends across multiple time periods",
    icon: TrendingUp,
    defaultName: "Historical Performance",
    category: "charts",
  },
  {
    type: "paidUnpaid",
    title: "Payment Status",
    description: "Visualize paid vs unpaid exam distribution",
    icon: PieChart,
    defaultName: "Payment Distribution",
    category: "analytics",
  },
  {
    type: "location",
    title: "Geographic Distribution",
    description: "View participant distribution across different regions",
    icon: MapPin,
    defaultName: "Location Analytics",
    category: "analytics",
  },
  {
    type: "passFail",
    title: "Pass/Fail Ratio",
    description: "Monitor overall exam success rates",
    icon: CheckCircle2,
    defaultName: "Pass/Fail Ratio",
    category: "analytics",
  },
  {
    type: "proctoredOffline",
    title: "Proctoring Status",
    description: "Compare proctored vs offline exam sessions",
    icon: MonitorCheck,
    defaultName: "Proctoring Distribution",
    category: "analytics",
  },
];

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { actions } = useDashboard();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<WidgetTypeConfig | null>(null);
  const [customName, setCustomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [widgetCatalog, setWidgetCatalog] = useState<WidgetTypeConfig[]>(fallbackWidgetCatalog);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchCatalog() {
      setCatalogLoading(true);
      try {
        const catalog = await listStatisticsWidgets();
        if (!active) return;

        const enriched = catalog.map<WidgetTypeConfig>((definition) => ({
          ...definition,
          icon: iconMap[definition.type] ?? BarChart3,
        }));

        setWidgetCatalog(enriched);
        setCatalogError(null);
      } catch (error) {
        console.error("Failed to load statistics catalog:", error);
        if (!active) return;
        setCatalogError("Unable to load live statistics catalog. Showing defaults instead.");
        setWidgetCatalog(fallbackWidgetCatalog);
      } finally {
        if (active) {
          setCatalogLoading(false);
        }
      }
    }

    fetchCatalog();
    return () => {
      active = false;
    };
  }, []);

  const handleAddWidget = (widget: WidgetTypeConfig) => {
    setSelectedWidget(widget);
    setCustomName(widget.defaultName);
    setDialogOpen(true);
  };

  const handleConfirmAdd = async () => {
    if (!selectedWidget) return;

    setIsCreating(true);
    try {
      await actions.create(selectedWidget.type, customName || selectedWidget.defaultName);
      toast.success(`${customName || selectedWidget.defaultName} added to dashboard!`);
      setDialogOpen(false);
      setSelectedWidget(null);
      setCustomName("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      toast.error("Failed to add widget. Please try again.");
      console.error("Error adding widget:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const chartWidgets = widgetCatalog.filter((w) => w.category === "charts");
  const analyticsWidgets = widgetCatalog.filter((w) => w.category === "analytics");

  return (
    <div className="min-h-screen bg-scholarly-gradient p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="space-y-3 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-display text-primary">Statistics & Analytics</h1>
          <p className="text-lg text-muted-foreground">
            Add powerful visualizations and insights to your dashboard
          </p>
          {catalogError && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20">{catalogError}</p>
          )}
        </div>

        <div className="space-y-6 animate-fade-in-up delay-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-display text-primary">Charts</h2>
            {catalogLoading && (
              <span className="text-sm text-muted-foreground animate-pulse">Loading...</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chartWidgets.map((widget, index) => {
              const Icon = widget.icon;
              return (
                <Card
                  key={widget.type}
                  className={`manuscript-card hover-glow cursor-pointer group animate-scale-in delay-${Math.min((index + 2) * 100, 600)}`}
                  onClick={() => handleAddWidget(widget)}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          Click to add
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-display text-primary">{widget.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">{widget.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full hover-glow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddWidget(widget);
                      }}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 animate-fade-in-up delay-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20 ring-1 ring-accent/30">
              <PieChart className="h-6 w-6 text-accent-foreground" />
            </div>
            <h2 className="text-3xl font-display text-primary">Analytics</h2>
            {catalogLoading && (
              <span className="text-sm text-muted-foreground animate-pulse">Loading...</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsWidgets.map((widget, index) => {
              const Icon = widget.icon;
              return (
                <Card
                  key={widget.type}
                  className={`ink-accent-card hover-glow cursor-pointer group animate-scale-in delay-${Math.min((index + chartWidgets.length + 2) * 100, 600)}`}
                  onClick={() => handleAddWidget(widget)}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-xl bg-accent/20 text-accent-foreground ring-1 ring-accent/30">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-xs font-semibold">
                          Click to add
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-display text-primary">{widget.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">{widget.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full hover-glow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddWidget(widget);
                      }}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Customize Widget</DialogTitle>
            <DialogDescription>
              Give your widget a custom name or use the default. You can rename it later from the dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="widget-name">Widget Name</Label>
              <Input
                id="widget-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={selectedWidget?.defaultName || "Enter widget name"}
                disabled={isCreating}
              />
            </div>
            {selectedWidget && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                {(() => {
                  const Icon = selectedWidget.icon;
                  return (
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  );
                })()}
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{selectedWidget.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedWidget.description}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedWidget(null);
                setCustomName("");
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmAdd} disabled={isCreating || !customName.trim()}>
              {isCreating ? "Adding..." : "Add Widget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
