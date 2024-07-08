const {Browser, Builder, By, Key, until, Options } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class Cars24 {
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
        await this.driver.get('https://www.cars24.com/');
    }

    async signInWithMobile(mobile){
        const accountBtn = await this.driver.findElement(By.className('media-body _2J4pd'));
        await accountBtn.click();

        const loginBtn = await this.driver.findElement(By.className('btn  _2iiQB _3qpfi '));
        await loginBtn.click();

        const mobileInput = await this.driver.findElement(By.xpath('//input[@placeholder="999 999 9999"]'));
        await mobileInput.sendKeys(mobile);

        const sendOTPBtn = await this.driver.findElement(By.xpath('//div[5]/div/div/div/div[2]/div[1]/button'));
        await sendOTPBtn.click();

        return {status: true, message: "OTP Sent Successfully"};
    }

    async submitOTP(otp){
        const OtpInput = await this.driver.findElement(By.xpath('//div[2]/div/div/input'));
        console.log("hello" + " " + otp);
        OtpInput.sendKeys(otp)

        const verifyBtn = await this.driver.findElement(By.xpath('//div[5]/div/div/div/div[2]/div/button'));
        await verifyBtn.click()

        return {status: true, message: "Signed In Successfull"};
    }

    async getVehicleDetails(vehicleNumber){

        await this.driver.get(`https://www.cars24.com/traffic-challan/`);

        const vehicleRegInput = await this.driver.findElement(By.xpath('//input[@placeholder="DL 01 AB12XX"]'));
        await vehicleRegInput.sendKeys(vehicleNumber);

        const checkChallanBtn = await this.driver.findElement(By.xpath('//div[2]/div[1]/div/button'));
        await checkChallanBtn.click();

        
        return {vehicleDetails:"Not Developed"};
    }

};

module.exports = {
    Cars24
};
