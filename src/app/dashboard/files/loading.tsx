export default function FilesLoading() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
        </div>
  
        <div className="flex items-center space-x-4">
          <div className="h-10 flex-1 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
        </div>
  
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 w-40 bg-muted rounded animate-pulse mb-2"></div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-4"></div>
          
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 w-48 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-6 w-12 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }