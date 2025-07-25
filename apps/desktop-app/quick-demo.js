const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3003;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    // Serve the simple demo HTML
    fs.readFile(path.join(__dirname, 'simple-demo.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading demo');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🎉 HomeHost Desktop Demo is ready!`);
  console.log(`🌐 Open this URL in your browser:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n✨ You'll see the complete HomeHost Desktop interface!`);
});

// Keep server running
process.on('SIGINT', () => {
  console.log('\n👋 Demo server stopped');
  process.exit(0);
});