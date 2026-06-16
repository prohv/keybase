import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

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
  return (
    <SidebarGroup className="mt-2">
      <SidebarGroupLabel className="text-forest/60 font-medium px-4">Team</SidebarGroupLabel>
      <SidebarGroupContent className="p-2">
        <select
          value={activeTeamId}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 text-sm font-medium text-forest bg-white border border-border-light rounded-lg focus:outline-none focus:border-sage cursor-pointer appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            paddingRight: '28px',
          }}
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
