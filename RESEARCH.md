### Architecture

Comprehensive architecture for a configurable Figma plugin that exports design properties for AI-powered code generation.

This architecture provides a comprehensive solution for a configurable Figma plugin that can extract design properties and generate AI-ready prompts. Here are the key highlights:

Core Features
Flexible Configuration System - Users can configure extraction levels, target frameworks (React, Vue, Flutter, etc.), styling methods (Tailwind, CSS modules, etc.), and AI context preferences.
Comprehensive Property Extraction - The plugin extracts visual properties, layout information, component structure, interactions, assets, and design tokens at configurable detail levels.
AI-Optimized Output - Generates structured prompts specifically formatted for different LLMs (Claude, GPT, Cursor, Windsurf) with appropriate context and instructions.
Multi-Framework Support - Can generate code templates and prompts for various frameworks and styling approaches based on user configuration.
Key Architectural Benefits
Modular Design - Each extractor and generator is independent, making it easy to add new frameworks or property types.
Preset System - Common configurations are saved as presets (like "React + Tailwind" or "Vue + CSS Modules").
Extensible - New extractors, formatters, and export targets can be added without changing core architecture.
User-Friendly - Configuration panel allows easy customization without technical knowledge.

The plugin would extract everything from basic colors and typography to complex layout relationships and component variants, then format it all into a comprehensive prompt that you can paste directly into Cursor, Windsurf, or any AI coding assistant. The AI then has all the context it needs to generate accurate, production-ready code that matches your Figma designs perfectly.

🎯 Selection Intelligence
The plugin automatically detects and adapts to:

Single frames (with/without auto layout)
Components & instances (with variant detection)
Multiple frames (user flows vs individual screens)
Sections (complete multi-page experiences)
Groups (treating grouped elements as single components)
Mixed selections (with smart suggestions)

🧠 Smart Context Awareness
Auto Layout Detection: When you select a frame with auto layout, it knows to generate flexbox/CSS Grid code instead of absolute positioning.
Component Variants: Selecting a component with variants automatically extracts all variant properties and generates proper TypeScript interfaces.
User Flow Recognition: Multiple selected frames are analyzed to detect if they represent a user journey, then generates connected screens with navigation.
Responsive Behavior: Detects responsive constraints and generates appropriate breakpoint code.
🔧 Adaptive Configuration
The UI dynamically shows relevant options based on your selection:

Component options only appear for components
Multi-frame settings only show for multiple selections
Preset recommendations change based on selection type

📋 Selection-Specific Prompts
Each selection type gets optimized prompts:

Single frame: Complete component with layout instructions
Component: Reusable component with props and variants
Multi-frame: Connected user flow with navigation
Section: Full feature implementation with state management

🚀 Real-World Usage
Select a login form frame → Gets auto layout properties, form validation patterns, and responsive design instructions.
Select a button component with variants → Extracts all variant states, generates TypeScript props, and includes accessibility patterns.
Select an onboarding flow → Creates connected screens with routing, progress tracking, and shared components.
This architecture makes the plugin incredibly intuitive - just select what you want to build, configure once, and get perfectly tailored AI prompts that understand exactly what you're trying to create!

---

### Implementation

### 5.1 Selection-Aware Configuration Panel

```typescript
interface ConfigPanelProps {
  config: ExportConfig;
  onConfigChange: (config: ExportConfig) => void;
  presets: Record<string, Partial<ExportConfig>>;
  selectionContext: SelectionContext;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  config, 
  onConfigChange, 
  presets, 
  selectionContext 
}) => {
  // Show selection-specific configuration options
  const relevantPresets = filterPresetsBySelection(presets, selectionContext);
  const showAdvancedOptions = shouldShowAdvancedOptions(selectionContext);
  
  return (
    <div className="config-panel">
      <SelectionSummary context={selectionContext} />
      
      <PresetSelector 
        presets={relevantPresets} 
        onSelect={handlePresetSelect}
        selectionType={selectionContext.type}
      />
      
      <FrameworkSelector 
        value={config.framework} 
        onChange={handleFrameworkChange}
        recommendations={getFrameworkRecommendations(selectionContext)}
      />
      
      <StylingOptions 
        styling={config.styling} 
        onChange={handleStylingChange}
        selectionContext={selectionContext}
      />
      
      {selectionContext.type === 'component' && (
        <ComponentOptions 
          componentData={selectionContext.componentData}
          config={config}
          onChange={handleComponentConfigChange}
        />
      )}
      
      {selectionContext.type === 'multiple-frames' && (
        <MultiFrameOptions 
          isUserFlow={selectionContext.isUserFlow}
          screenCount={selectionContext.screens}
          config={config}
          onChange={handleMultiFrameConfigChange}
        />
      )}
      
      {showAdvancedOptions && (
        <>
          <ExtractionSettings 
            extraction={config.extraction} 
            onChange={handleExtractionChange}
            selectionContext={selectionContext}
          />
          <OutputSettings 
            output={config.output} 
            onChange={handleOutputChange} 
          />
          <AIContextSettings 
            aiContext={config.aiContext} 
            onChange={handleAIContextChange} 
          # Figma AI Code Export Plugin Architecture

## 1. Plugin Structure Overview

```
.
├── src/
│   ├── ui/
│   │   ├── components/
│   │   ├── stores/
│   │   └── utils/
│   ├── extraction/
│   │   ├── extractors/
│   │   ├── processors/
│   │   └── formatters/
│   ├── config/
│   │   ├── presets/
│   │   └── schemas/
│   └── export/
│       ├── generators/
│       └── templates/
```

## 2. Core Components Architecture

### 2.1 Configuration System

```typescript
interface ExportConfig {
  // Framework targeting
  framework: 'react' | 'vue' | 'svelte' | 'html-css' | 'flutter' | 'swift-ui';
  
  // Styling approach
  styling: {
    method: 'tailwind' | 'css-modules' | 'styled-components' | 'css-in-js' | 'plain-css';
    units: 'px' | 'rem' | 'em' | '%' | 'vw-vh';
    responsive: boolean;
    breakpoints?: string[];
  };
  
  // Property extraction settings
  extraction: {
    colors: ExtractionLevel;
    typography: ExtractionLevel;
    spacing: ExtractionLevel;
    layout: ExtractionLevel;
    effects: ExtractionLevel;
    interactions: ExtractionLevel;
    assets: ExtractionLevel;
  };
  
  // Output preferences
  output: {
    includeComments: boolean;
    includeDesignTokens: boolean;
    includeAccessibility: boolean;
    codeStyle: 'verbose' | 'concise' | 'minimal';
    promptTemplate: string;
  };
  
  // AI Context
  aiContext: {
    targetLLM: 'claude' | 'gpt' | 'cursor' | 'windsurf' | 'generic';
    includeInstructions: boolean;
    contextLevel: 'basic' | 'detailed' | 'comprehensive';
  };
}

enum ExtractionLevel {
  NONE = 'none',
  BASIC = 'basic',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive'
}
```

### 2.2 Selection-Aware Property Extraction Engine

```typescript
class PropertyExtractor {
  private config: ExportConfig;
  private selectionAnalyzer: SelectionAnalyzer;
  
  constructor(config: ExportConfig) {
    this.config = config;
    this.selectionAnalyzer = new SelectionAnalyzer();
  }
  
  extract(selection: SceneNode[]): ExtractedProperties {
    // Analyze selection type and structure
    const selectionContext = this.selectionAnalyzer.analyze(selection);
    
    // Initialize extractors with selection context
    const extractors = [
      new VisualPropertyExtractor(this.config, selectionContext),
      new LayoutPropertyExtractor(this.config, selectionContext),
      new StructureExtractor(this.config, selectionContext),
      new InteractionExtractor(this.config, selectionContext),
      new AssetExtractor(this.config, selectionContext),
      new TokenExtractor(this.config, selectionContext)
    ];
    
    return extractors.reduce((acc, extractor) => {
      return { ...acc, ...extractor.extract(selection) };
    }, {} as ExtractedProperties);
  }
}

class SelectionAnalyzer {
  analyze(selection: SceneNode[]): SelectionContext {
    if (selection.length === 0) {
      return { type: 'empty', nodes: [], structure: 'none' };
    }
    
    if (selection.length === 1) {
      return this.analyzeSingleSelection(selection[0]);
    }
    
    return this.analyzeMultipleSelection(selection);
  }
  
  private analyzeSingleSelection(node: SceneNode): SelectionContext {
    switch (node.type) {
      case 'FRAME':
        return {
          type: 'single-frame',
          nodes: [node],
          structure: this.analyzeFrameStructure(node as FrameNode),
          isComponent: node.name.startsWith('Component') || this.hasComponentProperties(node),
          hasAutoLayout: (node as FrameNode).layoutMode !== 'NONE',
          isResponsive: this.checkResponsiveFeatures(node as FrameNode)
        };
        
      case 'COMPONENT':
      case 'INSTANCE':
        return {
          type: 'component',
          nodes: [node],
          structure: 'component',
          componentData: this.extractComponentData(node),
          variants: this.extractVariants(node)
        };
        
      case 'SECTION':
        return {
          type: 'section',
          nodes: [node],
          structure: 'section',
          pages: this.analyzeSectionContent(node as SectionNode)
        };
        
      case 'GROUP':
        return {
          type: 'group',
          nodes: [node],
          structure: 'grouped-elements',
          groupedItems: this.analyzeGroupContent(node as GroupNode)
        };
        
      default:
        return {
          type: 'single-element',
          nodes: [node],
          structure: 'element',
          elementType: node.type.toLowerCase()
        };
    }
  }
  
  private analyzeMultipleSelection(nodes: SceneNode[]): SelectionContext {
    const types = [...new Set(nodes.map(n => n.type))];
    const hasFrames = types.includes('FRAME');
    const hasComponents = types.some(t => ['COMPONENT', 'INSTANCE'].includes(t));
    const hasSections = types.includes('SECTION');
    
    if (hasSections) {
      return {
        type: 'multiple-sections',
        nodes,
        structure: 'multi-page-flow',
        sections: nodes.filter(n => n.type === 'SECTION').length
      };
    }
    
    if (hasFrames && nodes.length <= 5) {
      return {
        type: 'multiple-frames',
        nodes,
        structure: 'screen-flow',
        isUserFlow: this.detectUserFlow(nodes),
        screens: nodes.filter(n => n.type === 'FRAME').length
      };
    }
    
    if (hasComponents) {
      return {
        type: 'component-library',
        nodes,
        structure: 'design-system',
        components: this.groupComponentsByType(nodes)
      };
    }
    
    return {
      type: 'mixed-selection',
      nodes,
      structure: 'collection',
      elementTypes: types
    };
  }
}

## 2.4 Selection Context Interface

