import { Button } from "@urlshare/ui/design-system/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@urlshare/ui/design-system/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { FC } from "react";

type DropdownOptionsProps = {
  onEditClick: () => void;
};

export const DropdownOptions: FC<DropdownOptionsProps> = ({ onEditClick }) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1 h-7 w-7 rounded rounded-full text-slate-400 hover:text-slate-600"
          >
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onEditClick} className="cursor-pointer">
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
