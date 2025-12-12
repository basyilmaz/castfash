#!/usr/bin/env node

/**
 * Dropdown Migration Script
 * Converts all <select> elements to <Select> component
 * 
 * Usage: node migrate-dropdowns.js
 */

const fs = require('fs');
const path = require('path');

// Files to migrate
const filesToMigrate = [
    'frontend/src/app/(system-admin)/system-admin/users/page.tsx',
    'frontend/src/app/(system-admin)/system-admin/services/page.tsx',
    'frontend/src/app/(system-admin)/system-admin/products/page.tsx',
    'frontend/src/app/(system-admin)/system-admin/organizations/page.tsx',
    'frontend/src/app/(system-admin)/system-admin/models/page.tsx',
    'frontend/src/app/(system-admin)/system-admin/generations/page.tsx',
    'frontend/src/app/(system-admin)/system-admin/audit-logs/page.tsx',
];

// Add Select import if not exists
function addSelectImport(content) {
    if (content.includes('import { Select }')) {
        return content;
    }

    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
            lastImportIndex = i;
        }
    }

    if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, 'import { Select } from "@/components/ui/Select";');
        return lines.join('\n');
    }

    return content;
}

// Convert select to Select component
function convertSelectToComponent(content) {
    // Pattern 1: Simple select with label wrapper
    const labelSelectPattern = /<label className="[^"]*">\s*([^<]+)\s*<select\s+([^>]*)>\s*((?:<option[^>]*>.*?<\/option>\s*)*)<\/select>\s*<\/label>/gs;

    content = content.replace(labelSelectPattern, (match, labelText, selectAttrs, options) => {
        // Extract attributes
        const valueMatch = selectAttrs.match(/value=\{([^}]+)\}/);
        const onChangeMatch = selectAttrs.match(/onChange=\{([^}]+)\}/);
        const requiredMatch = selectAttrs.match(/required/);

        if (!valueMatch || !onChangeMatch) return match;

        // Extract options
        const optionMatches = [...options.matchAll(/<option\s+value=["']?([^"'>]+)["']?\s*>([^<]+)<\/option>/g)];

        if (optionMatches.length === 0) return match;

        const optionsArray = optionMatches.map(([, value, label]) => {
            return `{ value: '${value}', label: '${label.trim()}' }`;
        }).join(',\n              ');

        const placeholder = optionMatches[0][2].includes('Seçiniz') || optionMatches[0][2].includes('Tümü')
            ? `placeholder="${optionMatches[0][2].trim()}"`
            : '';

        return `<Select
            label="${labelText.trim()}"
            ${requiredMatch ? 'required' : ''}
            value={${valueMatch[1]}}
            onChange={${onChangeMatch[1]}}
            options={[
              ${optionsArray}
            ]}
            ${placeholder}
          />`;
    });

    // Pattern 2: Select without label wrapper
    const selectPattern = /<select\s+([^>]*)>\s*((?:<option[^>]*>.*?<\/option>\s*)*)<\/select>/gs;

    content = content.replace(selectPattern, (match, selectAttrs, options) => {
        // Skip if already converted
        if (match.includes('Select')) return match;

        const valueMatch = selectAttrs.match(/value=\{([^}]+)\}/);
        const onChangeMatch = selectAttrs.match(/onChange=\{([^}]+)\}/);

        if (!valueMatch || !onChangeMatch) return match;

        const optionMatches = [...options.matchAll(/<option\s+value=["']?([^"'>]+)["']?\s*>([^<]+)<\/option>/g)];

        if (optionMatches.length === 0) return match;

        const optionsArray = optionMatches.map(([, value, label]) => {
            return `{ value: '${value}', label: '${label.trim()}' }`;
        }).join(',\n            ');

        return `<Select
            value={${valueMatch[1]}}
            onChange={${onChangeMatch[1]}}
            options={[
              ${optionsArray}
            ]}
          />`;
    });

    return content;
}

// Process a single file
function processFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`❌ File not found: ${filePath}`);
        return false;
    }

    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        const originalContent = content;

        // Add import
        content = addSelectImport(content);

        // Convert selects
        content = convertSelectToComponent(content);

        // Only write if changed
        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Migrated: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  No changes: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
function main() {
    console.log('🚀 Starting dropdown migration...\n');

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    filesToMigrate.forEach(file => {
        const result = processFile(file);
        if (result === true) migrated++;
        else if (result === false) skipped++;
        else failed++;
    });

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total: ${filesToMigrate.length}`);
}

main();
