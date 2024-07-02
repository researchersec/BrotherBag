const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const luaJson = require('lua-json'); // Import lua-json package
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const luaFilePath = file.path;

    fs.readFile(luaFilePath, 'utf8', (err, luaContent) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read Lua file' });
        }

        try {
            const brotherBagsJson = luaJson.parse(luaContent); // Convert Lua to JSON

            // Save the resulting JSON to a file (optional)
            const jsonFilePath = path.join(__dirname, 'uploads', `${file.originalname}.json`);
            fs.writeFileSync(jsonFilePath, JSON.stringify(brotherBagsJson, null, 4));

            res.json(brotherBagsJson);
        } catch (e) {
            res.status(500).json({ error: 'Failed to convert Lua to JSON' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