```typescript
interface SelectionContext {
  type: SelectionType;
  nodes: SceneNode[];
  structure: StructureType;
  
  // Frame-specific
  isComponent?: boolean;
  hasAutoLayout?: boolean;
  isResponsive?: boolean;
  
  // Component-specific
  componentData?: ComponentData;
  variants?: VariantData[];
  
  // Multi-selection specific
  isUserFlow?: boolean;
  screens?: number;
  sections?: number;
  
  // Section-specific
  pages?: FrameNode[];
  
  // Group-specific
  groupedItems?: GroupAnalysis;
  
  // Mixed selection
  elementTypes?: string[];
  components?: ComponentGroup[];
}

type SelectionType = 
  | 'empty'
  | 'single-frame'
  | 'single-element'
  | 'component' 
  | 'section'
  | 'group'
  | 'multiple-frames'
  | 'multiple-sections'
  | 'component-library'
  | 'mixed-selection';

type StructureType = 
  | 'none'
  | 'single-screen'
  | 'component'
  | 'section'
  | 'grouped-elements'
  | 'element'
  | 'screen-flow'
  | 'multi-page-flow'
  | 'design-system'
  | 'collection';

interface ComponentData {
  isMainComponent: boolean;
  isInstance: boolean;
  hasVariants: boolean;
  variantProperties?: Record<string, string>;
  overrides?: InstanceOverride[];
}

interface GroupAnalysis {
  totalItems: number;
  itemTypes: string[];
  hasNestedGroups: boolean;
  bounds: { width: number; height: number };
  arrangement: 'grid' | 'list' | 'scattered' | 'layered';
}
```
```

### 2.3 Selection-Specific Extractors

```typescript
class VisualPropertyExtractor {
  private selectionContext: SelectionContext;
  
  constructor(private config: ExportConfig, selectionContext: SelectionContext) {
    this.selectionContext = selectionContext;
  }
  
  extract(nodes: SceneNode[]): VisualProperties {
    switch (this.selectionContext.type) {
      case 'single-frame':
        return this.extractFrameVisuals(nodes[0] as FrameNode);
      case 'component':
        return this.extractComponentVisuals(nodes[0]);
      case 'section':
        return this.extractSectionVisuals(nodes[0] as SectionNode);
      case 'multiple-frames':
        return this.extractMultipleFrameVisuals(nodes as FrameNode[]);
      case 'group':
        return this.extractGroupVisuals(nodes[0] as GroupNode);
      default:
        return this.extractGenericVisuals(nodes);
    }
  }
  
  private extractFrameVisuals(frame: FrameNode): VisualProperties {
    const frameProps = {
      background: this.extractBackground(frame),
      dimensions: { width: frame.width, height: frame.height },
      constraints: this.extractConstraints(frame)
    };
    
    // Extract properties from all children
    const childrenProps = this.extractChildrenVisuals(frame.children);
    
    return {
      container: frameProps,
      children: childrenProps,
      colors: this.buildColorPalette([frame, ...this.getAllDescendants(frame)]),
      typography: this.extractTypographyFromFrame(frame),
      effects: this.extractEffectsFromFrame(frame)
    };
  }
  
  private extractComponentVisuals(component: ComponentNode | InstanceNode): VisualProperties {
    const baseProps = this.extractFrameVisuals(component as any);
    
    // Add component-specific properties
    if (component.type === 'INSTANCE') {
      const overrides = this.extractInstanceOverrides(component);
      return { ...baseProps, overrides };
    }
    
    if (component.type === 'COMPONENT') {
      const variants = this.extractComponentVariants(component);
      return { ...baseProps, variants };
    }
    
    return baseProps;
  }
  
  private extractSectionVisuals(section: SectionNode): VisualProperties {
    // Extract from all frames within the section
    const frames = section.children.filter(child => child.type === 'FRAME') as FrameNode[];
    const sectionVisuals = frames.map(frame => this.extractFrameVisuals(frame));
    
    return {
      sectionName: section.name,
      frames: sectionVisuals,
      globalColors: this.buildGlobalColorPalette(frames),
      globalTypography: this.buildGlobalTypography(frames)
    };
  }
  
  private extractGroupVisuals(group: GroupNode): VisualProperties {
    const groupBounds = {
      width: group.width,
      height: group.height,
      x: group.x,
      y: group.y
    };
    
    const childrenProps = this.extractChildrenVisuals(group.children);
    
    return {
      groupBounds,
      children: childrenProps,
      relativePositioning: this.calculateRelativePositions(group.children, groupBounds)
    };
  }
}

class LayoutPropertyExtractor {
  private selectionContext: SelectionContext;
  
  constructor(private config: ExportConfig, selectionContext: SelectionContext) {
    this.selectionContext = selectionContext;
  }
  
  extract(nodes: SceneNode[]): LayoutProperties {
    switch (this.selectionContext.type) {
      case 'single-frame':
        return this.extractFrameLayout(nodes[0] as FrameNode);
      case 'component':
        return this.extractComponentLayout(nodes[0]);
      case 'multiple-frames':
        return this.extractMultiFrameLayout(nodes as FrameNode[]);
      case 'group':
        return this.extractGroupLayout(nodes[0] as GroupNode);
      default:
        return this.extractGenericLayout(nodes);
    }
  }
  
  private extractFrameLayout(frame: FrameNode): LayoutProperties {
    const hasAutoLayout = frame.layoutMode !== 'NONE';
    
    if (hasAutoLayout) {
      return {
        type: 'auto-layout',
        direction: frame.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
        alignment: {
          primary: this.mapPrimaryAlignment(frame.primaryAxisAlignMode),
          counter: this.mapCounterAlignment(frame.counterAxisAlignMode)
        },
        spacing: frame.itemSpacing,
        padding: {
          top: frame.paddingTop,
          right: frame.paddingRight,
          bottom: frame.paddingBottom,
          left: frame.paddingLeft
        },
        wrap: frame.layoutWrap === 'WRAP',
        children: this.extractChildrenLayouts(frame.children)
      };
    } else {
      return {
        type: 'absolute',
        bounds: { width: frame.width, height: frame.height },
        children: frame.children.map(child => ({
          id: child.id,
          name: child.name,
          position: { x: child.x, y: child.y },
          size: { width: child.width, height: child.height },
          constraints: this.extractNodeConstraints(child)
        }))
      };
    }
  }
  
