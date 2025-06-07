# shadcn/ui Integration & Theming Guide

## 🎨 **Overview**

The Techie Skills Radar now uses **shadcn/ui** components for a consistent, themeable, and accessible design system. This provides:

- **Consistent Design Language**: All components follow the same design principles
- **Easy Theming**: Light/dark mode support with CSS variables
- **Accessibility**: Built-in ARIA attributes and keyboard navigation
- **Customization**: Easy to modify colors, spacing, and styling
- **Type Safety**: Full TypeScript support

## 🚀 **What's Been Integrated**

### **Core Components Added**
- ✅ **Card**: Main content containers
- ✅ **Button**: All interactive buttons with variants
- ✅ **Input/Textarea**: Form inputs with consistent styling
- ✅ **Label**: Form labels with proper associations
- ✅ **Select**: Dropdown selections
- ✅ **Checkbox**: Form checkboxes
- ✅ **Badge**: Status indicators and tags
- ✅ **Avatar**: User profile pictures
- ✅ **Dropdown Menu**: Context menus and user menus
- ✅ **Dialog**: Modal dialogs
- ✅ **Alert**: Error and info messages

### **Theme System**
- ✅ **CSS Variables**: Semantic color tokens
- ✅ **Light/Dark Mode**: Automatic theme switching
- ✅ **Theme Toggle**: User-controlled theme selection
- ✅ **System Preference**: Respects OS theme settings

## 🎯 **Key Features**

### **1. Semantic Color System**
```css
/* Light mode */
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--card: oklch(1 0 0);
--card-foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
--border: oklch(0.922 0 0);
--destructive: oklch(0.577 0.245 27.325);

/* Dark mode automatically applied */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... other dark mode colors */
}
```

### **2. Component Variants**
```tsx
// Button variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="destructive">Delete Action</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

### **3. Theme Toggle Component**
```tsx
import ThemeToggle from '@/components/theme/theme-toggle';

// Provides light/dark/system theme switching
<ThemeToggle />
```

## 🛠️ **Implementation Examples**

### **Before (Custom CSS)**
```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>
```

### **After (shadcn/ui)**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <Button>Action</Button>
  </CardContent>
</Card>
```

### **Benefits of the New Approach**
- **Semantic HTML**: Proper heading hierarchy and structure
- **Accessibility**: Built-in ARIA attributes
- **Theme Aware**: Automatically adapts to light/dark mode
- **Consistent**: Same styling across all cards
- **Type Safe**: TypeScript props and validation

## 🎨 **Customizing Themes**

### **1. Modify CSS Variables**
Edit `src/app/globals.css` to change the color scheme:

```css
:root {
  /* Change primary color */
  --primary: oklch(0.5 0.2 250); /* Blue primary */
  --primary-foreground: oklch(1 0 0);
  
  /* Change accent colors */
  --accent: oklch(0.9 0.1 120); /* Green accent */
  --accent-foreground: oklch(0.1 0 0);
}
```

### **2. Create Custom Variants**
Extend components with custom variants:

```tsx
// In your component file
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CustomButton = ({ className, ...props }) => (
  <Button 
    className={cn("bg-gradient-to-r from-purple-500 to-pink-500", className)}
    {...props}
  />
);
```

### **3. Brand Colors**
Add your brand colors to the theme:

```css
:root {
  --brand-primary: oklch(0.6 0.25 280);
  --brand-secondary: oklch(0.7 0.15 320);
}

@theme inline {
  --color-brand-primary: var(--brand-primary);
  --color-brand-secondary: var(--brand-secondary);
}
```

## 📱 **Responsive Design**

All components are responsive by default:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

## ♿ **Accessibility Features**

### **Built-in Accessibility**
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG compliant color combinations

### **Example: Accessible Form**
```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Name *</Label>
    <Input 
      id="name" 
      required 
      aria-describedby="name-error"
    />
    <p id="name-error" className="text-sm text-destructive">
      {error && "Name is required"}
    </p>
  </div>
</form>
```

## 🔧 **Development Workflow**

### **Adding New Components**
```bash
# Add individual components
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add tooltip

# Add multiple components
npx shadcn@latest add table tabs tooltip
```

### **Customizing Components**
1. Components are in `src/components/ui/`
2. Modify them directly for global changes
3. Create variants for specific use cases
4. Use `cn()` utility for conditional classes

### **Theme Development**
1. **Test in both modes**: Always check light and dark themes
2. **Use semantic tokens**: Prefer `text-foreground` over `text-black`
3. **Maintain contrast**: Ensure readability in all themes
4. **Test accessibility**: Use screen readers and keyboard navigation

## 🎯 **Best Practices**

### **1. Use Semantic Classes**
```tsx
// ✅ Good - semantic and theme-aware
<div className="bg-background text-foreground border-border">

// ❌ Avoid - hardcoded colors
<div className="bg-white text-black border-gray-200">
```

### **2. Consistent Spacing**
```tsx
// ✅ Good - consistent spacing scale
<div className="space-y-4 p-6">

// ❌ Avoid - arbitrary values
<div className="space-y-[17px] p-[23px]">
```

### **3. Component Composition**
```tsx
// ✅ Good - compose with shadcn/ui components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Action</Button>
  </CardContent>
</Card>

// ❌ Avoid - mixing custom and shadcn styles
<div className="custom-card">
  <Button>Action</Button>
</div>
```

## 🚀 **Next Steps**

### **Immediate Improvements**
1. **Convert remaining pages** to use shadcn/ui components
2. **Add loading states** with Skeleton components
3. **Implement data tables** with shadcn/ui Table component
4. **Add form validation** with proper error states

### **Advanced Features**
1. **Custom theme builder** for brand customization
2. **Component documentation** with Storybook
3. **Animation system** with Framer Motion
4. **Advanced layouts** with shadcn/ui layout components

### **Performance Optimizations**
1. **Tree shaking**: Only import used components
2. **CSS optimization**: Remove unused styles
3. **Bundle analysis**: Monitor component bundle sizes

## 📚 **Resources**

- **shadcn/ui Documentation**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Radix UI**: https://www.radix-ui.com/ (underlying primitives)
- **Lucide Icons**: https://lucide.dev/ (icon system)

## 🎨 **Theme Examples**

The application now supports easy theme switching. Users can:
- **Toggle between light/dark modes**
- **Use system preference** (automatic)
- **Customize colors** through CSS variables
- **Maintain accessibility** in all themes

This makes the application more user-friendly and professional, while providing a solid foundation for future design improvements.