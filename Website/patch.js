const fs = require('fs');
const path = require('path');
const views = [
  'auth/login.ejs', 'auth/register.ejs',
  'dashboard/index.ejs', 'transactions/index.ejs', 'transactions/simulate.ejs',
  'admin/users.ejs', 'profile/index.ejs',
  '404.ejs', 'error.ejs'
];
views.forEach(f => {
  const p = path.join(__dirname, 'backend', 'views', f);
  let content = fs.readFileSync(p, 'utf8');
  const includeStr = f.includes('/') ? "<%- include('../partials/foot') %>" : "<%- include('partials/foot') %>";
  if (!content.includes('foot')) {
    fs.writeFileSync(p, content + '\n' + includeStr);
  }
});
console.log('Templates updated');
