export interface Dependency {
  name: string;
  type: 'import' | 'require' | 'use' | 'include' | 'reference';
  version?: string;
  source?: string;
  isExternal: boolean;
  isStandard: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DependencyAnalysis {
  dependencies: Dependency[];
  totalCount: number;
  externalCount: number;
  riskCount: number;
  circularDependencies: string[][];
  unusedDependencies: string[];
}

export class DependencyAnalyzer {
  private readonly STANDARD_LIBRARIES = {
    perl: new Set([
      'strict', 'warnings', 'Carp', 'Data::Dumper', 'File::Basename',
      'File::Path', 'File::Spec', 'Getopt::Long', 'IO::File', 'List::Util',
      'Scalar::Util', 'Time::Local', 'POSIX', 'Exporter'
    ]),
    
    tibco: new Set([
      'java.lang', 'java.util', 'java.io', 'javax.xml', 'org.w3c.dom'
    ]),
    
    pentaho: new Set([
      'java.lang', 'java.util', 'java.sql', 'javax.sql', 'org.pentaho'
    ])
  };
  
  private readonly HIGH_RISK_PATTERNS = [
    /eval/i,
    /exec/i,
    /system/i,
    /shell/i,
    /unsafe/i,
    /deprecated/i
  ];

  analyzeDependencies(content: string, technology: 'perl' | 'tibco' | 'pentaho'): DependencyAnalysis {
    const dependencies = this.extractDependencies(content, technology);
    const totalCount = dependencies.length;
    const externalCount = dependencies.filter(d => d.isExternal).length;
    const riskCount = dependencies.filter(d => d.riskLevel === 'high').length;
    
    return {
      dependencies,
      totalCount,
      externalCount,
      riskCount,
      circularDependencies: [], // TODO: Implement circular dependency detection
      unusedDependencies: []     // TODO: Implement unused dependency detection
    };
  }
  
  private extractDependencies(content: string, technology: 'perl' | 'tibco' | 'pentaho'): Dependency[] {
    switch (technology) {
      case 'perl':
        return this.extractPerlDependencies(content);
      case 'tibco':
        return this.extractTibcoDependencies(content);
      case 'pentaho':
        return this.extractPentahoDependencies(content);
      default:
        return [];
    }
  }
  
  private extractPerlDependencies(content: string): Dependency[] {
    const dependencies: Dependency[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match 'use Module::Name;' or 'use Module::Name version;'
      const useMatch = trimmed.match(/^use\s+([\w:]+)(?:\s+([\d.]+))?/);
      if (useMatch) {
        const name = useMatch[1];
        const version = useMatch[2];
        
        dependencies.push({
          name,
          type: 'use',
          version,
          isExternal: !this.STANDARD_LIBRARIES.perl.has(name),
          isStandard: this.STANDARD_LIBRARIES.perl.has(name),
          riskLevel: this.assessRiskLevel(name, content)
        });
      }
      
      // Match 'require "file.pl";' or 'require Module::Name;'
      const requireMatch = trimmed.match(/^require\s+(?:"([^"]+)"|'([^']+)'|([\w:]+))/);
      if (requireMatch) {
        const name = requireMatch[1] || requireMatch[2] || requireMatch[3];
        
        dependencies.push({
          name,
          type: 'require',
          isExternal: !name.endsWith('.pl') && !this.STANDARD_LIBRARIES.perl.has(name),
          isStandard: this.STANDARD_LIBRARIES.perl.has(name),
          riskLevel: this.assessRiskLevel(name, content)
        });
      }
    }
    
    return dependencies;
  }
  
  private extractTibcoDependencies(content: string): Dependency[] {
    const dependencies: Dependency[] = [];
    
    // Extract Java imports from TIBCO XML
    const importMatches = content.match(/<import[^>]*>([^<]+)<\/import>/g);
    if (importMatches) {
      importMatches.forEach(match => {
        const nameMatch = match.match(/>([^<]+)</);
        if (nameMatch) {
          const name = nameMatch[1].trim();
          dependencies.push({
            name,
            type: 'import',
            isExternal: !this.STANDARD_LIBRARIES.tibco.has(name.split('.')[0] + '.' + name.split('.')[1]),
            isStandard: this.STANDARD_LIBRARIES.tibco.has(name.split('.')[0] + '.' + name.split('.')[1]),
            riskLevel: this.assessRiskLevel(name, content)
          });
        }
      });
    }
    
    // Extract component references
    const componentMatches = content.match(/<pd:activity[^>]+type="([^"]+)"/g);
    if (componentMatches) {
      componentMatches.forEach(match => {
        const typeMatch = match.match(/type="([^"]+)"/);
        if (typeMatch) {
          const name = typeMatch[1];
          dependencies.push({
            name,
            type: 'reference',
            isExternal: true,
            isStandard: false,
            riskLevel: this.assessRiskLevel(name, content)
          });
        }
      });
    }
    
    return dependencies;
  }
  
  private extractPentahoDependencies(content: string): Dependency[] {
    const dependencies: Dependency[] = [];
    
    // Extract step types from Pentaho XML
    const stepMatches = content.match(/<step>\s*<name>[^<]+<\/name>\s*<type>([^<]+)<\/type>/g);
    if (stepMatches) {
      stepMatches.forEach(match => {
        const typeMatch = match.match(/<type>([^<]+)<\/type>/);
        if (typeMatch) {
          const name = typeMatch[1];
          dependencies.push({
            name,
            type: 'reference',
            isExternal: false,
            isStandard: true,
            riskLevel: this.assessRiskLevel(name, content)
          });
        }
      });
    }
    
    // Extract database connections
    const dbMatches = content.match(/<connection>([^<]+)<\/connection>/g);
    if (dbMatches) {
      dbMatches.forEach(match => {
        const nameMatch = match.match(/<connection>([^<]+)<\/connection>/);
        if (nameMatch) {
          const name = nameMatch[1];
          dependencies.push({
            name,
            type: 'reference',
            isExternal: true,
            isStandard: false,
            riskLevel: 'medium' // Database connections always have some risk
          });
        }
      });
    }
    
    return dependencies;
  }
  
  private assessRiskLevel(name: string, content: string): 'low' | 'medium' | 'high' {
    // Check for high-risk patterns
    for (const pattern of this.HIGH_RISK_PATTERNS) {
      if (pattern.test(name) || pattern.test(content)) {
        return 'high';
      }
    }
    
    // External/unknown dependencies are medium risk
    if (name.includes('::') && !this.STANDARD_LIBRARIES.perl.has(name)) {
      return 'medium';
    }
    
    return 'low';
  }
  
  detectCircularDependencies(dependencies: Dependency[]): string[][] {
    // TODO: Implement graph-based circular dependency detection
    return [];
  }
  
  findUnusedDependencies(dependencies: Dependency[], content: string): string[] {
    const unused: string[] = [];
    
    for (const dep of dependencies) {
      // Simple check: if dependency name doesn't appear elsewhere in content
      const nameRegex = new RegExp(dep.name.replace('::', '::'), 'g');
      const matches = content.match(nameRegex);
      
      // If only appears once (in the import/use statement), it might be unused
      if (matches && matches.length <= 1) {
        unused.push(dep.name);
      }
    }
    
    return unused;
  }
}

export const dependencyAnalyzer = new DependencyAnalyzer();
