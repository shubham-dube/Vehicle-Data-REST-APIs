const {Browser, Builder, By, Key, until, Options } = require('selenium-webdriver');

class CarInfo {
    constructor(driver) {
        this.driver = driver;
    }

    async signInWithMobile(mobile){
        try {
            await this.driver.get('https://carinfo.app/');
            
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
            console.log(error);
            return {status:false,message:"Some Error Occured in Operation. PLease Retry Again"};
        }
    }

    async isVisibility(clas){
        let isVisible = false;
        const element = await this.driver.findElements(By.className(clas));
        if(element.length>0){
            isVisible = true;
        }
        return isVisible;
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

            const submitBtn = await this.driver.findElement(By.xpath('//button[contains(text(),"CONFIRM OTP")]'));
            await submitBtn.click();

            if(await this.isVisibility('toast_toastContainer__OiXCo')) {
                for(let i=0;i<4;i++){
                    OtpInputs[i].click();
                    OtpInputs[i].sendKeys(Key.BACK_SPACE);
                }
                return {status: false, message: "Wrong OTP"};
            };

            return {status: true, message: "Signed In Successfull"};

        } catch (error) {
            console.log(error);
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

            const challanIdTemp = await this.driver.findElements(By.xpath('//table/tr[1]/th[1]/div[2]'));
            const numberOfChallans =  await challanIdTemp.length;

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
            console.log(error);
            return {status:false,message:"Some Error Occured in Operation. PLease Retry Again"};
        }
    }

};

module.exports = {
    CarInfo
};