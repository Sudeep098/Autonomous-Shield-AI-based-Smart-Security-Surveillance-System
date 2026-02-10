import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4 p-8 border border-white/10 bg-card rounded-lg max-w-md w-full">
        <div className="flex justify-center">
           <div className="p-4 bg-red-500/10 rounded-full text-red-500">
             <AlertTriangle size={48} />
           </div>
        </div>
        <h1 className="text-4xl font-bold font-mono text-white">404</h1>
        <p className="text-muted-foreground">
          The requested resource could not be located on this server. Check your access level or return to the command center.
        </p>
        
        <div className="pt-6">
          <Link href="/dashboard">
            <button className="w-full py-3 bg-white text-black font-bold uppercase tracking-wider rounded hover:bg-gray-200 transition-colors">
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-xs font-mono text-zinc-600">
        ERROR_CODE: RESOURCE_MISSING // SYSTEM_ID: SHIELD_CORE_01
      </div>
    </div>
  );
}
