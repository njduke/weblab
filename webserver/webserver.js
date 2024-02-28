import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = 8080;
const app = express();

app.use(express.static(path.join(__dirname, 'browser')));

app.get('*', (req, res) => {
    console.log(`GET Request received by ${req.ip}`);
    res.sendFile(path.join(__dirname, 'browser/index.html'));
});

app.listen(port, () => {
    console.log(`Webserver running on port ${port}`);
});


