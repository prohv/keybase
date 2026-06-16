import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  teamCode: string;
  createdBy: number | null;
}

interface TeamSwitcherProps {
  teams: Team[];
  activeTeamId: number;
  onChange: (value: number) => void;
}

export function TeamSwitcher({ teams, activeTeamId, onChange }: TeamSwitcherProps) {
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

  return (
    <SidebarGroup className="mt-2">
      <SidebarGroupLabel className="text-forest/60 font-medium px-4">Team</SidebarGroupLabel>
      <SidebarGroupContent className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full px-3 py-2 text-sm font-medium text-forest bg-white border border-border-light rounded-lg focus:outline-none focus:border-sage cursor-pointer flex items-center justify-between select-none">
              <span className="truncate">{activeTeam?.name}</span>
              <ChevronDown className="w-4 h-4 text-forest/65 shrink-0 ml-2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border-border-light text-forest">
            {teams.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`cursor-pointer hover:bg-bg-muted focus:bg-bg-muted px-3 py-2 text-sm rounded-md transition-colors ${
                  t.id === activeTeamId ? 'font-semibold bg-green-dark/5' : ''
                }`}
              >
                {t.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
