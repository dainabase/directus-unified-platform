# 📚 Components Guide

## KPI Cards

### Basic KPI Card
```html
<div class="kpi-card animate-in">
    <div class="kpi-label">USERS ACTIVE</div>
    <div class="kpi-value" data-counter="1250">0</div>
    <div class="kpi-change positive">
        <i class="ti ti-trending-up"></i> +23.5%
    </div>
</div>
```

### KPI Card with Currency
```html
<div class="kpi-card animate-in delay-1">
    <div class="kpi-label">REVENUE TOTAL</div>
    <div class="kpi-value">CHF <span data-counter="125842">0</span></div>
    <div class="kpi-change positive">
        <i class="ti ti-trending-up"></i> +12.5%
    </div>
</div>
```

### KPI Card with Percentage
```html
<div class="kpi-card animate-in delay-2">
    <div class="kpi-label">AI ACCURACY</div>
    <div class="kpi-value">98.7%</div>
    <div class="kpi-change positive">
        <i class="ti ti-circle-check"></i> Optimal
    </div>
</div>
```

## Buttons

### Glass Button
```html
<button class="btn btn-glass">
    <i class="ti ti-plus"></i> Action
</button>
```

### Primary Glass Button
```html
<button class="btn btn-glass btn-primary">
    <i class="ti ti-arrow-right"></i> Primary Action
</button>
```

### Icon Button
```html
<button class="btn btn-glass btn-icon">
    <i class="ti ti-bell"></i>
</button>
```

## Cards

### Basic Glass Card
```html
<div class="card glass-card">
    <div class="card-header">
        <h3 class="card-title">Card Title</h3>
    </div>
    <div class="card-body">
        Content goes here
    </div>
</div>
```

### Glass Card with Actions
```html
<div class="card glass-card">
    <div class="card-header">
        <h3 class="card-title">Analytics</h3>
        <div class="card-actions">
            <a href="#" class="btn btn-glass btn-sm">7 days</a>
            <a href="#" class="btn btn-glass btn-sm active">30 days</a>
        </div>
    </div>
    <div class="card-body">
        <div id="chart"></div>
    </div>
</div>
```

## Tables

### Glass Table
```html
<table class="table table-glass table-vcenter">
    <thead>
        <tr>
            <th>Document</th>
            <th>Status</th>
            <th>Progress</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Invoice_001.pdf</td>
            <td>
                <span class="badge bg-success">Completed</span>
            </td>
            <td>100%</td>
        </tr>
    </tbody>
</table>
```

## Navigation

### Sidebar Item
```html
<a href="#" class="nav-link glass-card px-3 py-2">
    <span class="nav-link-icon">
        <i class="ti ti-dashboard"></i>
    </span>
    <span class="nav-link-title">Dashboard</span>
</a>
```

### Active Sidebar Item
```html
<a href="#" class="nav-link glass-card px-3 py-2 active">
    <span class="nav-link-icon">
        <i class="ti ti-scan"></i>
    </span>
    <span class="nav-link-title">OCR Processing</span>
    <span class="badge badge-sm bg-green-lt ms-auto">AI</span>
</a>
```

## Progress Bars

### Glass Progress
```html
<div class="glass-progress">
    <div class="glass-progress-bar bg-success" style="width: 75%"></div>
</div>
```

### System Status Card
```html
<div class="card glass-card">
    <div class="card-body">
        <div class="d-flex align-items-center">
            <div class="subheader">CPU Usage</div>
            <div class="ms-auto">
                <span class="text-green">42%</span>
            </div>
        </div>
        <div class="progress progress-sm mt-2">
            <div class="progress-bar bg-green" style="width: 42%"></div>
        </div>
    </div>
</div>
```

## Badges

### Glass Badge
```html
<span class="badge badge-glass">Default</span>
```

### Gradient Badge
```html
<span class="badge badge-gradient">AI</span>
```

### Status Badges
```html
<span class="badge bg-success">Completed</span>
<span class="badge bg-warning">Processing</span>
<span class="badge bg-danger">Failed</span>
```

## Avatar

### Glass Avatar
```html
<div class="avatar avatar-sm glass">JM</div>
```

### Avatar with Icon
```html
<span class="avatar glass-card">
    <i class="ti ti-user"></i>
</span>
```

## Activity Feed

```html
<div class="divide-y">
    <div class="row py-3">
        <div class="col-auto">
            <span class="avatar glass-card">AI</span>
        </div>
        <div class="col">
            <div class="text-truncate">
                <strong>OCR Processing</strong> completed 47 documents
            </div>
            <div class="text-muted">2 min ago</div>
        </div>
    </div>
</div>
```

## Animation Classes

- `.animate-in` - Fade in animation
- `.delay-1` to `.delay-5` - Animation delays
- `.hover-lift` - Lift on hover
- `.pulse-glow` - Pulsing glow effect
- `.animate-float` - Floating animation

## Utility Classes

- `.glass` - Basic glass effect
- `.glass-card` - Card with glass effect
- `.gradient-text` - Gradient text effect
- `.text-gradient` - Alternative gradient text