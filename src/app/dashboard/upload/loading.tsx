export default function UploadLoading() {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-72 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
  
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="border rounded-lg p-6">
                <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-muted rounded animate-pulse mb-4"></div>
                
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-8 w-32 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
  
              <div className="border rounded-lg p-6">
                <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4"></div>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="h-9 w-32 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
  
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4"></div>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                      <div key={j}>
                        <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                        <div className="space-y-1">
                          {[...Array(4)].map((_, k) => (
                            <div key={k} className="h-3 w-full bg-muted rounded animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }