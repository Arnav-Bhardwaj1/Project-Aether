import { 
  Shield, 
  Activity, 
  Zap, 
  Clock, 
  Search, 
  Settings, 
  Menu,
  ChevronRight,
  Database,
  Flame,
  Network,
  Layers
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0c]">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } glass m-4 mr-0 flex flex-col transition-all duration-300 ease-in-out border-r border-white/5`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Zap size={20} className="text-white" />
            </div>
            {sidebarOpen && <h1 className="font-bold text-xl tracking-tight text-white">Aether</h1>}
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <NavItem 
            href="/" 
            icon={<Activity size={20} />} 
            label="Observability" 
            active={pathname === "/"} 
            sidebarOpen={sidebarOpen} 
          />
          <NavItem 
            href="/mirror" 
            icon={<Layers size={20} />} 
            label="The Mirror" 
            active={pathname === "/mirror"} 
            sidebarOpen={sidebarOpen} 
            variant="mirror"
          />
          <NavItem 
            href="/nexus" 
            icon={<Network size={20} />} 
            label="The Nexus" 
            active={pathname === "/nexus"} 
            sidebarOpen={sidebarOpen} 
            variant="nexus"
          />
          <NavItem 
            href="/forge" 
            icon={<Flame size={20} />} 
            label="The Forge" 
            active={pathname === "/forge"} 
            sidebarOpen={sidebarOpen} 
            variant="forge"
          />
          <NavItem 
            href="/sentry" 
            icon={<Shield size={20} />} 
            label="The Sentry" 
            active={pathname === "/sentry"} 
            sidebarOpen={sidebarOpen} 
          />
          <NavItem 
            href="/history" 
            icon={<Clock size={20} />} 
            label="History" 
            active={pathname === "/history"} 
            sidebarOpen={sidebarOpen} 
          />
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
          <NavItem 
            href="/settings" 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={pathname === "/settings"} 
            sidebarOpen={sidebarOpen} 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden p-4">
        <header className="h-16 flex items-center justify-between px-6 mb-4 glass border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-medium text-white/60">Dashboard / <span className="text-white capitalize">{pathname.split('/')[1] || 'Observability'}</span></h2>
          </div>

          <div className="flex items-center gap-4 text-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input 
                type="text" 
                placeholder="Search traces..." 
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors w-64 text-white"
              />
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/20 shadow-lg shadow-blue-500/10" />
          </div>
        </header>

        <div className="flex-1 overflow-auto scroll-smooth custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ 
    href, 
    icon, 
    label, 
    active = false, 
    sidebarOpen,
    variant = "default"
}: { 
    href: string, 
    icon: React.ReactNode, 
    label: string, 
    active?: boolean, 
    sidebarOpen: boolean,
    variant?: "default" | "forge" | "nexus" | "mirror"
}) {
  const getActiveClass = () => {
    if (variant === "forge") return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    if (variant === "nexus") return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
    if (variant === "mirror") return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
    return "bg-blue-600/10 text-blue-400 border border-blue-600/20";
  };

  return (
    <Link href={href} className={`
      flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all
      ${active ? getActiveClass() : "text-white/60 hover:bg-white/5 hover:text-white"}
    `}>
      {icon}
      {sidebarOpen && <span className="font-medium text-sm">{label}</span>}
      {active && sidebarOpen && <ChevronRight size={14} className="ml-auto" />}
    </Link>
  );
}



