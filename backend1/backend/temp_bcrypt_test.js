const bcrypt = require('bcryptjs');
const hash = '$2a$10$F4QlJQt4oY2WRzSuu2U1KudvVGhFQxT4H0DmUQRMOoCwjk8lJ.Ia6';
console.log('Hash length:', hash.length);
console.log('Hash starts with $2a$10$:', hash.startsWith('$2a$10$'));
bcrypt.compare('15/05/2003', hash).then(result => {
  console.log('bcrypt compare result:', result);
}).catch(err => {
  console.error('Error:', err);
});
