const fetch = require('node-fetch');
url = "https://discord.com/api/v8/applications/817541091724886028/commands"

json = {
    "name": "psimc",
    "description": "Send /server name/charecter name",
    "options": [
        {
            "name": "animal",
            "description": "The type of animal",
            "type": 3,
            "required": True,
        },
        {
            "name": "only_smol",
            "description": "Whether to show only baby animals",
            "type": 5,
            "required": False
        }
    ]
}

headers = {
    "Authorization": "Bearer abcdefg"
}


async function createCommand() {


}

main();