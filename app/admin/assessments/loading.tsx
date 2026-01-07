export default function AssessmentsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assessment Analytics</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
      <div className="animate-pulse h-80 bg-slate-200 rounded-lg" />
    </div>
  )
}
