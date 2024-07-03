$(document).ready(function() {
    $('#luaForm').submit(function(e) {
        e.preventDefault();

        var luaContent = $('#luaText').val();

        if (!luaContent.trim()) {
            alert("Please paste the content of BagBrother.lua.");
            return;
        }

        try {
            var brotherBagsJson = luaToJson(luaContent);
            console.log('Parsed JSON:', brotherBagsJson);
            displayData(brotherBagsJson);
        } catch (error) {
            console.error('Error parsing Lua:', error);
            alert('Error parsing Lua: ' + error);
        }
    });

    function luaToJson(luaContent) {
        const jsonResult = {};
        const regex = /(\w+)\s*=\s*{([^}]*)}/g;
        let match;

        while ((match = regex.exec(luaContent)) !== null) {
            const key = match[1];
            const content = match[2];
            jsonResult[key] = parseLuaTable(content);
        }

        return { BrotherBags: jsonResult };
    }

    function parseLuaTable(tableContent) {
        const result = {};
        const itemRegex = /"(\d+)::::::::(\d*):[^"]*";(\d*)/g;
        let match;

        while ((match = itemRegex.exec(tableContent)) !== null) {
            const itemId = match[1];
            const itemCount = match[3] || 1;
            result[itemId] = itemCount;
        }

        return result;
    }

    function displayData(data) {
        var output = $('#output');
        output.empty();

        if (data && data.BrotherBags) {
            for (var character in data.BrotherBags) {
                var characterData = data.BrotherBags[character];
                var items = {};

                for (var bag in characterData) {
                    var bagData = characterData[bag];

                    for (var slot in bagData) {
                        if (slot !== 'size' && slot !== 'link') {
                            var itemString = bagData[slot];
                            var [itemId, itemCount] = itemString.split(';');

                            itemId = itemId.split('::::::::')[0];
                            itemCount = parseInt(itemCount) || 1;

                            if (!items[itemId]) {
                                items[itemId] = 0;
                            }

                            items[itemId] += itemCount;
                        }
                    }
                }

                for (var itemId in items) {
                    var item = classicitems.find(item => item.itemId == itemId);

                    if (item) {
                        var itemName = item.name;
                        var itemIcon = item.icon;
                        var itemCount = items[itemId];
                        var itemQuality = item.quality.toLowerCase();
                        var itemClass = itemQuality === 'common' ? 'white' :
                                        itemQuality === 'uncommon' ? 'zold' :
                                        itemQuality === 'rare' ? 'rare' :
                                        itemQuality === 'epic' ? 'epic' :
                                        itemQuality === 'legendary' ? 'legendary' : '';

                        var itemLink = `<a class="${itemClass}" href="https://classic.wowhead.com/item=${itemId}" target="_blank">
                                          <img src="https://wow.zamimg.com/images/wow/icons/small/${itemIcon}.jpg" alt="${itemName}" />
                                          ${itemName}
                                        </a>`;

                        output.append(`<div>${itemCount}x ${itemLink}</div>`);
                    }
                }
            }
        } else {
            console.error('No BrotherBags data found');
            alert('No BrotherBags data found');
        }
    }
});
