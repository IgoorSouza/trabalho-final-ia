import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";

interface TopBarProps {
  onToggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-black shadow-md px-6 py-3 flex items-center justify-between z-20 h-14 max-w-screen">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-white hover:bg-slate-700"
        >
          <MenuIcon className="size-5" />
        </Button>

        <h1 className="text-xl font-bold text-white max-md:hidden">
          Supermercado Líder
        </h1>
      </div>
    </header>
  );
};

export default TopBar;
