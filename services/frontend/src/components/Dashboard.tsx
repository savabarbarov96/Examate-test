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
    <div className="w-full max-w-sm md:max-w-7xl flex flex-col gap-6">
      {/* Session Overview Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Session Overview</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-48" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Last login:</span>
                <span className="font-medium">{formatLastLogin(lastLogin)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <StatusDot variant="success" />
                <span className="text-muted-foreground">Current active users:</span>
                <span className="font-medium">{activeSessions}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Widgets Grid with Drag and Drop */}
      {!loading && widgets.length > 0 && (
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
      )}

      {/* Empty State */}
      {!loading && widgets.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <img
            src={FullLogo}
            alt="ExaMate Logo"
            className="h-16 w-auto opacity-50"
          />
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No widgets added to the Dashboard.</p>
            <p className="text-sm text-muted-foreground">
              You can add new graphs from the Statistics menu.
            </p>
          </div>
        </div>
      )}

      {/* Temporary logout button - remove this when navigation is implemented */}
      <button
        onClick={handleLogout}
        className="self-end bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
      >
        Logout
      </button>
    </div>
  );
}
