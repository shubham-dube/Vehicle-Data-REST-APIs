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
    git clone https://github.com/yourusername/vehicle-echallan-service.git
    cd vehicle-echallan-service
    ```

2. Install dependencies:
    ```sh
    npm install
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
- *200* : `OTP Sent Successfully`
