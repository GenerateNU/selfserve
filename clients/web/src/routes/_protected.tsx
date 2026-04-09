import { useStartup } from "@/context/startup";
import { createFileRoute } from "@tanstack/react-router";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { SideBarWithContent } from "@/components/SideBarWithContent";
import NoUserInfo from "@/components/ui/NoUserInfo";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const status = useStartup();

  if (status === "unauthenticated")
    return (
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (status === "no-user-info") return <NoUserInfo />;

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
