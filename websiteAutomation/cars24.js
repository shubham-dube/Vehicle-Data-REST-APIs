const {Browser, Builder, By, Key, until, Options } = require('selenium-webdriver');

class Cars24 {
    constructor(driver) {
        this.driver = driver;
    }

    async signInWithMobile(mobile){
        try {
            await this.driver.get('https://www.cars24.com/');

            const accountBtn = await this.driver.findElement(By.className('media-body _2J4pd'));
            await accountBtn.click();

            const loginBtn = await this.driver.findElement(By.className('btn  _2iiQB _3qpfi '));
            await loginBtn.click();

            const mobileInput = await this.driver.findElement(By.xpath('//input[@placeholder="999 999 9999"]'));
            await mobileInput.sendKeys(mobile);

            const sendOTPBtn = await this.driver.findElement(By.xpath('//div[5]/div/div/div/div[2]/div[1]/button'));
            await sendOTPBtn.click();

            return {status: true, message: "OTP Sent Successfully"};

        } catch (error) {
            console.log(error);
            return {status:false,message:"Some Error Occured in Operation. PLease Login Again"};
        }
    }

    async isVisibility(clas){
        let isVisible = null;
        const element = await this.driver.findElements(By.className(clas));
        if(element.length>0){
            isVisible = element[0].getText();
        }
        else isVisible = false;
        return isVisible;
    }

    async submitOTP(otp){
        try {
            const OtpInput = await this.driver.findElement(By.xpath('//div[2]/div/div/input'));
            OtpInput.sendKeys(otp)

            const verifyBtn = await this.driver.findElement(By.xpath('//div[5]/div/div/div/div[2]/div/button'));
            await verifyBtn.click()

            const isVisibility = await this.isVisibility('wxl2u');
            if(isVisibility){
                OtpInput.click();
                for(let i=0;i<4;i++){
                    OtpInput.sendKeys(Key.BACK_SPACE);
                }
                return {status: false, message: isVisibility};
            }

            return {status: true, message: "Signed In Successfull"};

        } catch (error) {
            console.log(error);
            return {status:false,message:"Some Error Occured in Operation. PLease Login Again"};
        }
    }

    async getVehicleDetails(vehicleNumber){
        try {
            await this.driver.get(`https://www.cars24.com/traffic-challan/`);

            const vehicleRegInput = await this.driver.findElement(By.xpath('//input[@placeholder="DL 01 AB12XX"]'));
            await vehicleRegInput.sendKeys(vehicleNumber);

            const checkChallanBtn = await this.driver.findElement(By.xpath('//div[2]/div[1]/div/button'));
            await checkChallanBtn.click();

        } catch (error) {
            return res.status(500).json({status:false, message: "Internal Server Error"})
        }

        const challans = []; 
        const status = ['UNPAID','PAID'];

        for(let j=0;j<status.length;j++){
            let ChallanNoElements
            try {
                ChallanNoElements = await this.driver.wait(until.elementsLocated(By.xpath('//div[1]/span[2]')),4000);
            } catch (error) {
                ChallanNoElements = [];
            }
            const ChallanDateElements = await this.driver.findElements(By.xpath('//div[2]/span[2]'));
            const ChallanAmtElements = await this.driver.findElements(By.xpath('//div[@class="_3CEVZ"]/span'));
            const OffenceElements = await this.driver.findElements(By.xpath('//div[3]/span'));
            
            let size = ChallanNoElements.length;
            console.log(size);
            for(let i=0;i<size;i++){
                const challanNumber = await ChallanNoElements[i].getText();
                const challanDate = await ChallanDateElements[i].getText();
                const challanAmount = await ChallanAmtElements[i].getText();
                const challanOffence = await OffenceElements[i].getText();

                challans.push(
                    {
                        challanNumber: challanNumber,
                        challanDate : challanDate,
                        challanAmount: challanAmount,
                        offence: challanOffence,
                        status: status[j]
                    }
                );
            }
            const paidChallansBtn = await this.driver.findElement(By.xpath('//div/div[1]/div/div[2]/ul/li[2]'));
            await paidChallansBtn.click();
        }

        const vehicleDetails = {
            vehicleNumber: vehicleNumber,
            numberOfChallans: challans.length,
            challans: challans
        }
        
        return vehicleDetails;

    }

};

module.exports = {
    Cars24
};
