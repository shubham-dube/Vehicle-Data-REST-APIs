const express = require("express");
const body_parser = require("body-parser");
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

const port = 5000;

app.use(cors({
    origin: `http://localhost:${port}`
}));

app.use(body_parser.json());

class RC {
    async getRcDetails(req, res) {
        try {
            const { vehicleNumber } = req.body;

            // Fetch RC details
            let url = `https://www.carinfo.app/rc-details/${vehicleNumber}`;
            let response = await axios.get(url);
            let html = response.data;
            let $ = cheerio.load(html);

            const rtoDetails = this.getRtoDetails($);
            const vehicleOwnerDetails = this.getOwnershipDetails($);
            const imageUrl = $('.MuiBox-root.css-11gihrn').children('img').attr('src');

            // Fetch Challan details
            url = `https://www.carinfo.app/challan-details/${vehicleNumber}`;
            response = await axios.get(url);
            html = response.data;
            $ = cheerio.load(html);

            const ownershipType = $('.hint-dtl').text();
            const insuranceDetails = this.getInsuranceDetails($);

            // Accumulating Data
            const VehicleData = {
                ownerName: vehicleOwnerDetails[0],
                ownershipType: ownershipType,
                Maker: vehicleOwnerDetails[1],
                vehicleImageUrl: imageUrl,
                insuranceDetails: insuranceDetails,
                rtoDetails: rtoDetails,
            };

            return res.json({ VehicleData: VehicleData });

        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            return res.status(500).json({ error: 'Error fetching vehicle details' });
        }
    }

    getRtoDetails($) {
        const rtoDetails = [];

        $('.MuiTypography-root.MuiTypography-body1.css-1c2ltzg').each((index, element) => {
            const text = $(element).text();
            rtoDetails.push(text);
        });

        const rtoObject = {
            rtoNumber: rtoDetails[0],
            RegisteredRTO: rtoDetails[1],
            city: rtoDetails[2],
            state: rtoDetails[3]
        };

        return rtoObject;
    }

    getOwnershipDetails($) {
        const vehicleOwnerDetails = [];

        $('.MuiTypography-root.MuiTypography-body1.css-1qt56zs').each((index, element) => {
            const text = $(element).text();
            vehicleOwnerDetails.push(text);
        });

        return vehicleOwnerDetails;
    }

    getInsuranceDetails($) {
        const expiryDetails = [];

        $('.rc-dtl-opt2').each((index, element) => {
            expiryDetails.push($(element).text());
        });

        const insuranceDetails = {
            insuranceExpiry: expiryDetails[0],
            PUCCExpiry: expiryDetails[1]
        };

        return insuranceDetails;
    }
};

// Creating Instance of RC
const Rc = new RC();

// Controller for the API
app.post('/getRcDetails', (req, res) => Rc.getRcDetails(req, res));

// PORT = 5000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
