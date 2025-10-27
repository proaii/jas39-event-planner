import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, FileText, Layout, Plus } from "lucide-react";

interface WelcomeHeaderProps {
  currentUser: string;
  onCreateEvent: () => void;
  onCreateFromTemplate?: () => void;
}

export function WelcomeHeader({
  currentUser,
  onCreateEvent,
  onCreateFromTemplate,
}: WelcomeHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-foreground mb-2">
          Welcome back, {currentUser.split(" ")[0]}! 👋
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {}}
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          <Layout className="w-4 h-4 mr-2" />
          Customize Dashboard
        </Button>

        {/* Split Button for Create Event */}
        <div className="flex items-center shadow-lg rounded-lg overflow-hidden">
          <Button
            onClick={onCreateEvent}
            className="bg-primary hover:bg-primary/90 rounded-r-none border-r border-primary-foreground/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-primary hover:bg-primary/90 rounded-l-none px-2"
                aria-label="More options"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onCreateFromTemplate} className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Create from Template...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
