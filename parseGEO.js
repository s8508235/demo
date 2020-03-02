require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const fileName = `醫療機構與人員基本資料20190131.csv`;
const geoEncodeURL = `https://maps.googleapis.com/maps/api/geocode/json`;
let csvData = [];
fs.createReadStream(path.resolve(__dirname, 'src', 'assets', fileName))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => csvData.push(row))
    .on('end', async () => {
        var addressLocation = new Map();
        let flag = false;
        for (let index = 0; index < csvData.length; index++) {
            const csv = csvData[index];
            if (index === 1000 || flag) {
                break;
            }
            await axios.get(`${geoEncodeURL}?address=${encodeURIComponent(csv['地址'])}&key=${process.env.API_KEY}`).then(response => {
                try {
                    const geoInfo = response.data.results[0];
                    addressLocation.set(csv['地址'], geoInfo.geometry.location);
                } catch {
                    new Error(`no such place`);
                }
            }).catch(error => {
                flag = true;
                console.log(error);
            });
        };
        const obj = Object.fromEntries(addressLocation.entries());

        fs.writeFile(path.resolve(__dirname, 'src', 'assets', 'geoEncoding1000.json'), JSON.stringify(obj), function (err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("File has been created");
        });
    });
