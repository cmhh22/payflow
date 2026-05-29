import { config } from './config.js';
import app from './app.js';

app.listen(config.api.port, () => {
  console.log(`PayFlow API listening on port ${config.api.port}`);
});
