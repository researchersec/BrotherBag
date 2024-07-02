import json
from lupa import LuaRuntime

# Initialize Lua runtime
lua = LuaRuntime(unpack_returned_tuples=True)

# Read the Lua file content
with open("BagBrother.lua", "r") as file:
    lua_content = file.read()

# Execute the Lua content to load the table
lua.execute(lua_content)

# Access the BrotherBags table
brother_bags = lua.globals().BrotherBags


# Function to convert Lua tables to Python dictionaries
def lua_table_to_dict(lua_table):
    if type(lua_table) in [int, float, bool, str, type(None)]:
        return lua_table
    elif type(lua_table) == list or type(lua_table) == tuple:
        return [lua_table_to_dict(item) for item in lua_table]
    else:
        return {k: lua_table_to_dict(v) for k, v in lua_table.items()}


# Convert BrotherBags to a Python dictionary
brother_bags_dict = lua_table_to_dict(brother_bags)

# Print the resulting dictionary (for debugging purposes)
print(brother_bags_dict)

# Save the dictionary to a JSON file
with open("BrotherBags.json", "w") as json_file:
    json.dump(brother_bags_dict, json_file, indent=4)

print("Data saved to BrotherBags.json")
