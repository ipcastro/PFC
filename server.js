require('dotenv').config();
const app = require('./app');
const { connectToDatabase } = require('./middleware/js/db');

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();