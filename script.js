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
        try {
            var luaAST = luaparse.parse(luaContent);
            log('Lua AST: ' + JSON.stringify(luaAST, null, 2));
            var jsonResult = {};

            // Traverse the AST to extract BrotherBags
            luaAST.body.forEach(function(node) {
                if (node.type === 'AssignmentStatement') {
                    node.variables.forEach(function(variable, index) {
                        if (variable.name === 'BrotherBags') {
                            jsonResult.BrotherBags = traverseTable(node.init[index]);
                        }
                    });
                }
            });

            return jsonResult;
        } catch (error) {
            throw new Error('Failed to parse Lua: ' + error.message);
        }
    }

    function traverseTable(node) {
        var result = {};
        if (node.type === 'TableConstructorExpression') {
            node.fields.forEach(function(field) {
                if (field.key.type === 'Identifier' && field.value.type === 'TableConstructorExpression') {
                    result[field.key.name] = traverseTable(field.value);
                } else if (field.key.type === 'Identifier') {
                    result[field.key.name] = field.value.value;
                }
            });
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

                        var itemLink = `<a class="${itemClass}" href="https://classic.wowhead.com/item=${itemId}" target="_blank">
                                          <img src="https://wow.zamimg.com/images/wow/icons/small/${itemIcon}.jpg" alt="${itemName}" />
                                          ${itemName}
                                        </a>`;

                        output.append(`<div>${itemCount}x ${itemLink}</div>`);
                    }
                }
            }
        } else {
            log('No BrotherBags data found');
        }
    }

    function log(message) {
        var logDiv = $('#log');
        logDiv.append(message + '\n');
    }
});
