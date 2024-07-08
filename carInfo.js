const {Browser, Builder, By, Key, until, Options } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class CarInfo {
    constructor() {
        const options = new chrome.Options();
        // options.addArguments('window-size=1920,1080');
        // options.addArguments('resolution=1920,1080');
        // options.addArguments('disable-extensions');
        // options.addArguments(['--headless','--disable-gpu','--no-sandbox','--disable-dev-shm-usage']);
        this.driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();

        this.driver.manage().setTimeouts({
            implicit: 10000,
            pageLoad: 10000,
            script: 10000,
          });
    }

    async openWebsite() {
        await this.driver.get('https://carinfo.app/');
    }

    async signInWithGoogle(email,password){
        try {
            await this.driver.actions().move({ x: 0, y: 0 }).click().perform();

            const loginBtn = await this.driver.findElement(By.xpath('//button[@class="navbar_loginBtn__hLQWL button_button__SuVEC "]'));
            await loginBtn.click();
            await this.driver.manage().deleteAllCookies();

            const googleLoginBtn = await this.driver.findElement(By.xpath('//p[contains(text(),"Login with Google")]'));
            let tt = await googleLoginBtn.getText();
            console.log(tt);
            await googleLoginBtn.click();

            const emailInput = await this.driver.wait(until.elementLocated(By.xpath('//input[@autocomplete="username"]')), 10000);
            await emailInput.sendKeys(email);
            await emailInput.sendKeys(Key.ENTER);

            const passwordInput = await this.driver.wait(until.elementLocated(By.xpath('//input[@autocomplete="current-password"]')), 10000);
            await passwordInput.sendKeys(password);
            await passwordInput.sendKeys(Key.ENTER);
            await this.driver.wait(until.elementLocated(By.xpath('//img[@alt="carInfo"]')),10000);

            return {status:true,message:"Logged In"};

        } catch (error) {
            return {status:false,message:"Some Error Occured in Operation. PLease Retry Again"};
        }
    }

    async signInWithMobile(mobile){
        try {
            await this.driver.actions().move({ x: 0, y: 0 }).click().perform();

            const loginBtn = await this.driver.findElement(By.xpath('//button[@class="navbar_loginBtn__hLQWL button_button__SuVEC "]'));
            await loginBtn.click();

            const mobileLoginOtp = await this.driver.findElement(By.className('login_otpLogin__lPpcq'));
            await mobileLoginOtp.click();

            const mobileInput = await this.driver.findElement(By.id('mobileNumber'));
            await mobileInput.sendKeys(mobile);

            const sendOTPBtn = await this.driver.findElement(By.xpath('//button[contains(text(),"SEND OTP")]'));
            await sendOTPBtn.click();

            return {status: true, message: "OTP Sent Successfully"};

        } catch (error) {
            return {status:false,message:"Some Error Occured in Operation. PLease Retry Again"};
        }
    }

    async submitOTP(otp){
        try {
            const OtpInputs = await this.driver.findElements(By.xpath('//input[@maxlength]'));
            console.log("hello" + " " + otp);
            OtpInputs[3].sendKeys(otp%10);
            otp = otp/10;
            OtpInputs[2].sendKeys(otp%10);
            otp = otp/10;
            OtpInputs[1].sendKeys(otp%10);
            otp = otp/10;
            OtpInputs[0].sendKeys(otp);

            const submitBtn = this.driver.findElement(By.xpath('//button[contains(text(),"CONFIRM OTP")]'));
            await submitBtn.click();

            return {status: true, message: "Signed In Successfull"};

        } catch (error) {
            return {status:false,message:"Some Error Occured in Operation. PLease Login Again"};
        }
    }

    async getVehicleDetails(vehicleNumber){
        try {
            await this.driver.get(`https://www.carinfo.app/challan-details/${vehicleNumber}`);

            const vehicleName = await this.driver.findElement(By.className('rc-dtl')).getText();
            const ownerName = await this.driver.findElement(By.className('dtl-hd-challan')).getText();
            const ownershipType = await this.driver.findElement(By.className('hint-dtl')).getText();
            const vehicleImageUrl = await this.driver.findElement(By.className('image-fluid-challan')).getAttribute('src');

            const expiryDateElements = await this.driver.findElements(By.className('rc-dtl-opt2'));
            const insuranceExpiryDate = await expiryDateElements[0].getText();
            const puccExpiryDate = await expiryDateElements[1].getText();

            const challanDetailsHeader = await this.driver.findElement(By.className('Challan-details-heading')).getText();
            const numberOfChallans =  Number(challanDetailsHeader.replace(/[^0-9]/g, ''));

            const challans = [];

            
            for(let i=0;i<numberOfChallans;i++){

                const challanIdTemp = await this.driver.findElements(By.xpath('//table/tr[1]/th[1]/div[2]'));
                const challanSourceTemp = await this.driver.findElements(By.xpath('//table/tr[1]/th[2]/div[2]'));
                const challanViolaterNameTemp = await this.driver.findElements(By.xpath('//table/tr[1]/th[3]/div[2]'));
                const challanDateTemp = await this.driver.findElements(By.xpath('//table/tr[2]/td[1]/div[2]'));
                const challanAmountTemp = await this.driver.findElements(By.xpath('//table/tr[2]/td[2]/div[2]'));  
                const challanStatusTemp = await this.driver.findElements(By.xpath('//table/tr[2]/td[3]'));

                const challanId = await challanIdTemp[i].getText();
                const challanSource = await challanSourceTemp[i].getText();
                const challanViolaterName = await challanViolaterNameTemp[i].getText();
                const challanDate = await challanDateTemp[i].getText();
                const challanAmount = await challanAmountTemp[i].getText();
                const challanStatus = await challanStatusTemp[i].getText();

                const challanObject = {
                    id: challanId,
                    source: challanSource,
                    violaterName: challanViolaterName,
                    date: challanDate,
                    amount: challanAmount,
                    status: challanStatus
                }
                challans.push(challanObject);
            }

            const vehicleDetails = {
                vehicleName: vehicleName,
                vehicleNumber: vehicleNumber,
                ownerName: ownerName,
                ownershipType: ownershipType,
                vehicleImageUrl: vehicleImageUrl,
                insuranceExpiryDate: insuranceExpiryDate,
                puccExpiryDate: puccExpiryDate,
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
    CarInfo
};

// if (require.main === module) {
//   const p = new Process();
//   p.openWebsite()
//   p.signInWithGoogle("testemailridobiko","Ridobiko");
//   p.getVehicleDetails('HR55AK5584')
// }