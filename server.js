const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const { LuaRuntime } = require('lupa');

const app = express();
const upload = multer({ dest: 'uploads/' });
const lua = new LuaRuntime();

app.use(express.static('public'));

app.post('/upload', upload.single('luaFile'), (req, res) => {
    const luaContent = fs.readFileSync(req.file.path, 'utf8');
    lua.execute(luaContent);

    const brotherBags = lua.globals().BrotherBags;
    const brotherBagsDict = luaTableToDict(brotherBags);

    fs.writeFileSync('uploads/BrotherBags.json', JSON.stringify(brotherBagsDict, null, 4));

    res.sendStatus(200);
});

function luaTableToDict(luaTable) {
    if (typeof luaTable === 'object' && luaTable !== null) {
        if (Array.isArray(luaTable)) {
            return luaTable.map(item => luaTableToDict(item));
        } else {
            const dict = {};
            for (const [key, value] of Object.entries(luaTable)) {
                dict[key] = luaTableToDict(value);
            }
            return dict;
        }
    } else {
        return luaTable;
    }
}

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
