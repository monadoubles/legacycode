import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BarChart3, 
  Brain, 
  Zap, 
  Shield, 
  Layers, 
  ArrowRight,
  Upload,
  Database,
  TrendingUp 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Legacy Code Analyzer</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/upload">
              <Button variant="outline">Start Analysis</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Modernize Your Legacy Code with{' '}
            <span className="text-primary">AI-Powered Analysis</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Automate legacy code inventory and complexity analysis for enterprise systems. 
            Get intelligent insights for Perl, TIBCO, and Pentaho applications with our 
            comprehensive modernization dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/dashboard/upload">
              <Button size="lg" className="min-w-[200px]">
                <Upload className="w-5 h-5 mr-2" />
                Upload & Analyze
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>
          
          {/* Supported Technologies */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <Badge variant="secondary" className="px-4 py-2">
              <div className="w-4 h-4 bg-tech-perl rounded mr-2"></div>
              Perl (.pl, .pm)
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <div className="w-4 h-4 bg-tech-tibco rounded mr-2"></div>
              TIBCO (XML)
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <div className="w-4 h-4 bg-tech-pentaho rounded mr-2"></div>
              Pentaho (.ktr, .kjb)
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comprehensive Analysis Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to understand, analyze, and modernize your legacy codebase
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Code Analysis */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Automated Code Analysis</CardTitle>
              <CardDescription>
                Parse and extract complexity metrics including lines of code, cyclomatic complexity, and nesting depth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li> Lines of Code (LOC) counting</li>
                <li> Cyclomatic complexity analysis</li>
                <li> Nesting depth measurement</li>
                <li> SQL join detection</li>
                <li> Dependency mapping</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 2: AI Insights */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Suggestions</CardTitle>
              <CardDescription>
                Get intelligent refactoring suggestions and modernization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li> Code refactoring suggestions</li>
                <li> Security risk identification</li>
                <li> Performance optimization tips</li>
                <li> Migration pathway guidance</li>
                <li> Best practice recommendations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 3: Visual Dashboard */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Interactive Dashboard</CardTitle>
              <CardDescription>
                Real-time visualization of code complexity and quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li> Complexity distribution charts</li>
                <li> Technology breakdown views</li>
                <li> Historical trend analysis</li>
                <li> Risk assessment heatmaps</li>
                <li> Custom filtering options</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 4: Report Generation */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Advanced Reporting</CardTitle>
              <CardDescription>
                Generate comprehensive reports and export data in multiple formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li> PDF/CSV/JSON exports</li>
                <li> Version comparison reports</li>
                <li> Executive summaries</li>
                <li> Custom report templates</li>
                <li> Scheduled report generation</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 5: File Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Smart File Handling</CardTitle>
              <CardDescription>
                Drag-and-drop uploads with automatic file detection and deduplication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li> Drag & drop file uploads</li>
                <li> Automatic file type detection</li>
                <li> Duplicate file prevention</li>
                <li> Batch processing support</li>
                <li> Progress tracking</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 6: Security & Performance */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Enterprise Ready</CardTitle>
              <CardDescription>
                Built for enterprise scale with security, performance, and reliability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li> PostgreSQL data storage</li>
                <li> Real-time analysis updates</li>
                <li> Scalable architecture</li>
                <li> Data privacy compliance</li>
                <li> API-first design</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-primary/5 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Modernize Your Legacy Code?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start analyzing your legacy systems today. Upload your files and get instant insights 
            into code complexity, potential issues, and modernization opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/upload">
              <Button size="lg" className="min-w-[200px]">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold">Legacy Code Analyzer</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Documentation</Link>
            <Link href="/" className="hover:text-foreground">API</Link>
            <Link href="/" className="hover:text-foreground">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
