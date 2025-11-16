import { logout } from "@/utils/auth/helpers";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatLastLogin } from "@/utils/dateFormat";
import FullLogo from "@/assets/full_logo.svg";
import WidgetCard from "@/components/dashboard/WidgetCard";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { setStatus } = useAuth();
  const { lastLogin, activeSessions, widgets, loading, actions } = useDashboard();

  const handleLogout = async () => {
    try {
      await logout();
      setStatus("unauthenticated");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleRename = async (id: string, name: string) => {
    try {
      await actions.rename(id, name);
      toast.success("Widget renamed successfully");
    } catch (error) {
      toast.error("Failed to rename widget");
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await actions.delete(id);
      toast.success("The widget was successfully deleted.");
    } catch (error) {
      toast.error("Failed to delete widget");
      throw error;
    }
  };

  const handleToggleLegend = async (id: string, legendKey: string) => {
    try {
      await actions.toggleLegend(id, legendKey);
    } catch (error) {
      toast.error("Failed to update widget configuration");
      throw error;
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Reorder widgets array
    const reorderedWidgets = Array.from(widgets);
    const [movedWidget] = reorderedWidgets.splice(sourceIndex, 1);
    reorderedWidgets.splice(destinationIndex, 0, movedWidget);

    // Extract IDs in new order
    const widgetIds = reorderedWidgets.map((w) => w.id);

    try {
      await actions.reorder(widgetIds);
      toast.success("Widget order updated");
    } catch (error) {
      toast.error("Failed to reorder widgets");
      console.error("Failed to reorder widgets:", error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {/* Welcome Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-5xl md:text-6xl font-display text-primary mb-2">
          Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome back to your academic overview
        </p>
      </div>

      {/* Session Overview Card */}
      <Card className="glass-effect border-2 animate-fade-in-up delay-100">
        <CardHeader>
          <h2 className="text-2xl font-display text-primary">Session Overview</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-48" />
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  Last Login
                </div>
                <div className="text-2xl font-display text-primary">
                  {formatLastLogin(lastLogin)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <StatusDot variant="success" />
                  Active Users
                </div>
                <div className="text-2xl font-display text-primary">
                  {activeSessions}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Widgets Grid with Drag and Drop */}
      {!loading && widgets.length > 0 && (
        <div className="animate-fade-in-up delay-200">
          <div className="mb-4">
            <h2 className="text-3xl font-display text-primary">Analytics Widgets</h2>
            <p className="text-muted-foreground">Drag to reorder your custom statistics</p>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets-grid" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`animate-scale-in delay-${Math.min((index + 3) * 100, 600)}`}
                        >
                          <WidgetCard
                            widget={widget}
                            onRename={handleRename}
                            onDelete={handleDelete}
                            onToggleLegend={handleToggleLegend}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Empty State */}
      {!loading && widgets.length === 0 && (
        <Card className="glass-effect border-2 animate-fade-in-up delay-300">
          <CardContent className="flex flex-col items-center justify-center gap-6 py-16">
            <div className="p-4 rounded-full bg-primary/10">
              <img
                src={FullLogo}
                alt="ExaMate Logo"
                className="h-16 w-auto opacity-70"
              />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-display text-primary">No Widgets Yet</h3>
              <p className="text-muted-foreground max-w-md">
                Your dashboard is empty. Add custom analytics widgets from the Statistics menu to visualize your data.
              </p>
            </div>
            <button
              onClick={() => navigate('/statistics')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover-glow transition-all duration-300 font-medium"
            >
              Go to Statistics
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
