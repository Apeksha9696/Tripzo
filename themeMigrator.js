const fs = require('fs');
const path = require('path');

const srcDirs = [
  path.join(__dirname, 'frontend', 'src', 'pages'),
  path.join(__dirname, 'frontend', 'src', 'components')
];

const processFiles = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processFiles(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Replace generic colors with brand colors
      // Primary maps
      content = content.replace(/bg-emerald-500/g, 'bg-brand-primary');
      content = content.replace(/text-emerald-500/g, 'text-brand-primary');
      content = content.replace(/border-emerald-500/g, 'border-brand-primary');
      content = content.replace(/from-emerald-600/g, 'from-brand-dark');
      content = content.replace(/to-emerald-500/g, 'to-brand-primary');
      content = content.replace(/shadow-emerald-[0-9]+\/?[0-9]*/g, 'shadow-brand-dark/30');
      
      // Secondary maps
      content = content.replace(/hover:bg-emerald-400/g, 'hover:bg-brand-secondary');
      content = content.replace(/text-emerald-400/g, 'text-brand-secondary');

      // Dark maps
      content = content.replace(/bg-emerald-600/g, 'bg-brand-dark');
      content = content.replace(/text-emerald-600/g, 'text-brand-dark');
      content = content.replace(/bg-emerald-700/g, 'bg-brand-dark');
      content = content.replace(/text-emerald-700/g, 'text-brand-dark');
      content = content.replace(/bg-emerald-800/g, 'bg-brand-dark');
      content = content.replace(/border-emerald-600/g, 'border-brand-dark');
      
      content = content.replace(/hover:bg-emerald-600/g, 'hover:bg-brand-secondary');

      // Light/BG maps
      content = content.replace(/bg-emerald-50/g, 'bg-brand-bg');
      content = content.replace(/hover:bg-emerald-50/g, 'hover:bg-brand-bg');
      content = content.replace(/bg-emerald-100/g, 'bg-brand-bg');
      content = content.replace(/bg-emerald-200/g, 'bg-brand-light');

      // Replace purple (used in AdminDashboard)
      content = content.replace(/purple-600/g, 'brand-primary');
      content = content.replace(/purple-700/g, 'brand-secondary');
      content = content.replace(/purple-800/g, 'brand-dark');
      content = content.replace(/purple-100/g, 'brand-bg');
      content = content.replace(/purple-200/g, 'brand-light');
      content = content.replace(/purple-500/g, 'brand-primary');

      // Replace blue (if any)
      content = content.replace(/blue-100/g, 'brand-bg');
      content = content.replace(/blue-700/g, 'brand-dark');

      // Replace generic Red (keep for deletes, but tone might change if they want strictly teal. Let's keep red for destrutive).
      // Standardize Spacing slightly (increase padding on cards)
      content = content.replace(/p-6 rounded-3xl/g, 'p-8 rounded-[2rem]');
      content = content.replace(/p-8 rounded-3xl/g, 'p-10 rounded-[2rem]');

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Processed: ${file}`);
    }
  }
};

srcDirs.forEach(dir => {
  if(fs.existsSync(dir)) {
    processFiles(dir);
  }
});

console.log('UI Theme Replacement complete!');
