const {Browser, Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class VirtualCourt {
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

  async selectState(stateCode) {
    await this.driver.get('https://vcourts.gov.in/virtualcourt/index.php');
    console.log("cgvhbj: " + stateCode);
    
    const state = await this.driver.findElement(By.xpath(`//option[@value="${stateCode}"]`));
    await state.click();

    const proceedBtn = await this.driver.wait(until.elementLocated(By.id('payFineBTN')), 100);
    await proceedBtn.click();

    const options = await this.driver.wait(until.elementLocated(By.id('mainMenuActive_police')),100);
    await options.click();

    let captchaUrlElements = await this.driver.findElements(By.xpath('//div[3]/div/div/div/img'));
    console.log("length: "+ captchaUrlElements.length);
    let captchaUrl = await captchaUrlElements[0].getAttribute('src');
    const temp = captchaUrl;
      
      while(captchaUrl == temp){
        console.log("in loop: " + captchaUrl)
        captchaUrlElements = await this.driver.findElements(By.xpath('//div[3]/div/div/div/img'));
        captchaUrl = await captchaUrlElements[0].getAttribute('src');
      }

    console.log("captcha url : " + captchaUrl);

    return {captchaUrl: captchaUrl, state: true}
  }

  async getChallanDetails(){

    try {
      const numberOfChallansHeader = await this.driver.wait(until.elementLocated(By.xpath('//table[1]/tbody/tr/th[1]')),1000).getText();
      const numberOfChallans = Number(numberOfChallansHeader.replace(/[^0-9]/g, ''));
      const detailLinks = await this.driver.findElements(By.className('viewDetlink'));

      let challans = [];
      for(let i=0,j=1;i<numberOfChallans;i++,j+=2){

        let isTransferred = false;
        const regularCourtSpan = await this.driver.findElement(By.xpath(`/tr[${j}]/td[2]/span`)).getText();
        if(regularCourtSpan != '') isTransferred = true;

        await detailLinks[i].click();
        const challanData = await getDetail(isTransferred);

        challans.push(challanData);
      }

      const data = {
        vehicleNumber: vehicleNo,
        numberOfChallans:numberOfChallans,
        challans: challans
      }
      return data;

    } catch (error) {
      const errorMessage = await this.driver.wait(until.elementLocated(By.className('alert alert-danger')),1000).getText();
      const closeBtn = await this.driver.findElement(By.xpath('//*[@id="validateError"]/div/div/div[1]/button'));
      await closeBtn.click();

      return {status: 401, error: errorMessage, message: "Please Retry"};
    }
  }

  async getDetail(isTranfered){
    let index = 1;
    let transferDetails = {};
    if(isTranfered==true) {
      index = 2;
      transferDetails = this.getTransferDetails();
    }
    const partyDetails = this.getPartyDetails(index);
    const paymentDetails = this.getPaymentDetails(index);
    const offenceDetails = this.getOffenceDetails(index+1);

    const detail = {
      partyDetails:partyDetails,
      offenceDetails:offenceDetails,
      paymentDetails:paymentDetails,
      transferDetails:transferDetails
    }

    return detail;
  }

  async getTransferDetails(){
    const status = await this.driver.wait(until.elementLocated(By.xpath('//div/table[1]/tbody/tr[1]/td[2]')),1000).getText();
    const regularCourt = await this.driver.findElement(By.xpath('//div/table[1]/tbody/tr[2]/td[2]')).getText();
    const nextDate = await this.driver.findElement(By.xpath('//div/table[1]/tbody/tr[3]/td[2]')).getText();
    const transferDetails = {
      status: status,
      regularCourt: regularCourt,
      nextDate: nextDate
    }
    return transferDetails;
  }

  async getPartyDetails(index){
    const registrationNumber = await this.driver.wait(until.elementLocated(By.xpath(`//div/table[${index}]/tbody[1]/tr[1]/td[2]`))).getText();
    const dateOfRegistration = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[1]/tr[2]/td[2]`)).getText();
    const CNR = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[1]/tr[3]/td[2]`)).getText();
    const challanNumber = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[1]/tr[4]/td[2]`)).getText();
    const challanDate = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[1]/tr[5]/td[2]`)).getText();
    const partyName = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[1]/tr[6]/td[2]`)).getText();
    const placeOfOffence = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[1]/tr[7]/td[2]`)).getText();
    const district = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[1]/tr[8]/td[2]`)).getText();

    const partyDetails = {
      partyName:partyName,
      challanNumber:challanNumber,
      challanDate:challanDate,
      placeOfOffence:placeOfOffence,
      district:district,
      registrationNumber: registrationNumber,
      dateOfRegistration:dateOfRegistration,
      CNR:CNR
    }
    return partyDetails;
  }

  async getPaymentDetails(index){
    const recievedDate = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[2]/tr[1]/td[2]`)).getText();
    const verifiedDate = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[2]/tr[2]/td[2]`)).getText();
    const allocatedDate = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody[2]/tr[3]/td[2]`)).getText();

    const paymentDetails = {
      allocatedDate:allocatedDate,
      recievedDate:recievedDate,
      verifiedDate:verifiedDate
    }
    return paymentDetails;
  }

  async getOffenceDetails(index){
    const offenceCode = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody/tr[1]/td[1]`)).getText();
    const offence = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody/tr[1]/td[2]`)).getText();
    const act = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody/tr[1]/td[3]`)).getText();
    const section = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody/tr[1]/td[4]`)).getText();
    const fine = await this.driver.findElement(By.xpath(`//div/table[${index}]/tbody/tr[1]/td[5]`)).getText();

    const offenceDetails = {
      code: offenceCode,
      offenceName:offence,
      act: act,
      section:section,
      fine:fine
    }
    return offenceDetails;
  }

  async fillDetails(vehicleNo,captchaText) {
    console.log(vehicleNo + " " + captchaText);

    const vehicleNumberInput = await this.driver.wait(until.elementLocated(By.id('vehicle_no')),100);
    await vehicleNumberInput.sendKeys(vehicleNo);

    const captchaInput = await this.driver.findElement(By.id('fcaptcha_code_police'));
    await captchaInput.sendKeys(captchaText);

    const submitBtn = await this.driver.findElement(By.xpath('//button[@onclick="submitpoliceForm()"]'));
    await submitBtn.click();

    await this.getChallanDetails();
    // return {status: true};
  }

  async getCaptcha(url){
    try {
      const win = await this.driver.getAllWindowHandles();
      console.log(win.length);
      await this.driver.get(url);
      const scr = await this.driver.takeScreenshot();

      require('fs').writeFile('screenshot.png', scr, 'base64', (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Screenshot saved to screenshot.png');
        }
      });

      const screenshot = fs.readFileSync('screenshot.png');

      return {captchaUrl: "captchaUrl", state: true}

    } catch (error) {
      
      return {message: "captcha not found"};
    }
  }

};

module.exports = {
  VirtualCourt
};

// if (require.main === module) {
//   const p = new VirtualCourt();
//   p.openWebsite()
//     .then(() => p.selectState('14~HRVC01'))
//     .then(() => p.getChallanDetails('HR55AK5584',"xdfgchv"))
//     .then(() => console.log('PRESS ANY KEY TO CLOSE THE BROWSER'))
//     .then(() => process.stdin.once('data', () => p.driver.quit()));
// }