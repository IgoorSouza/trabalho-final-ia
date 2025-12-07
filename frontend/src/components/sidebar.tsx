import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { Users, ShoppingCart } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onLinkClick: () => void;
}

const links = [
  { label: "Clientes", path: "/", icon: Users },
  { label: "Compras", path: "/purchases", icon: ShoppingCart },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onLinkClick }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 h-[calc(100vh-56px)] w-48 bg-white border-r shadow-lg p-4 space-y-4 z-10 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="w-full"
            onClick={onLinkClick}
          >
            <Button
              className={cn(
                "w-full justify-start gap-3",
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white text-black hover:bg-gray-100 dark:bg-input/30 dark:hover:bg-input/50",
                "transition-colors duration-200"
              )}
              variant={location.pathname === link.path ? "default" : "outline"}
            >
              <link.icon className="size-5" />
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
