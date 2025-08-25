export default function DashboardLoading() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
        </div>
  
        {/* Stats cards skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="border rounded-lg p-6">
              <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-muted rounded animate-pulse mb-4"></div>
              
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-12 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
  
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <div className="h-6 w-24 bg-muted rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }