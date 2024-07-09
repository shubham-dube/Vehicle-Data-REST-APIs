# Vehicle E-Challan Retrieval Service

The Vehicle E-Challan Retrieval Service allows you to fetch e-challan details from three different sources: Spinny, CarInfo, and Cars24. This service handles user authentication through OTP, manages server switching, and disposes of user sessions when needed.

## Features

- **User Authentication:** Authenticate users through OTP.
- **Server Management:** Switch between different servers for fetching data.
- **Vehicle Details Retrieval:** Fetch e-challan details for a given vehicle number.
- **Rate Limiting:** Limits the number of requests per day.
- **Error Handling:** Provides comprehensive error messages for various scenarios.

## Getting Started

### Prerequisites

- Node.js
- npm
- chromedriver

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/shubham-dube/vehicle-e-challan-retrieval-service
    cd vehicle-e-challan-retrieval-service
    ```

2. Install dependencies:
    ```sh
    npm install selenium-webdriver express axios body-parser cheerio chromedriver cluster cors dotenv express-rate-limit helmet morgan winston
    ```

3. Create a `.env` file in the root directory with the following content:
    ```env
    PORT=5000
    RATE_LIMIT_WINDOW_MS=86400000
    RATE_LIMIT_MAX=50
    NODE_ENV=development
    ```

4. Start the server:
    ```sh
    node index
    ```

## Usage

### Sign In with Mobile

**Endpoint:** `/signInWithMobile`

**Method:** `POST`

**Description:** `Sends an OTP to the provided mobile number for authentication.`

**Request Body:**
```json
{
  "server": "CarInfo",
  "mobile": "9999999999"
}
```

**Response**
```json
{
  "status": true,
  "message": "OTP Sent Successfully"
}
```
**Status Codes**
- 200 OK : `OTP Sent Successfully`
- 500 Internal Server Error : `Error in Operation Ocuured`

### Submit OTP

**Endpoint:** `/submitOTP`

**Method:** `POST`

**Description:** `Submits that OTP and allows access to that site`

**Request Body:**
```json
{
  "mobile": "9999999999",
  "otp": "1234"
}
```
**Response**
```json
{
  "status": true,
  "message": "Signed In Successfully"
}
```
**Status Codes**
- 200 OK : `OTP verified and user logged in`
- 500 Internal Server Error : `Error in Operation Ocuured`
- 401 Unauthorized : `Login Again`

### Get Vehicle Challan Details

**Endpoint:** `/getChallanDetails`

**Method:** `POST`

**Description:** `Fetch or Retrieve Challan Data from the current Selected Website/Server`

**Request Body:**
```json
{
  "mobile": "9999999999",
  "vehicleNumber": "DL01AB1234"
}
```
**Response (From Cars24 Website)**
```json
{
  "vehicleNumber": "DL01AB1234",
  "numberOfChallans": 2,
  "challans": [
    {
      "challanNumber": "12345",
      "challanDate": "2023-06-01",
      "challanAmount": "500",
      "offence": "Speeding",
      "status": "UNPAID"
    },
    {
      "challanNumber": "67890",
      "challanDate": "2023-05-01",
      "challanAmount": "300",
      "offence": "Red Light Violation",
      "status": "PAID"
    }
  ]
}
```
**Response (From Cars24 Website)**
```json
{
  "vehicleNumber": "DL01AB1234",
  "numberOfChallans": 2,
  "challans": [
    {
      "challanNumber": "12345",
      "challanDate": "2023-06-01",
      "challanAmount": "500",
      "offence": "Speeding",
      "status": "UNPAID"
    },
    {
      "challanNumber": "67890",
      "challanDate": "2023-05-01",
      "challanAmount": "300",
      "offence": "Red Light Violation",
      "status": "PAID"
    }
  ]
}
```
**Response (From Cars24 Website)**
```json
{
  "vehicleNumber": "DL01AB1234",
  "numberOfChallans": 2,
  "challans": [
    {
      "challanNumber": "12345",
      "challanDate": "2023-06-01",
      "challanAmount": "500",
      "offence": "Speeding",
      "status": "UNPAID"
    },
    {
      "challanNumber": "67890",
      "challanDate": "2023-05-01",
      "challanAmount": "300",
      "offence": "Red Light Violation",
      "status": "PAID"
    }
  ]
}
```
**Status Codes**
- 200 OK : `OTP verified and user logged in`
- 500 Internal Server Error : `Error in Operation Ocuured`
- 401 Unauthorized : `Login Again`

### Changing Website Server

**Endpoint:** `/changeServer`

**Method:** `POST`

**Description:** `Changes the current selected website server for the user session with given server.`

**Request Body:**
```json
{
  "mobile": "9999999999",
  "server": "Spinny"
}
```
**Response**
```json
{
  "status": true,
  "message": "Server Changed Successfully"
}
```
**Status Codes**
- 200 OK : `Server Changed Successfully`
- 500 Internal Server Error : `Error in Operation Ocuured`
- 401 Unauthorized : `User not found.`

### Disposing the User Season

**Endpoint:** `/dispose`

**Method:** `POST`

**Description:** `Disposes of the user session and releases resources.`

**Request Body:**
```json
{
  "mobile": "9999999999"
}
```
**Response**
```json
{
  "status": true,
  "message": "User Disposed Successfully"
}
```
**Status Codes**
- 200 OK : `Server Changed Successfully`
- 500 Internal Server Error : `Error in Operation Ocuured`
- 401 Unauthorized : `User not found.`

## Rate Limiting
`You can make up to 50 requests per day. Exceeding this limit will result in a 429 Too Many Requests response.`

## Support
For Support Contact me at itzshubhamofficial@gmail.com
or Mobile Number : `+917687877772`

## Contribution

We welcome contributions to improve this project. Here are some ways you can contribute:

1. **Report Bugs:** If you find any bugs, please report them by opening an issue on GitHub.
2. **Feature Requests:** If you have ideas for new features, feel free to suggest them by opening an issue.
3. **Code Contributions:** 
    - Fork the repository.
    - Create a new branch (`git checkout -b feature-branch`).
    - Make your changes.
    - Commit your changes (`git commit -m 'Add some feature'`).
    - Push to the branch (`git push origin feature-branch`).
    - Open a pull request.

4. **Documentation:** Improve the documentation to help others understand and use the project.
5. **Testing:** Write tests to improve code coverage and ensure stability.

Please make sure your contributions adhere to our coding guidelines and standards.