  private extractMultiFrameLayout(frames: FrameNode[]): LayoutProperties {
    // Analyze spatial relationship between frames
    const positions = frames.map(f => ({ x: f.x, y: f.y, width: f.width, height: f.height }));
    const flow = this.detectLayoutFlow(positions);
    
    return {
      type: 'multi-screen',
      flow,
      screens: frames.map(frame => ({
        name: frame.name,
        layout: this.extractFrameLayout(frame),
        position: { x: frame.x, y: frame.y },
        transitions: this.extractTransitions(frame)
      }))
    };
  }
}

class StructureExtractor {
  private selectionContext: SelectionContext;
  
  constructor(private config: ExportConfig, selectionContext: SelectionContext) {
    this.selectionContext = selectionContext;
  }
  
  extract(nodes: SceneNode[]): StructureProperties {
    switch (this.selectionContext.type) {
      case 'single-frame':
        return this.extractFrameStructure(nodes[0] as FrameNode);
      case 'component':
        return this.extractComponentStructure(nodes[0]);
      case 'section':
        return this.extractSectionStructure(nodes[0] as SectionNode);
      case 'multiple-frames':
        return this.extractUserFlowStructure(nodes as FrameNode[]);
      case 'component-library':
        return this.extractDesignSystemStructure(nodes);
      default:
        return this.extractGenericStructure(nodes);
    }
  }
  
  private extractFrameStructure(frame: FrameNode): StructureProperties {
    const hierarchy = this.buildHierarchy(frame);
    const semantics = this.inferSemantics(frame);
    
    return {
      type: 'single-screen',
      name: frame.name,
      hierarchy,
      semantics,
      components: this.findComponentInstances(frame),
      complexity: this.calculateComplexity(frame)
    };
  }
  
  private extractComponentStructure(component: ComponentNode | InstanceNode): StructureProperties {
    const isVariant = component.parent?.type === 'COMPONENT_SET';
    
    return {
      type: 'component',
      name: component.name,
      isVariant,
      variantProperties: isVariant ? this.extractVariantProperties(component) : undefined,
      props: this.inferComponentProps(component),
      children: this.extractComponentChildren(component),
      usage: component.type === 'INSTANCE' ? this.analyzeInstanceUsage(component) : undefined
    };
  }
  
  private extractUserFlowStructure(frames: FrameNode[]): StructureProperties {
    const flowSteps = this.analyzeUserFlow(frames);
    
    return {
      type: 'user-flow',
      steps: flowSteps,
      navigation: this.extractNavigationPatterns(frames),
      sharedComponents: this.findSharedComponents(frames),
      dataFlow: this.analyzeDataFlow(frames)
    };
  }
  
  private extractDesignSystemStructure(nodes: SceneNode[]): StructureProperties {
    const components = nodes.filter(n => ['COMPONENT', 'INSTANCE'].includes(n.type));
    const categorized = this.categorizeComponents(components);
    
    return {
      type: 'design-system',
      categories: categorized,
      tokens: this.extractDesignTokens(nodes),
      patterns: this.identifyPatterns(components),
      documentation: this.generateComponentDocs(components)
    };
  }
}
```

## 3. Configuration Presets

### 3.1 Framework-Specific Presets

```typescript
const FRAMEWORK_PRESETS: Record<string, Partial<ExportConfig>> = {
  'react-tailwind': {
    framework: 'react',
    styling: {
      method: 'tailwind',
      units: 'rem',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl']
    },
    output: {
      codeStyle: 'concise',
      includeComments: true
    }
  },
  
  'vue-css-modules': {
    framework: 'vue',
    styling: {
      method: 'css-modules',
      units: 'px',
      responsive: true
    },
    output: {
      codeStyle: 'verbose',
      includeDesignTokens: true
    }
  },
  
  'react-native': {
    framework: 'react',
    styling: {
      method: 'css-in-js',
      units: 'px',
      responsive: false
    },
    extraction: {
      layout: ExtractionLevel.COMPREHENSIVE,
      spacing: ExtractionLevel.DETAILED
    }
  }
};
```

### 3.2 LLM-Specific Templates

```typescript
const LLM_TEMPLATES = {
  claude: {
    systemPrompt: `You are an expert frontend developer. Convert this Figma design to clean, production-ready code.`,
    instructionFormat: 'detailed',
    codeBlockFormat: 'artifact'
  },
  
  cursor: {
    systemPrompt: `Generate component code based on these design specifications:`,
    instructionFormat: 'concise',
    codeBlockFormat: 'inline'
  },
  
  windsurf: {
    systemPrompt: `Create a responsive component from this design data:`,
    instructionFormat: 'structured',
    codeBlockFormat: 'multi-file'
  }
};
```

## 4. Export Generation System

### 4.1 Selection-Aware Prompt Generator

```typescript
class PromptGenerator {
  private config: ExportConfig;
  private template: PromptTemplate;
  private selectionContext: SelectionContext;
  
  constructor(config: ExportConfig, selectionContext: SelectionContext) {
    this.config = config;
    this.selectionContext = selectionContext;
    this.template = this.selectTemplate();
  }
  
  generatePrompt(properties: ExtractedProperties): string {
    const sections = [
      this.generateContextHeader(),
      this.generateSelectionDescription(),
      this.generateDesignSpec(properties),
      this.generateRequirements(),
      this.generateSelectionSpecificInstructions(),
      this.generateExamples()
    ];
    
    return sections.join('\n\n');
  }
  
  private generateContextHeader(): string {
    const selectionTypeDescriptions = {
      'single-frame': 'Single Screen/Frame',
      'component': 'Component or Component Instance',
      'section': 'Design Section with Multiple Screens',
      'multiple-frames': 'Multiple Screens/User Flow',
      'group': 'Grouped Elements',
      'component-library': 'Component Library/Design System',
      'mixed-selection': 'Mixed Design Elements'
    };
    
    return `# ${selectionTypeDescriptions[this.selectionContext.type]} Export
    
Selection Type: ${this.selectionContext.type}
Elements Count: ${this.selectionContext.nodes.length}
Structure: ${this.selectionContext.structure}`;
  }
  
