const {Browser, Builder, By, Key, until, Options } = require('selenium-webdriver');

class Spinny {
    constructor(driver) {
        this.driver = driver;
    }

    async signInWithMobile(mobile){

        try {
            await this.driver.get('https://www.spinny.com/account/');

            const mobileInput = await this.driver.findElement(By.id('login-mobile-number'));
            await mobileInput.sendKeys(mobile);

            const sendOTPBtn = await this.driver.findElement(By.className('styles__btn LoginModal__getOtpBtn styles__primary styles__largeBtn'));
            await sendOTPBtn.click();

        } catch (error) {
            console.log(error);
            return {status:false,message:"Some Error Occured in Operation. PLease Retry Again"};
        }

        try {
            const nameField = await this.driver.findElement(By.id('login-name'));
            await nameField.sendKeys("RidoBiko Solutions Pvt Ltd");

            const verifyBtn = await this.driver.findElement(By.className('Ripple__container'));
            await verifyBtn.click();
        } catch (error) {
        }

        return {status: true, message: "OTP Sent Successfully"};
    }

    async isVisibility(tag){
        let isVisible = null;
        try {
            let count = 0;
            while(count<100){
                const element = await this.driver.findElement(By.css(tag));
                isVisible = await element.getAttribute('data-focus-value');
                count++;
            }
        } catch (error) {
            isVisible=false;
        }
        return isVisible;
    }

    async submitOTP(otp){
        try {
            const OtpInput = await this.driver.findElement(By.id('login-otp'));
            console.log("hello" + " " + otp);
            OtpInput.sendKeys(otp);

            const isWrongOTP = await this.isVisibility('label');
            if(isWrongOTP){
                await OtpInput.clear();
                if(isWrongOTP=="Invalid OTP"){
                    return {status: false, message: isWrongOTP};
                }
            }

            return {status: true, message: "Signed In Successfull"};

        } catch (error) {
            console.log(error);
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
                challanHeader = await this.driver.wait(until.elementLocated(By.className('challanEntriesList__challanEntriesListHeading')),10000).getText();
            }

            const challanAmountTemp = await this.driver.findElements(By.className('challanEntry__amount'));  
            const numberOfChallans =  await challanAmountTemp.length;

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
            console.log(error);
            return {status:false,message:"Some Error Occured in Operation. PLease Retry Again"};
        }
    }

};

module.exports = {
    Spinny
};