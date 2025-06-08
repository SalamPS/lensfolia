"use client";

import React from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

export default function IconDotsDropdown({
	container, children
}: {
	container?: React.ComponentType<{ children: React.ReactNode }>,
	children?: React.ReactNode;
}) {
	return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none">
          {container ? <>
						{container}
					</> : <IconDotsVertical
            size={20}
            className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
				{children}
      </DropdownMenuContent>
    </DropdownMenu>
	);
}