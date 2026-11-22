const express = require('express');
const serviceRoutes = require('./services/generator');
const app = express();

app.use(express.json());
app.use('/services', serviceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Marketplace API running on port ${PORT}`));

module.exports = app;