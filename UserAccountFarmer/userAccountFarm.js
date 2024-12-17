const { Client } = require('discord.js-selfbot-v13');
const logger = require('../functions/logger.js');
const axios = require('axios');
const config = require('../config.js')
module.exports = {
    name: 'secondary account farmer',
    description: 'uses more user accounts to farm in ur farm servers to increase spawn rate',
    author: 'SextyNine',

    /**
     * @param {Client} client the client that extension needs to interact with
     */
    func: async (client) => {
        if (!config.secondaryTokens) return logger.error('no "secondaryTokens" array present in config.js (for more information visit the repo)')
        let requests = []
        for (const token of config.secondaryTokens) {
            const ax = axios.create({
                baseURL: "https://discord.com/api/v10",
                headers: {
                    Authorization: token
                }
            })
            
            const guildsres = await ax.get('/users/@me/guilds');
            const guilds = guildsres.data.filter(item => config.farmServers.includes(item.name))
            
            for (const guild of guilds) {
                try {
                    const channelsres = await ax.get(`/guilds/${guild.id}/channels`).catch(err => console.log(err));
                    const channel = channelsres.data.find(channel => channel.name === 'general' && channel.type === 0)
    
                    if (channel) {
                        requests.push({
                            token: token,
                            id: channel.id
                        })
                    }
                    await wait(500)    
                } catch {
                    await wait(1000)
                }
            }
            console.log(requests.length)
        }
        farm(requests)
        setInterval(async () => {
            farm(requests)
        }, config.farmSleepTime)

    }
}

async function farm(requests) {
    for (const req of requests) {
        try {
            await axios.post(`https://discord.com/api/v10/channels/${req.id}/messages`, {
                content: makeid()
            }, {
                headers: {
                    'Authorization': req.token
                }
            })
            await wait(Math.floor(Math.random() * (config.farmCooldown[1] - config.farmCooldown[0] + 1)) + config.farmCooldown[0] || 300000)    
        } catch {
            await wait((Math.floor(Math.random() * (config.farmCooldown[1] - config.farmCooldown[0] + 1)) + config.farmCooldown[0] || 300000) * 1.2)
        }
    }
}

function makeid() {
    const length = Math.floor(Math.random() * 11) + 10;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function wait(millisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, millisec);
    })
}
