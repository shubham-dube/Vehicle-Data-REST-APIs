const {CarInfo} = require("./carInfo.js");
const {Spinny} = require("./spinny.js");
const {VirtualCourt} = require('./virtualCourt.js');
const {Cars24} = require('./cars24.js');

// const virtualCourt = new VirtualCourt();

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

async function getBrowserInstance(server){
    // const options = new chrome.Options();
    // // options.addArguments('window-size=1920,1080');
    // // options.addArguments('resolution=1920,1080');
    // // options.addArguments('disable-extensions');
    // // options.addArguments(['--headless','--disable-gpu','--no-sandbox','--disable-dev-shm-usage']);
    // driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();

    // this.driver.manage().setTimeouts({
    //     implicit: 10000,
    //     pageLoad: 10000,
    //     script: 10000,
    //     });
    if(server=="CarInfo"){
        const carInfo = new CarInfo()
        await carInfo.openWebsite();
        return carInfo;
    }
    else if(server=="Spinny"){
        const spinny = new Spinny()
        await spinny.openWebsite();
        return spinny;
    }
    else if(server=="Cars24"){
        const cars24 = new Cars24()
        await cars24.openWebsite();
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

            UserSeasons[mobile] = {
                serverIndex: serverIndex[server],
                instances: [
                    {
                        isOTPSent: false,
                        isLoggedIn: false,
                        server: server,
                        browserInstance: await getBrowserInstance(server)
                    }
                ]
            };

            response = await UserSeasons[mobile].instances[0].browserInstance.signInWithMobile(mobile);
        }
        else {
            if(checkIsServer(mobile,server) == -1){
                UserSeasons[mobile].serverIndex = serverIndex[server];
                UserSeasons[mobile].instances.push({
                    isOTPSent: false,
                    isLoggedIn: false,
                    server: server,
                    browserInstance: await getBrowserInstance(server)
                });
                const instanceSize = await UserSeasons[mobile].instances.length;
                response = await UserSeasons[mobile].instances[instanceSize-1].browserInstance.signInWithMobile(mobile);
            }
            else {
                const instanceIndex = checkIsServer(mobile,server);
                if(await UserSeasons[mobile].instances[instanceIndex].isOTPSent == true && await UserSeasons[mobile].instances[instanceIndex].isLoggedIn==true) {
                    return res.json({status: true, message: "You Are Already Logged In"});
                }
                else {
                    return res.json({status: true, message: "Please Login Again"});
                }
            }
        }

        if(response.status == true) {
            const serverIndex = UserSeasons[mobile].serverIndex;
            const instanceIndex = checkIsServer(mobile,Server[serverIndex]);
            UserSeasons[mobile].instances[instanceIndex].isOTPSent = true;
        }

        return res.json(response);

    } catch(err){
        // throw(err);
        res.json({status: false, message: "Internal Serval Error",error: await err});
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
                response =  await UserSeasons[mobile].instances[instanceIndex].browserInstance.submitOTP(otp);

                if(response.status == true) {
                    UserSeasons[mobile].instances[instanceIndex].isLoggedIn = true;
                }
                return res.json(response);
            }
            else {
                if(instanceIndex==-1) return res.json({status: false, message: "Login Again to this Server.",error: "Instance not Found" });
                return res.json({status:true,message: "You Are Already Logged In"});
            }
        }
        else {
            res.json({status:false,message: "Please Login Again", error: "User Not Found on any Server"});
        }

    } catch(err){
        // throw(err);
        res.json({status:401,error: "Internal Server Error" , error: err});
    }
}

exports.getVehicleDetail = async (req,res) => {
    try {
        const {mobile,vehicleNumber} = req.body;
        let vehicleData;
        if(UserSeasons[mobile]){
            const serverIndex = UserSeasons[mobile].serverIndex;
            const instanceIndex = checkIsServer(mobile,Server[serverIndex]);
            if(instanceIndex!=-1){
                const isLoggedIn = vehicleData =  await UserSeasons[mobile].instances[instanceIndex].isLoggedIn;
                if(isLoggedIn){
                    vehicleData =  await UserSeasons[mobile].instances[instanceIndex].browserInstance.getVehicleDetails(vehicleNumber);
                }
                else return res.json({status: false, message: "You Have Not Logged In" });
            }
            else res.json({status: false, message: "Login Again to this Server.",error: "Instance not Found" });

            return res.json(vehicleData);
        }
        else return res.json({})
    } 
    catch (error){
        throw(error);
        // res.json({status:401,error: "Internal Server Error" });
    }
}

exports.changeServer = async (req,res) => {
    try {
        const {mobile,server} = await req.body;
        if(UserSeasons[mobile]){
            UserSeasons[mobile].serverIndex = serverIndex[server];
            res.json({Status: true, message: "Server Changed Successfuly"});
        }
        else return res.json({status:401,error: "User Not Found" , message: "Login to Continue"})
    } 
    catch (error){
        throw(error);
        res.json({status:401,message: "Internal Server Error" , error: error});
    }
}

// exports.selectState = async (req,res) => {
//     try {
//         const {stateCode} = await req.body;
//         const captchaUrl = await virtualCourt.selectState(stateCode);

//         res.json(captchaUrl);
//     } 
//     catch (error){
//         throw(error)
//     }
// }

// exports.getChallanDetails = async (req,res) => {
//     try {
//         const {vehicleNumber,captchaText} = await req.body;
//         const vehicleData = await virtualCourt.fillDetails(vehicleNumber,captchaText);
        
//         res.json(vehicleData);
//     } 
//     catch (error){
//         throw(error)
//     }
// }

// exports.getCaptcha = async (req,res) => {
//     try {
//         const {url} = req.body;
//         const captchaUrl = await virtualCourt.getCaptcha(url);
        
//         res.json(captchaUrl);
//     } 
//     catch (error){
//         res.json({error: "Captcha Not Available"});
//     }
// }