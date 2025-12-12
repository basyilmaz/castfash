# Admin Panel - Tutarlı Tasarım Standardı

## 🎨 Tasarım Standartları

### 1. Modal Tasarımı

**Tüm modallerde kullanılacak standart:**

```tsx
// Modal Wrapper
<div 
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    onClick={onClose}
>
    <AppCard 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
    >
        <div className="p-6 space-y-6">
            {/* Modal Content */}
        </div>
    </AppCard>
</div>
```

**Özellikler:**
- `bg-black/70` - Koyu backdrop
- `backdrop-blur-sm` - Blur efekti
- `z-[100]` - Yüksek z-index
- `onClick={onClose}` - Backdrop'a tıklayınca kapat
- `stopPropagation` - Modal içine tıklayınca kapanmayı engelle

### 2. Empty State Tasarımı

**Standart Empty State:**

```tsx
<div className="text-center py-16">
    <div className="text-6xl mb-4">{emoji}</div>
    <div className="text-xl font-semibold mb-2">{title}</div>
    <div className="text-textMuted mb-6 max-w-md mx-auto">
        {description}
    </div>
    <AppButton onClick={action} variant="primary">
        {buttonText}
    </AppButton>
</div>
```

**Emoji Standartları:**
- Kullanıcılar: 👥
- Organizasyonlar: 🏢
- Ürünler: 👔
- Modeller: 🧑‍🎤
- Üretimler: 🎨
- Audit Logs: 📋
- Providers: 🤖
- Promptlar: 📝

### 3. Stats Cards

**Standart Stats Card:**

```tsx
<AppCard className="p-6">
    <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-textMuted">{label}</div>
        <div className="text-2xl">{icon}</div>
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-xs text-textMuted">{subtitle}</div>
</AppCard>
```

### 4. List Item Cards

**Standart List Item:**

```tsx
<AppCard className="p-6 hover:border-primary/30 transition-all cursor-pointer">
    <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                {badges}
            </div>
            <div className="text-sm text-textMuted">
                {metadata}
            </div>
        </div>
    </div>
    <div className="flex gap-2">
        {actions}
    </div>
</AppCard>
```

### 5. Form Elemanları

**Input Standartları:**

```tsx
// Text Input
<AppInput
    label="Label"
    value={value}
    onChange={onChange}
    placeholder="Placeholder"
/>

// Select
<select className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
    <option>Option</option>
</select>

// Textarea
<textarea className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono text-sm transition-all resize-none" />

// Checkbox
<div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
    <input type="checkbox" className="w-5 h-5 rounded border-border bg-card text-primary focus:ring-2 focus:ring-primary cursor-pointer" />
    <label className="text-sm font-medium cursor-pointer flex-1">Label</label>
</div>
```

### 6. Button Standartları

**Primary Action:**
```tsx
<AppButton variant="primary" onClick={action}>
    {icon} {text}
</AppButton>
```

**Secondary Action:**
```tsx
<AppButton variant="outline" onClick={action}>
    {icon} {text}
</AppButton>
```

**Danger Action:**
```tsx
<AppButton variant="danger" onClick={action}>
    {icon} {text}
</AppButton>
```

### 7. Badge Standartları

**Status Badges:**
- Aktif: `<AppBadge variant="success">Aktif</AppBadge>`
- Pasif: `<AppBadge variant="default">Pasif</AppBadge>`
- Hata: `<AppBadge variant="danger">Hata</AppBadge>`
- Beklemede: `<AppBadge variant="warning">Beklemede</AppBadge>`
- Bilgi: `<AppBadge variant="info">Bilgi</AppBadge>`

### 8. Spacing Standartları

**Page Layout:**
```tsx
<div className="space-y-6">
    {/* Header */}
    <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-textMuted">{description}</p>
    </div>
    
    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats}
    </div>
    
    {/* Filters */}
    <AppCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filters}
        </div>
    </AppCard>
    
    {/* Content */}
    <div className="space-y-4">
        {content}
    </div>
</div>
```

### 9. Loading States

**Skeleton Loader:**
```tsx
<div className="animate-pulse">
    <div className="h-4 bg-surface rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-surface rounded w-1/2"></div>
</div>
```

**Spinner:**
```tsx
<div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
</div>
```

### 10. Responsive Breakpoints

**Grid Standartları:**
- Mobile: `grid-cols-1`
- Tablet: `md:grid-cols-2`
- Desktop: `lg:grid-cols-3` veya `lg:grid-cols-4`

**Padding/Margin:**
- Mobile: `p-4`, `gap-4`
- Desktop: `md:p-6`, `md:gap-6`

---

## ✅ Checklist - Tüm Sayfalar

### Dashboard
- [x] Stats cards
- [x] Empty states
- [x] Loading states

### Kullanıcılar
- [x] List view
- [x] Detail view
- [x] Create modal
- [x] Empty state

### Organizasyonlar
- [x] List view
- [x] Detail view
- [x] Create modal
- [x] Empty state

### Ürünler
- [x] Grid view
- [x] Detail view
- [x] Empty state

### Modeller
- [x] Grid view
- [x] Detail view
- [x] Empty state

### Üretimler
- [x] List view
- [x] Detail view
- [x] Empty state

### Audit Logs
- [x] List view
- [x] Filters
- [x] Empty state

### Raporlar
- [x] Charts
- [x] Stats
- [x] Empty state

### Servis Ayarları
- [x] Provider modal ✨ (Yeni düzeltildi)
- [x] Empty state
- [x] Stats

### Prompt Ayarları
- [ ] Template modal (Yapılacak)
- [ ] Preset modal (Yapılacak)
- [ ] Empty states (Yapılacak)

---

## 🎯 Sonraki Adımlar

1. **Tüm modalleri standartlaştır**
   - Users create/edit modal
   - Organizations create/edit modal
   - Template modal
   - Preset modal

2. **Tüm empty state'leri standartlaştır**
   - Aynı emoji sistemi
   - Aynı spacing
   - Aynı button stili

3. **Loading state'leri ekle**
   - Skeleton loaders
   - Spinner'lar

4. **Responsive iyileştirmeler**
   - Mobile sidebar
   - Touch-friendly buttons
   - Responsive grids

---

Bu standartlar uygulandığında, tüm admin panel tutarlı ve profesyonel görünecek! 🎨✨
