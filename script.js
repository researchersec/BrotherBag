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

            luaAST.body.forEach(function(node) {
                if (node.type === 'AssignmentStatement') {
                    node.variables.forEach(function(variable, index) {
                        if (variable.name === 'BrotherBags') {
                            jsonResult = traverseTable(node.init[index]);
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
                var key = getFieldKey(field.key);
                var value = getFieldValue(field.value);
                result[key] = value;
            });
        }
        return result;
    }

    function getFieldKey(key) {
        if (!key) return null;
        switch (key.type) {
            case 'Identifier':
            case 'StringLiteral':
                return key.raw.replace(/^"(.*)"$/, '$1');
            case 'NumericLiteral':
                return key.value.toString();
            default:
                return key.name;
        }
    }

    function getFieldValue(value) {
        if (!value) return null;
        switch (value.type) {
            case 'StringLiteral':
                return value.raw.replace(/^"(.*)"$/, '$1');
            case 'NumericLiteral':
            case 'BooleanLiteral':
                return value.value;
            case 'TableConstructorExpression':
                return traverseTable(value);
            case 'TableValue':
                return getFieldValue(value.value);
            default:
                return null;
        }
    }

    function displayData(data) {
        var output = $('#output');
        output.empty();

        if (typeof classicitems === 'undefined') {
            log('classicitems is not defined');
            return;
        }

        if (data) {
            Object.keys(data).forEach(function(server) {
                var serverData = data[server];
                Object.keys(serverData).forEach(function(character) {
                    var characterData = serverData[character];
                    var items = characterData["0"] || {};

                    for (var itemKey in items) {
                        if (itemKey === "size") continue;

                        var itemCount = items[itemKey];
                        var itemId = itemKey.split(':')[0];

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
                        } else {
                            output.append(`<div>${itemCount}x Item ID: ${itemId} (Item data not found)</div>`);
                        }
                    }
                });
            });
        } else {
            log('No BrotherBags data found');
        }
    }

    function log(message) {
        var logDiv = $('#log');
        logDiv.append(message + '\n');
    }
});