  private generateSelectionDescription(): string {
    switch (this.selectionContext.type) {
      case 'single-frame':
        return this.describeSingleFrame();
      case 'component':
        return this.describeComponent();
      case 'section':
        return this.describeSection();
      case 'multiple-frames':
        return this.describeMultipleFrames();
      case 'group':
        return this.describeGroup();
      case 'component-library':
        return this.describeComponentLibrary();
      default:
        return this.describeGeneric();
    }
  }
  
  private describeSingleFrame(): string {
    const frame = this.selectionContext.nodes[0] as FrameNode;
    const hasAutoLayout = this.selectionContext.hasAutoLayout;
    const isResponsive = this.selectionContext.isResponsive;
    
    return `## Frame Analysis
- **Name**: ${frame.name}
- **Dimensions**: ${frame.width}×${frame.height}px
- **Layout**: ${hasAutoLayout ? 'Auto Layout (Flexbox-like)' : 'Absolute Positioning'}
- **Responsive**: ${isResponsive ? 'Yes' : 'No'}
- **Children**: ${frame.children.length} elements
- **Component**: ${this.selectionContext.isComponent ? 'Yes' : 'No'}`;
  }
  
  private describeComponent(): string {
    const component = this.selectionContext.nodes[0];
    const data = this.selectionContext.componentData!;
    
    return `## Component Analysis
- **Name**: ${component.name}
- **Type**: ${data.isInstance ? 'Component Instance' : 'Main Component'}
- **Has Variants**: ${data.hasVariants ? 'Yes' : 'No'}
- **Variant Props**: ${data.variantProperties ? Object.keys(data.variantProperties).join(', ') : 'None'}
- **Overrides**: ${data.overrides?.length || 0} instance overrides`;
  }
  
  private describeMultipleFrames(): string {
    const frames = this.selectionContext.nodes as FrameNode[];
    const isUserFlow = this.selectionContext.isUserFlow;
    
    return `## Multi-Frame Analysis
- **Screen Count**: ${frames.length}
- **Type**: ${isUserFlow ? 'User Flow/Journey' : 'Screen Collection'}
- **Screens**: ${frames.map(f => f.name).join(', ')}
- **Flow Direction**: ${this.detectFlowDirection(frames)}`;
  }
  
  private generateSelectionSpecificInstructions(): string {
    switch (this.selectionContext.type) {
      case 'single-frame':
        return this.generateFrameInstructions();
      case 'component':
        return this.generateComponentInstructions();
      case 'multiple-frames':
        return this.generateMultiFrameInstructions();
      case 'section':
        return this.generateSectionInstructions();
      case 'group':
        return this.generateGroupInstructions();
      default:
        return this.generateGenericInstructions();
    }
  }
  
  private generateFrameInstructions(): string {
    const hasAutoLayout = this.selectionContext.hasAutoLayout;
    const isComponent = this.selectionContext.isComponent;
    
    let instructions = `## Code Generation Instructions

### Primary Goal
Generate a ${this.config.framework} component that replicates this frame design.

### Layout Approach
${hasAutoLayout 
  ? '- Use Flexbox/CSS Grid as the frame uses Auto Layout\n- Maintain spacing and alignment from Auto Layout settings' 
  : '- Use absolute or relative positioning as needed\n- Maintain exact element positions and relationships'}

### Component Structure
${isComponent 
  ? '- Create a reusable component with proper props\n- Include variant support if applicable' 
  : '- Create a single-use component or page layout\n- Focus on pixel-perfect implementation'}`;

    if (this.selectionContext.isResponsive) {
      instructions += `\n\n### Responsive Behavior
- Implement responsive breakpoints
- Maintain design integrity across screen sizes
- Use flexible units where appropriate`;
    }

    return instructions;
  }
  
  private generateComponentInstructions(): string {
    const data = this.selectionContext.componentData!;
    
    return `## Component Generation Instructions

### Component Type
${data.isInstance ? 'Convert this component instance into code, maintaining all overrides and customizations.' : 'Generate the main component definition with full reusability.'}

### Props & Variants
${data.hasVariants ? `- Implement variant system with properties: ${Object.keys(data.variantProperties || {}).join(', ')}
- Create proper TypeScript interfaces for variant props` : '- Create standard component props for customization'}

### Instance Handling
${data.overrides?.length ? `- Account for ${data.overrides.length} instance overrides
- Make overridden properties configurable via props` : '- Use default component configuration'}`;
  }
  
  private generateMultiFrameInstructions(): string {
    const isUserFlow = this.selectionContext.isUserFlow;
    
    return `## Multi-Screen Generation Instructions

### Approach
${isUserFlow 
  ? `- Generate a complete user flow with navigation
- Include routing between screens
- Maintain state consistency across screens` 
  : `- Generate individual screen components
- Focus on design consistency between screens
- Create a shared component library for common elements`}

### Navigation
- Implement navigation between screens
- Add transition animations where appropriate
- Maintain design system consistency

### Shared Elements
- Extract common components used across screens
- Create a unified theme/design system
- Maintain consistent spacing and typography`;
  }
}
```

### 4.2 Multi-Format Exporters

```typescript
class CodeExporter {
  export(properties: ExtractedProperties, config: ExportConfig): ExportResult {
    const generators = {
      'react': new ReactGenerator(config),
      'vue': new VueGenerator(config),
      'html-css': new HTMLCSSGenerator(config),
      'flutter': new FlutterGenerator(config)
    };
    
    const generator = generators[config.framework];
    return generator.generate(properties);
  }
}

class ReactGenerator {
  generate(properties: ExtractedProperties): ExportResult {
    return {
      prompt: this.generatePrompt(properties),
      code: {
        component: this.generateComponent(properties),
        styles: this.generateStyles(properties),
        types: this.generateTypes(properties)
      },
      assets: this.generateAssets(properties)
    };
  }
  
