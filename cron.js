import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { ethers } = require("ethers");
const cron = require("node-cron");
require("dotenv").config();

const UBI = require("./UBI.json");

const networks = [
    {
        url: process.env.INFURA_KEY,
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

const contractAddress = "0x8FA004a40d3E90D89eE5C6B3ac7CBB7B34C1ee28";
const chains = networks.map((networks) => {
    const provider = new ethers.providers.JsonRpcProvider(networks.url);
    const signer = new ethers.Wallet(process.env.CRON_KEY, provider);
    const contract = new ethers.Contract(contractAddress, UBI.abi, signer).connect(signer);
    
    return contract;
});


const d = async(c) => {
    try {
        await c.disableSubscription();
    }
    catch(error) {
        console.log(error);
    }
}

const e = async(c) => {
    try {
        await c.enableSubscription();
    }
    catch(error) {
        console.log(error);
    }
};

// Every second the cron checks if owner enabled subscriptions
console.log("Started scheduler.");

var enableListener = cron.schedule("* * * * * *", function listenForSubEnable(){
    console.log("enable");
    for(const c of chains) {
        c.on("EnableSubscriptions", (enable, event) => {
            for(const x of chains) {
                e(x);
            }

            disableListener.start();
            checkIncome.start();
            enableListener.stop();
            
        });

        

    }

});

enableListener.start();



const subscribe = async(c, addr) => {
    try {
        await c.getSubscription(addr);
    } catch (error){
        console.log(error);
    }
}

const unsubscribe = async(c) => {
    try {
        await c.stopSubscription(addr);
    } catch (error) {
        console.log(error);
    }
}

var disableListener = cron.schedule("* * * * * *", function listenForSubDisable(){
    console.log("disable");
    for(const c of chains) {
        c.on("DisableSubscriptions", (enable, event) => {
            for(const x of chains) {
                d(x);
            }

            enableListener.start();
            checkIncome.stop();
            disableListener.stop();
            
        });

        c.on("Subscribe", (addr, event) => {
            for(const x of chains) {
                subscribe(x, addr);
            }
        });

        c.on("Unsubscribe", (addr, event) => {
            for(const x of chains) {
                unsubscribe(x, addr);
            }
        });
    }
});

disableListener.stop();


const check = async(c) => {
    try {
        await c.checkIncomes();
    }
    catch(error){
        console.log(error);
    };

    
};

// Every 2 minutes (set to 1 for speed) the cron checks contract income.
// It will distribute to users based on the amount recieved in that very minute
var checkIncome = cron.schedule("*/1 * * * *", function checkIncomes(){
    
    console.log("checked");
    for(const c of chains){
        check(c);
    }

    
});

checkIncome.stop();

// checkIncome.start();
