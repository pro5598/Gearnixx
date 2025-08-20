import { Gamepad2 } from "lucide-react";

export default function UserFooter() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-700/50 h-14 flex items-center justify-center text-white text-sm">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-4 w-4 mr-1 text-purple-400" />
        <span className="text-slate-300">
          Gearnix &copy; {new Date().getFullYear()} — 
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium ml-1">
            Level Up Your Gaming
          </span>
        </span>
      </div>
    </footer>
  );
}
