const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Showcase running on http://localhost:${PORT}`);
  console.log(`📱 Components: 148 available`);
  console.log(`🎨 Storybook: http://localhost:6006`);
  console.log(`🚀 Dev mode: http://localhost:5173`);
});