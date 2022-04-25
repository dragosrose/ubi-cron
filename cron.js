import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { ethers } = require("ethers");
const cron = require("node-cron");
require("dotenv").config();

const UBI = require("./UBI.json");

const networks = [
    {
        url: "https://rinkeby.infura.io/v3/",
        chainId: 4,
    },

    {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        chainId: 97,
        
    },
  
    {
        url: "https://rpc-mumbai.maticvigil.com",
        chainId: 80001,
        
    }
]

const contractAddress = "0xa53c232aE15e67D7c25CecB6f4E4bd8470b7A136";
const chains = networks.map((networks) => {
    const provider = new ethers.providers.JsonRpcProvider(networks.url);
    const signer = new ethers.Wallet(process.env.CRON_KEY, provider);
    const contract = new ethers.Contract(contractAddress, UBI.abi, signer).connect(signer);
    
    return contract;
});

// Every second the cron checks if owner enabled subscriptions
cron.schedule("* * * * * *", function listenForSubEnable(){
    
    for (const c of chains) {
        c.on("EmitSubscriptions", (enable) => {
            console.log(enable);
            const e = async() => {
                try {
                    await c.enableSubscription();
                }
                catch(error) {
                    console.log(error);
                }
            };

            e();
            
        });
    }

    
});

// Every minute the cron checks contract income on each minute.
cron.schedule("*/1 * * * *", function checkIncomes(){
    for(const c of chains){
        const f = async() => {
            try {
                await c.checkIncomes();
            }
            catch(error){
                console.log(error);
            };

            f();
        };
    }
});
