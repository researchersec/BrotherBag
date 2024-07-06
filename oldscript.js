$(document).ready(function() {
    // Fetch the JSON data for character inventories and item prices
    $.when(
        $.getJSON("BrotherBags.json"),
        $.getJSON("latest.json")
    ).done(function(brotherBagsData, latestData) {
        brotherBagsData = brotherBagsData[0];
        latestData = latestData[0];

        var itemPrices = {};
        var characterValues = {};

        // Process the pricing data
        latestData.pricing_data.forEach(function(priceData) {
            itemPrices[priceData.itemId] = priceData.minBuyout;
        });

        // Process the JSON data and create tables for each character
        for (var name in brotherBagsData) {
            if (brotherBagsData.hasOwnProperty(name)) {
                for (var realm in brotherBagsData[name]) {
                    if (brotherBagsData[name].hasOwnProperty(realm)) {
                        var details = brotherBagsData[name][realm];
                        var tableHtml = createCharacterTable(name, realm, details, itemPrices);
                        $('#characters-container').append(tableHtml);

                        // Calculate total value for the character
                        var totalValue = calculateCharacterValue(details, itemPrices);
                        characterValues[name + '-' + realm] = totalValue;
                    }
                }
            }
        }

        // Populate the name filter dropdown
        var nameFilter = $('#name-filter');
        for (var character in characterValues) {
            nameFilter.append(new Option(character, character));
        }

        // Apply name filter
        $('#name-filter').on('change', function() {
            var selectedName = $(this).val();
            if (selectedName) {
                $('.character-table-container').hide();
                $('[data-character="' + selectedName + '"]').show();
            } else {
                $('.character-table-container').show();
            }
        });

        // Calculate and display statistics
        displayStatistics(characterValues);
    });

    // Function to create a character table
    function createCharacterTable(name, realm, details, itemPrices) {
        var items = processCharacterDetails(details);

        var html = '<div class="character-table-container" data-character="' + name + '-' + realm + '">';
        html += '<h3>' + name + ' - ' + realm + '</h3>';
        html += '<table class="character-table"><thead><tr><th>Item</th><th>Count</th><th>Price (g)</th><th>Total (g)</th></tr></thead><tbody>';

        var totalValue = 0;
        for (var itemId in items) {
            if (items.hasOwnProperty(itemId)) {
                var itemCount = items[itemId];
                var itemDetails = findItemDetails(itemId);
                if (itemDetails) {
                    var itemName = itemDetails.name;
                    var itemLink = 'https://classic.wowhead.com/item=' + itemId;
                    var itemIcon = 'https://wow.zamimg.com/images/wow/icons/small/' + itemDetails.icon + '.jpg';
                    var itemPrice = itemPrices[itemId] ? (itemPrices[itemId] / 10000).toFixed(2) : 'N/A';
                    var itemTotal = itemPrices[itemId] ? (itemCount * itemPrices[itemId] / 10000).toFixed(2) : 'N/A';
                    totalValue += itemPrices[itemId] ? itemCount * itemPrices[itemId] : 0;

                    html += '<tr>';
                    html += '<td style="text-align: left; padding-left: 10px;"><img class="icon" src="' + itemIcon + '" alt="" /> <a class="' + getItemClass(itemDetails.quality) + '" href="' + itemLink + '" rel="nofollow" target="_blank">' + itemName + '</a></td>';
                    html += '<td>' + itemCount + '</td>';
                    html += '<td>' + itemPrice + '</td>';
                    html += '<td>' + itemTotal + '</td>';
                    html += '</tr>';
                } else {
                    html += '<tr>';
                    html += '<td>' + itemId + '</td>';
                    html += '<td>' + itemCount + '</td>';
                    html += '<td>N/A</td>';
                    html += '<td>N/A</td>';
                    html += '</tr>';
                }
            }
        }

        html += '</tbody><tfoot><tr><th colspan="3">Total</th><th>' + (totalValue / 10000).toFixed(2) + 'g</th></tr></tfoot></table>';
        html += '</div>';
        return html;
    }

    // Function to process character details and aggregate item quantities
    function processCharacterDetails(details) {
        var items = {};
        for (var key in details) {
            if (details.hasOwnProperty(key)) {
                if (typeof details[key] === 'object' && details[key] !== null) {
                    processBags(details[key], items);
                }
            }
        }
        return items;
    }

    // Function to process bags and aggregate item quantities
    function processBags(bag, items) {
        for (var key in bag) {
            if (bag.hasOwnProperty(key) && key !== 'size' && key !== 'link') {
                var item = bag[key];
                if (typeof item === 'string') {
                    var itemData = item.split(';');
                    var itemId = itemData[0].split(':')[0];
                    var itemCount = parseInt(itemData[1]) || 1; // Convert count to integer, default to 1
                    if (items[itemId]) {
                        items[itemId] += itemCount;
                    } else {
                        items[itemId] = itemCount;
                    }
                }
            }
        }
    }

    // Function to find item details from wowclassic.js
    function findItemDetails(itemId) {
        for (var i = 0; i < classicitems.length; i++) {
            if (classicitems[i].itemId === parseInt(itemId)) {
                return classicitems[i];
            }
        }
        return null;
    }

    // Function to get item class based on quality
    function getItemClass(quality) {
        switch (quality) {
            case 'Common':
                return 'white';
            case 'Uncommon':
                return 'zold';
            case 'Rare':
                return 'rare';
            case 'Epic':
                return 'epic';
            case 'Legendary':
                return 'legendary';
            default:
                return 'white';
        }
    }

    // Function to calculate the total value of a character's inventory
    function calculateCharacterValue(details, itemPrices) {
        var items = processCharacterDetails(details);
        var totalValue = 0;

        for (var itemId in items) {
            if (items.hasOwnProperty(itemId) && itemPrices[itemId]) {
                totalValue += items[itemId] * itemPrices[itemId];
            }
        }

        return totalValue;
    }

    // Function to display statistics
    function displayStatistics(characterValues) {
        var totalValue = 0;
        var mostValueCharacter = '';
        var highestValue = 0;

        for (var character in characterValues) {
            if (characterValues.hasOwnProperty(character)) {
                totalValue += characterValues[character];
                if (characterValues[character] > highestValue) {
                    highestValue = characterValues[character];
                    mostValueCharacter = character;
                }
            }
        }

        $('#total-value').text((totalValue / 10000).toFixed(2) + 'g');
        $('#most-value-character').text(mostValueCharacter + ' (' + (highestValue / 10000).toFixed(2) + 'g)');
    }
});
