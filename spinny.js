const {Browser, Builder, By, Key, until, Options } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class Spinny {
    constructor() {
        const options = new chrome.Options();
        options.addArguments('window-size=1920,1080');
        options.addArguments('resolution=1920,1080');
        options.addArguments('disable-extensions');
        options.addArguments(['--headless','--disable-gpu','--no-sandbox','--disable-dev-shm-usage']);
        this.driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();

        this.driver.manage().setTimeouts({
            implicit: 10000,
            pageLoad: 10000,
            script: 10000,
          });
          
    }

    async openWebsite() {
        await this.driver.get('https://www.spinny.com/account/');
    }

    async signInWithMobile(mobile){

        try {
            const mobileInput = await this.driver.findElement(By.id('login-mobile-number'));
            await mobileInput.sendKeys(mobile);

            const sendOTPBtn = await this.driver.findElement(By.className('styles__btn LoginModal__getOtpBtn styles__primary styles__largeBtn'));
            await sendOTPBtn.click();

            return {status: true, message: "OTP Sent Successfully"};
        } catch (error) {
            return {status:false,message:"Some Error Occured in Operation. PLease Retry Again"};
        }
    }

    async submitOTP(otp){
        try {
            const OtpInput = await this.driver.findElement(By.id('login-otp'));
            console.log("hello" + " " + otp);
            OtpInput.sendKeys(otp)

            return {status: true, message: "Signed In Successfull"};
        } catch (error) {
            return {status:false,message:"Some Error Occured in Operation. PLease Retry Again"};
        }
    }

    async getVehicleDetails(vehicleNumber){

        try {
            await this.driver.get(`https://www.spinny.com/e-challan/`);

            const vehicleRegInput = await this.driver.findElement(By.id('Registration Number'));
            await vehicleRegInput.sendKeys(vehicleNumber);

            const checkChallanBtn = await this.driver.findElement(By.xpath('//form/button/div'));
            await checkChallanBtn.click();

            let challanHeader = '';
            while(challanHeader==='') {
                challanHeader = await this.driver.findElement(By.className('challanEntriesList__challanEntriesListHeading')).getText();
            }
            const numberOfChallans =  Number(challanHeader.replace(/[^0-9]/g, ''));
            console.log("number : " + numberOfChallans);
            console.log(challanHeader);

            const challans = [];
            
            for(let i=0;i<numberOfChallans;i++){
                let challanIdTemp;
                
                const challanDateTemp = await this.driver.findElement(By.xpath(`//li[${i+1}]/div[2]/span[2]`));
                const challanAmountTemp = await this.driver.findElements(By.className('challanEntry__amount'));  
                const challanStatusTemp = await this.driver.findElement(By.xpath(`//li[${i+1}]/div[1]/span/span`));
                if(i==0){
                    challanIdTemp = await this.driver.findElements(By.className('challanEntry__challanNo'));
                }
                else {
                    const focusedList = await this.driver.findElements(By.className('challanEntry__challanEntry challanEntry__isDesktop'));
                    await focusedList[i].click();
                    challanIdTemp = await this.driver.findElements(By.className('challanEntry__challanNo'));
                }

                let challanId = await challanIdTemp[i].getText();
                while(challanId === ''){
                    challanId = await challanIdTemp[i].getText();
                }
                
                const challanDate = await challanDateTemp.getText();
                const challanAmount = await challanAmountTemp[i].getText();
                const challanStatus = await challanStatusTemp.getText();

                const challanObject = {
                    id: challanId,
                    date: challanDate,
                    amount: challanAmount,
                    status: challanStatus
                }
                challans.push(challanObject);
            }

            const vehicleDetails = {
                vehicleNumber: vehicleNumber,
                numberOfChallans: numberOfChallans,
                challans: challans
            }
            return vehicleDetails;
        } catch (error) {
            return {status:false,message:"Some Error Occured in Operation. PLease Retry Again"};
        }
    }

};
module.exports = {
    Spinny
};

// if (require.main === module) {
//   const p = new Spinny();
//   p.openWebsite()
//   p.signInWithMobile("7687877772");
//   p.getVehicleDetails('HR55AK5584')
// }