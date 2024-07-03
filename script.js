$(document).ready(function() {
    // Load previously saved data if available
    if (localStorage.getItem('brotherBagsJson')) {
        var savedData = JSON.parse(localStorage.getItem('brotherBagsJson'));
        displayData(savedData);
    }

    $('#luaForm').submit(function(e) {
        e.preventDefault();

        var luaContent = $('#luaText').val();

        if (!luaContent.trim()) {
            alert("Please paste the content of BagBrother.lua.");
            return;
        }

        try {
            var brotherBagsJson = luaToJson(luaContent);
            localStorage.setItem('brotherBagsJson', JSON.stringify(brotherBagsJson));
            displayData(brotherBagsJson);
        } catch (error) {
            console.error('Error parsing Lua:', error);
            alert('Error parsing Lua: ' + error);
        }
    });

    function luaToJson(luaContent) {
        const jsonResult = {};

        // Convert the Lua table to JSON format
        luaContent.replace(/(\w+)\s*=\s*{([^}]+)}/g, (match, key, content) => {
            jsonResult[key] = parseLuaTable(content);
        });

        return jsonResult;
    }

    function parseLuaTable(tableContent) {
        const result = {};
        tableContent.replace(/(\w+)\s*=\s*["']?([^,"'}\s]+)["']?/g, (match, key, value) => {
            result[key] = value;
        });
        return result;
    }

    function displayData(data) {
        var output = $('#output');
        output.empty();

        for (var character in data) {
            var characterData = data[character];
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
    }
});
