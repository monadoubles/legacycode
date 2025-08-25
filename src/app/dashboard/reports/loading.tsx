export default function ReportsLoading() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
        </div>
  
        <div className="flex justify-end">
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
  
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }