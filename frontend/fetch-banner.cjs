const https = require('https');
https.get('https://thanhnien.vn/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/https:\/\/images2\.thanhnien\.vn\/[^<>\s"';]+\.(png|jpg|webp|jpeg)/g);
    if (matches) {
      const unique = [...new Set(matches)];
      const banner = unique.find(u => u.includes('nghi-quyet') || u.includes('bg-') || u.includes('event'));
      console.log('BANNER URL:', banner || unique[0]);
    } else {
      console.log('No matches');
    }
  });
}).on('error', err => console.log('Error: ', err.message));
