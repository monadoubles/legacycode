export default function ComparisonLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            <div className="border rounded-lg p-6 space-y-4">
              <div className="h-5 w-40 bg-muted rounded animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4"></div>
        <div className="h-[300px] bg-muted rounded animate-pulse"></div>
      </div>
    </div>
  );
}
