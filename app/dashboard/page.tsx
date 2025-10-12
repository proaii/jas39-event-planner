export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
        <p className="text-muted-foreground">Your dashboard content will be here.</p>
      </div>
    </div>
  );
}
