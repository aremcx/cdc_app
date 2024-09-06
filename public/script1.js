const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('customs.db');

let hsCodeDetails = {};

async function fetchHsCodeDetails() {
    const hsCode = document.getElementById('hsCode').value;

    try {
        const response = await fetch(`/hs-code/${hsCode}`);
        if (!response.ok) {
            throw new Error('HS Code not found');
        }
        hsCodeDetails = await response.json();
        document.getElementById('result').innerHTML = `
            <p>HS Code: ${hsCode}</p>
            <p>Description: ${hsCodeDetails.description}</p>
            <p>Customs Duty Rate: ${hsCodeDetails.id}%</p>
            <p>VAT Rate: ${hsCodeDetails.vat}%</p>
            <p>Levy: ${hsCodeDetails.lvy}%</p>
            <p>Excise: ${hsCodeDetails.exc}%</p>
        `;
    } catch (e) {
        alert(e.message);
    }
}

function calculateDuty() {
    const hsCode = document.getElementById('hsCode').value;
    const cifFob = document.getElementById('cifFob').value;
    let cifValue = parseFloat(document.getElementById('cifValue').value);
    const ancillaryCharges = parseFloat(document.getElementById('ancillaryCharges').value) || 0;
    const freightValue = parseFloat(document.getElementById('freightValue').value) || 0;
    const insurancePremiumRate = parseFloat(document.getElementById('insurancePremiumRate').value) / 100 || 0;
    const currency = document.getElementById('currency').value;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);

    console.log('HS Code Details in calculateDuty:', hsCodeDetails);  // Debug statement

    const hsCodeDetail = hsCodeDatabase[hsCode];
    if (!hsCodeDetails) {
        alert('Invalid or missing HS Code details. Please fetch the HS Code details first.');
        return;
    }

    let fobValue = cifValue;
    if (cifFob === 'FOB') {
        fobValue = ancillaryCharges + cifValue;
        const insuranceValue = (fobValue + freightValue + (0.1 * (fobValue + freightValue))) * insurancePremiumRate;
        cifValue = fobValue + insuranceValue + freightValue;
    }

    const cifValueNaira = cifValue * exchangeRate;
    const fobValueNaira = fobValue * exchangeRate;

    const idRate = hsCodeDetail.id / 100;
    const vatRate = hsCodeDetail.vat / 100;
    const lvyRate = hsCodeDetail.lvy / 100;
    const id = cifValueNaira * idRate;
    const surcharge = id * 0.07;
    const ciss = fobValueNaira * 0.01;
    const levy = lvyRate * cifValueNaira; 
    const etls = cifValueNaira * 0.005;
    const totalDuties = id + surcharge + ciss + levy + etls;
    const vat = (cifValueNaira + totalDuties) * vatRate;
    const totalAmount = totalDuties + vat;

    document.getElementById('result').innerHTML += `
        <p>CIF/FOB: ${cifFob}</p>
        <p>Total Value (${currency}): ${cifValue.toFixed(2)}</p>
        <p>Exchange Rate: ${exchangeRate.toFixed(2)}</p>
        <p>Total Value (Naira): ${cifValueNaira.toFixed(2)}</p>
        <p>Customs Duty (ID): ${id.toFixed(2)}</p>
        <p>Surcharge: ${surcharge.toFixed(2)}</p>
        <p>CISS: ${ciss.toFixed(2)}</p>
        <p>Levy: ${levy.toFixed(2)}</p>
        <p>ETLS: ${etls.toFixed(2)}</p>
        <p>VAT: ${vat.toFixed(2)}</p>
        <p>Total Amount: ${totalAmount.toFixed(2)}</p>
    `;
}

function clearForm() {
    document.getElementById('dutyForm').reset();
    document.getElementById('result').innerHTML = "";
}