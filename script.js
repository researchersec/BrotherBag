$(document).ready(function() {
    // Fetch the JSON data
    $.getJSON("BrotherBags.json", function(brotherBagsData) {
        var tableData = [];
        var names = new Set();

        // Process the JSON data to fit into the table and collect unique names
        for (var name in brotherBagsData) {
            if (brotherBagsData.hasOwnProperty(name)) {
                names.add(name);
                for (var realm in brotherBagsData[name]) {
                    if (brotherBagsData[name].hasOwnProperty(realm)) {
                        var details = brotherBagsData[name][realm];
                        var detailsHtml = processCharacterDetails(details);
                        tableData.push([name, realm, detailsHtml]);
                    }
                }
            }
        }

        // Populate the name filter dropdown
        var nameFilter = $('#name-filter');
        names.forEach(function(name) {
            nameFilter.append(new Option(name, name));
        });

        // Initialize DataTables
        var dataTable = $('#data-table').DataTable({
            data: tableData,
            columns: [
                { title: "Name" },
                { title: "Realm" },
                { title: "Details" }
            ]
        });

        // Apply name filter
        $('#name-filter').on('change', function() {
            var selectedName = $(this).val();
            if (selectedName) {
                dataTable.column(0).search('^' + selectedName + '$', true, false).draw();
            } else {
                dataTable.column(0).search('').draw();
            }
        });
    });

    // Function to process character details and create Wowhead links with icons
    function processCharacterDetails(details) {
        var items = {};
        for (var key in details) {
            if (details.hasOwnProperty(key)) {
                if (typeof details[key] === 'object' && details[key] !== null) {
                    processBags(details[key], items);
                }
            }
        }

        var html = '<ul>';
        for (var itemId in items) {
            if (items.hasOwnProperty(itemId)) {
                var itemCount = items[itemId];
                var itemDetails = findItemDetails(itemId);
                if (itemDetails) {
                    var itemIcon = itemDetails.icon;
                    var itemName = itemDetails.name;
                    var itemLink = 'https://classic.wowhead.com/item=' + itemId;

                    // Generate HTML for each item
                    html += '<li>' + itemCount + 'x <a class="white" href="' + itemLink + '" rel="nofollow" target="_blank"><img align="absmiddle" alt class="icon" src="https://wow.zamimg.com/images/wow/icons/small/' + itemIcon + '.jpg">' + itemName + '</a></li>';
                } else {
                    html += '<li>' + itemCount + 'x ' + itemId + '</li>';
                }
            }
        }
        html += '</ul>';
        return html;
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
});
