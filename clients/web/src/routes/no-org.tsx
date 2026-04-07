import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/no-org")({
  component: NoOrgPage,
});

function NoOrgPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center">
      <h1 className="text-2xl font-semibold mb-4">No Organization Found</h1>
      <p className="text-gray-500 max-w-md">
        You're not part of a hotel organization yet. Please contact your manager for an invitation.
      </p>
    </div>
  );
}