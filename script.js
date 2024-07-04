$(document).ready(function() {
    $('#luaForm').submit(function(e) {
        e.preventDefault();

        var luaContent = $('#luaText').val();

        if (!luaContent.trim()) {
            log("Please paste the content of BagBrother.lua.");
            return;
        }

        try {
            var brotherBagsJson = luaToJson(luaContent);
            log('Parsed JSON: ' + JSON.stringify(brotherBagsJson, null, 2));
            displayData(brotherBagsJson);
        } catch (error) {
            log('Error parsing Lua: ' + error);
        }
    });

    function luaToJson(luaContent) {
        const jsonResult = {};
        const regex = /(\w+)\s*=\s*{([^}]*)}/gs;
        let match;

        while ((match = regex.exec(luaContent)) !== null) {
            const key = match[1];
            const content = match[2];
            log(`Parsing key: ${key}`);
            jsonResult[key] = parseLuaTable(content);
        }

        return { BrotherBags: jsonResult };
    }

    function parseLuaTable(tableContent) {
        const result = {};
        const itemRegex = /"([^"]+)"/g;
        let match;

        while ((match = itemRegex.exec(tableContent)) !== null) {
            const itemString = match[1];
            log(`Parsing item string: ${itemString}`);
            const [itemId, , , , , , , , , , itemCount] = itemString.split(':');
            result[itemId] = itemCount ? parseInt(itemCount) : 1;
        }

        return result;
    }

    function displayData(data) {
        var output = $('#output');
        output.empty();

        if (data && data.BrotherBags) {
            for (var character in data.BrotherBags) {
                var characterData = data.BrotherBags[character];
                var items = characterData[0] || {};

                for (var itemId in items) {
                    var itemCount = items[itemId];
                    var item = classicitems.find(item => item.itemId == itemId);

                    if (item) {
                        var itemName = item.name;
                        var itemIcon = item.icon;
                        var itemQuality = item.quality.toLowerCase();
                        var itemClass = itemQuality === 'common' ? 'white' :
                                        itemQuality === 'uncommon' ? 'zold' :
                                        itemQuality === 'rare' ? 'rare' :
                                        itemQuality === 'epic' ? 'epic' :
                                        itemQuality === 'legendary' ? 'legendary' : '';

                        var itemLink = `<a class="${itemClass}" href="https://wowhead.com/classic/item=${itemId}" target="_blank">
                                          <img src="https://wow.zamimg.com/images/wow/icons/small/${itemIcon}.jpg" alt