  private generateComponent(properties: ExtractedProperties): string {
    // Generate React component structure
    // Include props interface, state management
    // Add event handlers and lifecycle methods
  }
}
```

## 5. User Interface Components

### 5.1 Configuration Panel

```typescript
interface ConfigPanelProps {
  config: ExportConfig;
  onConfigChange: (config: ExportConfig) => void;
  presets: Record<string, Partial<ExportConfig>>;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange, presets }) => {
  return (
    <div className="config-panel">
      <PresetSelector presets={presets} onSelect={handlePresetSelect} />
      <FrameworkSelector value={config.framework} onChange={handleFrameworkChange} />
      <StylingOptions styling={config.styling} onChange={handleStylingChange} />
      <ExtractionSettings extraction={config.extraction} onChange={handleExtractionChange} />
      <OutputSettings output={config.output} onChange={handleOutputChange} />
      <AIContextSettings aiContext={config.aiContext} onChange={handleAIContextChange} />
    </div>
  );
};
```

### 5.2 Export Interface

```typescript
const ExportInterface: React.FC = () => {
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const selection = figma.currentPage.selection;
      const extractor = new PropertyExtractor(config);
      const properties = extractor.extract(selection);
      const exporter = new CodeExporter();
      const result = exporter.export(properties, config);
      setExportResult(result);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="export-interface">
      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export to AI'}
      </button>
      
      {exportResult && (
        <ExportResult result={exportResult}         />
      )}
    </div>
  );
};

const SelectionSummary: React.FC<{ context: SelectionContext }> = ({ context }) => {
  const getSelectionIcon = () => {
    switch (context.type) {
      case 'single-frame': return '🖼️';
      case 'component': return '🧩';
      case 'section': return '📋';
      case 'multiple-frames': return '📱';
      case 'group': return '📦';
      case 'component-library': return '🎨';
      default: return '📄';
    }
  };

  const getSelectionDescription = () => {
    switch (context.type) {
      case 'single-frame':
        return `${context.hasAutoLayout ? 'Auto Layout' : 'Fixed'} Frame${context.isComponent ? ' (Component)' : ''}`;
      case 'component':
        return `${context.componentData?.isInstance ? 'Component Instance' : 'Main Component'}${context.componentData?.hasVariants ? ' with Variants' : ''}`;
      case 'section':
        return `Section with ${context.pages?.length || 0} screens`;
      case 'multiple-frames':
        return `${context.screens} screens${context.isUserFlow ? ' (User Flow)' : ''}`;
      case 'group':
        return `Group with ${context.groupedItems?.totalItems || 0} items`;
      case 'component-library':
        return `${context.components?.length || 0} components`;
      default:
        return `${context.nodes.length} selected elements`;
    }
  };

  return (
    <div className="selection-summary">
      <div className="selection-header">
        <span className="selection-icon">{getSelectionIcon()}</span>
        <div>
          <h3>{context.nodes[0]?.name || 'Selection'}</h3>
          <p>{getSelectionDescription()}</p>
        </div>
      </div>
      
      {context.type === 'single-frame' && context.hasAutoLayout && (
        <div className="auto-layout-info">
          <span className="badge">Auto Layout Detected</span>
          <span className="badge">Flexbox Compatible</span>
        </div>
      )}
      
      {context.type === 'component' && context.componentData?.hasVariants && (
        <div className="variant-info">
          <span className="badge">Has Variants</span>
          <span className="variant-count">
            {Object.keys(context.componentData.variantProperties || {}).length} properties
          </span>
        </div>
      )}
    </div>
  );
};

