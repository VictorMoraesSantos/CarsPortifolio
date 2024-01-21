const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const host = process.env.HOST
const port = process.env.PORT;

app.listen(port, host, () => {
  console.log(`App running on port ${port}...`);
});
