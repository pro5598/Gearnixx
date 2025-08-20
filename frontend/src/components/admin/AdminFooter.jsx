import { Shield, Gamepad2 } from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-700/50 h-16 flex items-center justify-center">
      <div className="flex items-center gap-4 text-slate-300">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-600/20 rounded-md border border-purple-500/30">
            <Gamepad2 className="h-3 w-3 text-purple-400" />
          </div>
          <span className="text-sm font-medium">Gearnix Admin</span>
        </div>
        
        <div className="w-px h-4 bg-slate-600"></div>
        
        <div className="flex items-center gap-2 text-xs">
          <Shield className="h-3 w-3" />
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="text-slate-500">Admin Panel</span>
        </div>
      </div>
    </footer>
  );
}
