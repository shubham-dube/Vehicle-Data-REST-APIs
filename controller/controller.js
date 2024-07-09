const {Browser, Builder, By, Key, until, Options } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const {CarInfo} = require("../websiteAutomation/carInfo.js");
const {Spinny} = require("../websiteAutomation/spinny.js");
const {Cars24} = require('../websiteAutomation/cars24.js');

let Server = [
    "CarInfo",
    "Spinny",
    "Cars24"
];

let serverIndex = {
    CarInfo: 0,
    Spinny: 1,
    Cars24: 2
};

let UserSeasons = {};

async function getDriverInstance(){
    const options = new chrome.Options();
    options.addArguments('window-size=1920,1080');
    options.addArguments('resolution=1920,1080');
    options.addArguments('disable-extensions');
    options.addArguments(['--headless','--disable-gpu','--no-sandbox','--disable-dev-shm-usage']);
    driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();

    this.driver.manage().setTimeouts({
        implicit: 1000,
        pageLoad: 10000,
        script: 10000,
    });
    return driver;
}

async function getBrowserInstance(server,driver){

    if(server=="CarInfo"){
        const carInfo = new CarInfo(driver)
        return carInfo;
    }
    else if(server=="Spinny"){
        const spinny = new Spinny(driver)
        return spinny;
    }
    else if(server=="Cars24"){
        const cars24 = new Cars24(driver)
        return cars24;
    }
    else return null;
}

function checkIsServer(mobile,server){
    let instances = UserSeasons[mobile].instances;
    let size = instances.length;
    for(let i=0;i<size;i++){
        if(server==instances[i].server) return i;
    }
    return -1;
}

exports.SignInMobile = async(req,res)=>{
    try{
        const {server,mobile} = req.body;
        let response;
        if(!UserSeasons[mobile]){
            const driver = await getDriverInstance();
            UserSeasons[mobile] = {
                serverIndex: serverIndex[server],
                driver: driver,
                instances: [
                    {
                        isOTPSent: false,
                        isLoggedIn: false,
                        server: server,
                        website: await getBrowserInstance(server,driver)
                    }
                ]
            };

            response = await UserSeasons[mobile].instances[0].website.signInWithMobile(mobile);
        }
        else {
            if(checkIsServer(mobile,server) == -1){
                UserSeasons[mobile].serverIndex = serverIndex[server];
                UserSeasons[mobile].instances.push({
                    isOTPSent: false,
                    isLoggedIn: false,
                    server: server,
                    website: await getBrowserInstance(server, UserSeasons[mobile].driver)
                });
                const instanceSize = await UserSeasons[mobile].instances.length;
                response = await UserSeasons[mobile].instances[instanceSize-1].website.signInWithMobile(mobile);
            }
            else {
                const instanceIndex = checkIsServer(mobile,server);
                if(await UserSeasons[mobile].instances[instanceIndex].isLoggedIn==true) {
                    return res.status(201).json({status: true, message: "You Are Already Logged In"});
                }
                else {
                    return res.status(50).json({status: true, message: "Please Login Again"});
                }
            }
        }

        if(response.status == true) {
            const serverIndex = UserSeasons[mobile].serverIndex;
            const instanceIndex = checkIsServer(mobile,Server[serverIndex]);
            UserSeasons[mobile].instances[instanceIndex].isOTPSent = true;
        }
        else {
            delete UserSeasons[mobile];
        }

        return res.json(response);

    } catch(err){
        console.log(err);
        res.status(500).json({status: false, message: "Internal Serval Error"});
    }
}

exports.submitOtp = async(req,res)=>{
    try{
        const {mobile,otp} = req.body;
        let response;
        if(UserSeasons[mobile]){
            const serverIndex = await UserSeasons[mobile].serverIndex;
            const instanceIndex = checkIsServer(mobile,Server[serverIndex]);
            if(instanceIndex !=-1 && await UserSeasons[mobile].instances[instanceIndex].isLoggedIn ==false){
                response =  await UserSeasons[mobile].instances[instanceIndex].website.submitOTP(otp);

                if(response.status == true) {
                    UserSeasons[mobile].instances[instanceIndex].isLoggedIn = true;
                    return res.status(200).json(response);
                }
                return res.status(500).json(response);
            }
            else {
                if(instanceIndex==-1) return res.status(401).json({status: false, message: "Login Again to this Server.",error: "Instance not Found" });
                return res.status(201).json({status:true,message: "You Are Already Logged In"});
            }
        }
        else {
            res.status(401).json({status:false,message: "Please Login Again", error: "User Not Found on any Server"});
        }

    } catch(err){
        console.log(err);
        res.status(500).json({status:false,error: "Internal Server Error" });
    }
}

exports.getChallanDetails = async (req,res) => {
    try {
        const {mobile,vehicleNumber} = req.body;
        let vehicleData;
        if(UserSeasons[mobile]){
            const serverIndex = UserSeasons[mobile].serverIndex;
            const instanceIndex = checkIsServer(mobile,Server[serverIndex]);
            if(instanceIndex!=-1){
                const isLoggedIn = vehicleData =  await UserSeasons[mobile].instances[instanceIndex].isLoggedIn;
                if(isLoggedIn){
                    vehicleData =  await UserSeasons[mobile].instances[instanceIndex].website.getVehicleDetails(vehicleNumber);
                }
                else return res.status(201).json({status: false, message: "You Have Not Logged In" });
            }
            else res.status(401).json({status: false, message: "Login Again to this Server.",error: "Instance not Found" });

            return res.json(vehicleData);
        }
        else return res.status(401).json({status: false, message: "User Not Found"});
    } 
    catch (error){
        console.log(error);
        res.status(500).json({status:false,error: "Internal Server Error" });
    }
}

exports.changeServer = async (req,res) => {
    try {
        const {mobile,server} = await req.body;
        if(UserSeasons[mobile]){
            UserSeasons[mobile].serverIndex = serverIndex[server];
        }
        else return res.json({status:401,error: "User Not Found" , message: "Login to Continue"});
        return res.status(200).json({Status: true, message: "Server Changed Successfuly"});
    } 
    catch (error){
        console.log(error);
        res.status(500).json({status:false,message: "Internal Server Error" });
    }
}

exports.dispose = async (req,res) => {
    try {
        const {mobile} = await req.body;
        if(UserSeasons[mobile]){
            UserSeasons[mobile].driver.quit();
            delete UserSeasons[mobile];
        }
        else return res.status(401).json({status:false,error: "User Not Found" , message: "Nothing to Dispose"});
        return res.status(200).json({status:true,error: "User Disposed Successfully"});
    } 
    catch (error){
        console.log(error);
        res.status(500).json({status:false,message: "Internal Server Error" });
    }
}