const ComponentOptions: React.FC<{
  componentData?: ComponentData;
  config: ExportConfig;
  onChange: (config: Partial<ExportConfig>) => void;
}> = ({ componentData, config, onChange }) => {
  if (!componentData) return null;

  return (
    <div className="component-options">
      <h4>Component Settings</h4>
      
      {componentData.hasVariants && (
        <div className="variant-settings">
          <label>
            <input
              type="checkbox"
              checked={config.extraction.variants === ExtractionLevel.COMPREHENSIVE}
              onChange={(e) => onChange({
                extraction: {
                  ...config.extraction,
                  variants: e.target.checked ? ExtractionLevel.COMPREHENSIVE : ExtractionLevel.BASIC
                }
              })}
            />
            Extract all variant properties
          </label>
          
          <div className="variant-properties">
            <p>Detected variant properties:</p>
            <ul>
              {Object.entries(componentData.variantProperties || {}).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {componentData.isInstance && componentData.overrides && (
        <div className="override-settings">
          <label>
            <input
              type="checkbox"
              checked={config.extraction.overrides === ExtractionLevel.DETAILED}
              onChange={(e) => onChange({
                extraction: {
                  ...config.extraction,
                  overrides: e.target.checked ? ExtractionLevel.DETAILED : ExtractionLevel.BASIC
                }
              })}
            />
            Include instance overrides ({componentData.overrides.length})
          </label>
        </div>
      )}
      
      <div className="prop-generation">
        <label>
          <input
            type="checkbox"
            checked={config.output.generateProps}
            onChange={(e) => onChange({
              output: {
                ...config.output,
                generateProps: e.target.checked
              }
            })}
          />
          Auto-generate component props
        </label>
      </div>
    </div>
  );
};

const MultiFrameOptions: React.FC<{
  isUserFlow?: boolean;
  screenCount?: number;
  config: ExportConfig;
  onChange: (config: Partial<ExportConfig>) => void;
}> = ({ isUserFlow, screenCount, config, onChange }) => {
  return (
    <div className="multi-frame-options">
      <h4>Multi-Screen Settings</h4>
      
      <div className="flow-type">
        <label>
          <input
            type="radio"
            name="flowType"
            value="individual"
            checked={!config.multiFrame?.generateFlow}
            onChange={() => onChange({
              multiFrame: { ...config.multiFrame, generateFlow: false }
            })}
          />
          Generate individual components
        </label>
        
        <label>
          <input
            type="radio"
            name="flowType"
            value="flow"
            checked={config.multiFrame?.generateFlow}
            onChange={() => onChange({
              multiFrame: { ...config.multiFrame, generateFlow: true }
            })}
          />
          Generate connected user flow ({screenCount} screens)
        </label>
      </div>
      
      {config.multiFrame?.generateFlow && (
        <div className="flow-options">
          <label>
            <input
              type="checkbox"
              checked={config.multiFrame?.includeNavigation}
              onChange={(e) => onChange({
                multiFrame: {
                  ...config.multiFrame,
                  includeNavigation: e.target.checked
                }
              })}
            />
            Include navigation between screens
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={config.multiFrame?.extractSharedComponents}
              onChange={(e) => onChange({
                multiFrame: {
                  ...config.multiFrame,
                  extractSharedComponents: e.target.checked
                }
              })}
            />
            Extract shared components
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={config.multiFrame?.generateStateManagement}
              onChange={(e) => onChange({
                multiFrame: {
                  ...config.multiFrame,
                  generateStateManagement: e.target.checked
                }
              })}
            />
            Generate state management
          </label>
        </div>
      )}
    </div>
  );
};
```

## 6. Data Models

### 6.1 Complete Property Schema

```typescript
interface ExtractedProperties {
  visual: {
    colors: {
      fills: ColorStop[];
      strokes: ColorStop[];
      gradients: GradientDefinition[];
      palette: DesignToken<Color>[];
    };
    typography: {
      textStyles: TextStyle[];
      fontFamilies: string[];
      hierarchy: TypographyScale;
    };
    effects: {
      shadows: ShadowEffect[];
      blurs: BlurEffect[];
      overlays: OverlayEffect[];
    };
    borders: {
      radius: BorderRadius;
      width: number;
      style: BorderStyle;
      color: Color;
    };
  };
  
  layout: {
    positioning: PositionData;
    flexbox: FlexboxData;
    grid: GridData;
    spacing: SpacingData;
    constraints: ConstraintData;
    responsive: ResponsiveData;
  };
  
  structure: {
    hierarchy: NodeTree;
    components: ComponentData[];
    variants: VariantData[];
    semantics: SemanticData;
  };
  
  interactions: {
    prototypes: PrototypeData[];
    transitions: TransitionData[];
    states: StateData[];
  };
  
  assets: {
    images: ImageAsset[];
    icons: IconAsset[];
    vectors: VectorAsset[];
  };
  
  tokens: {
    colors: DesignToken<Color>[];
    typography: DesignToken<TextStyle>[];
    spacing: DesignToken<number>[];
    effects: DesignToken<Effect>[];
  };
  
  metadata: {
    artboardInfo: ArtboardData;
    deviceTargets: DeviceTarget[];
    designSystem: DesignSystemData;
    accessibility: AccessibilityData;
  };
}
```

## 7. Integration Features

### 7.1 IDE Integration

```typescript
class IDEIntegration {
  generateCursorPrompt(properties: ExtractedProperties): string {
    return `
# Cursor AI Instructions

Generate a ${this.config.framework} component based on these specifications:

\`\`\`json
${JSON.stringify(properties, null, 2)}
\`\`\`

Requirements:
- Use ${this.config.styling.method} for styling
- Make it responsive
- Include proper TypeScript types
- Add accessibility attributes
    `;
  }
  
  generateWindsurfPrompt(properties: ExtractedProperties): string {
    return `
@windsurf Create a component with these specifications:

${this.formatPropertiesForWindsurf(properties)}

Please generate:
1. Component file
2. Styles file
3. Type definitions
4. Usage example
    `;
  }
}
```

### 7.2 Export Formats

```typescript
interface ExportResult {
  prompt: string;
  code?: {
    component: string;
    styles: string;
    types?: string;
    tests?: string;
  };
  assets: AssetExport[];
  designTokens?: DesignTokenExport;
  documentation?: string;
}

class ExportFormatter {
  formatForClipboard(result: ExportResult): string {
    return [
      '# AI Code Generation Prompt',
      '',
      result.prompt,
      '',
      '---',
      '',
      '# Generated Code (Reference)',
      result.code ? this.formatCode(result.code) : 'Code will be generated by AI',
      '',
      '# Assets',
      this.formatAssets(result.assets)
    ].join('\n');
  }
}
```

## 8. Plugin Manifest

```json
{
  "name": "AI Code Export",
  "id": "ai-code-export",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "capabilities": ["inspect"],
  "enableProposedApi": false,
  "editorType": ["figma"],
  "permissions": ["currentuser"],
  "parameters": [
    {
      "name": "Export Selection",
      "key": "exportSelection",
      "allowFreeform": true
    }
  ]
}
```

## 9. Implementation Roadmap

### Phase 1: Core Architecture
- [ ] Basic plugin structure
- [ ] Configuration system
- [ ] Simple property extraction
- [ ] Basic export functionality

### Phase 2: Advanced Extraction
- [ ] Comprehensive property extractors
- [ ] Design token generation
- [ ] Component variant detection
- [ ] Responsive layout analysis

### Phase 3: AI Integration
- [ ] LLM-specific prompt templates
- [ ] IDE integration helpers
- [ ] Advanced prompt engineering
- [ ] Context optimization

### Phase 4: Polish & Features
- [ ] Asset export and optimization
- [ ] Accessibility analysis
- [ ] Design system integration
- [ ] Collaboration features

## 10. Selection-Specific Usage Examples

### 10.1 Single Frame Export
```typescript
// User selects a single frame with auto layout
const frameSelection: SelectionContext = {
  type: 'single-frame',
  nodes: [frameNode],
  structure: 'single-screen',
  hasAutoLayout: true,
  isResponsive: true,
  isComponent: false
};

// Generated prompt includes:
// - Auto layout properties (direction, spacing, alignment)
// - Responsive behavior instructions
// - Flexbox implementation guidance
// - Component structure with proper nesting
```

### 10.2 Component with Variants Export
```typescript
// User selects a component with multiple variants
const componentSelection: SelectionContext = {
  type: 'component',
  nodes: [componentNode],
  structure: 'component',
  componentData: {
    isMainComponent: true,
    isInstance: false,
    hasVariants: true,
    variantProperties: {
      'State': 'Default',
      'Size': 'Medium',
      'Type': 'Primary'
    }
  }
};

// Generated prompt includes:
// - Variant prop definitions
// - TypeScript interfaces for props
// - Conditional styling based on variants
// - Component API documentation
```

### 10.3 Multi-Frame User Flow Export
```typescript
// User selects multiple connected frames
const multiFrameSelection: SelectionContext = {
  type: 'multiple-frames',
  nodes: [frame1, frame2, frame3],
  structure: 'screen-flow',
  isUserFlow: true,
  screens: 3
};

// Generated prompt includes:
// - Navigation structure between screens
// - Shared component extraction
// - State management recommendations
// - Routing implementation
// - Consistent design system application
```

### 10.4 Section Export (Multi-Page Flow)
```typescript
// User selects an entire section
const sectionSelection: SelectionContext = {
  type: 'section',
  nodes: [sectionNode],
  structure: 'multi-page-flow',
  pages: [onboardingFrame1, onboardingFrame2, onboardingFrame3],
  sections: 1
};

// Generated prompt includes:
// - Complete flow implementation
// - Progress tracking between pages
// - Shared layout components
// - Data persistence across flow
// - Form handling and validation
```

### 10.5 Group Export
```typescript
// User selects a group of related elements
const groupSelection: SelectionContext = {
  type: 'group',
  nodes: [groupNode],
  structure: 'grouped-elements',
  groupedItems: {
    totalItems: 5,
    itemTypes: ['RECTANGLE', 'TEXT', 'ELLIPSE'],
    hasNestedGroups: false,
    bounds: { width: 300, height: 200 },
    arrangement: 'grid'
  }
};

// Generated prompt includes:
// - Grid/flexbox layout for arrangement
// - Relative positioning maintenance
// - Group-level styling and effects
// - Component composition patterns
```

## 11. Advanced Selection Handling

### 11.1 Smart Selection Enhancement
```typescript
class SmartSelectionEnhancer {
  enhanceSelection(selection: SceneNode[]): SceneNode[] {
    // Auto-include related elements
    const enhanced = [...selection];
    
    selection.forEach(node => {
      // Include component instances of selected main components
      if (node.type === 'COMPONENT') {
        const instances = this.findComponentInstances(node);
        enhanced.push(...instances);
      }
      
      // Include parent frame if only children are selected
      if (this.shouldIncludeParent(node, selection)) {
        enhanced.push(node.parent as SceneNode);
      }
      
      // Include sibling elements that form logical groups
      const siblings = this.findLogicalSiblings(node);
      enhanced.push(...siblings);
    });
    
    return [...new Set(enhanced)]; // Remove duplicates
  }
  
  private findLogicalSiblings(node: SceneNode): SceneNode[] {
    if (!node.parent || node.parent.type !== 'FRAME') return [];
    
    const parent = node.parent as FrameNode;
    const siblings = parent.children;
    
    // Find elements that follow similar naming patterns
    const nodeBaseName = this.extractBaseName(node.name);
    return siblings.filter(sibling => 
      sibling !== node && 
      this.extractBaseName(sibling.name) === nodeBaseName
    );
  }
}
```

### 11.2 Selection Validation
```typescript
class SelectionValidator {
  validate(selection: SceneNode[]): ValidationResult {
    const issues: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check for common issues
    if (this.hasIncompleteAutoLayout(selection)) {
      warnings.push({
        type: 'incomplete-auto-layout',
        message: 'Some auto layout containers have mixed children',
        suggestion: 'Select the complete auto layout container'
      });
    }
    
    if (this.hasUnexportableElements(selection)) {
      issues.push({
        type: 'unexportable-elements',
        message: 'Selection contains elements that cannot be exported',
        affectedNodes: this.getUnexportableElements(selection)
      });
    }
    
    if (this.hasMissingAssets(selection)) {
      warnings.push({
        type: 'missing-assets',
        message: 'Some images may not be accessible for export',
        suggestion: 'Ensure all images are published or use placeholder URLs'
      });
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      canProceed: true
    };
  }
}
```

### 11.3 Selection Context Persistence
```typescript
class SelectionContextManager {
  private contextHistory: SelectionContextHistory[] = [];
  
  saveContext(context: SelectionContext, config: ExportConfig): void {
    this.contextHistory.push({
      timestamp: Date.now(),
      context,
      config,
      nodeIds: context.nodes.map(n => n.id)
    });
    
    // Keep only last 10 selections
    if (this.contextHistory.length > 10) {
      this.contextHistory.shift();
    }
  }
  
  restoreContext(nodeIds: string[]): SelectionContext | null {
    const nodes = nodeIds.map(id => figma.getNodeById(id)).filter(Boolean);
    if (nodes.length === 0) return null;
    
    const analyzer = new SelectionAnalyzer();
    return analyzer.analyze(nodes);
  }
  
  getRecentSelections(): SelectionContextHistory[] {
    return this.contextHistory.slice(-5);
  }
}
```

This comprehensive architecture now fully supports all types of Figma selections and provides intelligent handling for each scenario. The plugin adapts its extraction methods, UI, and output based on what the user has selected, making it much more intuitive and powerful for different design workflows.