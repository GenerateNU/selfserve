import { createFileRoute } from "@tanstack/react-router";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import { SideBarWithContent } from "@/components/SideBarWithContent";
import NoUserInfo from "@/components/ui/NoUserInfo";
import { StartupStatus, useStartup } from "@/context/startup";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const status = useStartup();

  if (status === StartupStatus.Unauthenticated)
    return (
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    );

  if (status === StartupStatus.Loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (status === StartupStatus.NoUserInfo) return <NoUserInfo />;

  return (
    <>
      <SignedIn>
        <SideBarWithContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
