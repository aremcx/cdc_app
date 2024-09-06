// Handle the product search
function searchProduct() {
  const query = document.getElementById('productSearch').value;
  
  if (query.length < 3) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }
  
  fetch(`/search-products?query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(results => {
      const resultsList = document.getElementById('searchResults');
      resultsList.innerHTML = '';
      
      results.forEach(product => {
        const li = document.createElement('li');
        li.textContent = `${product.description} (${product.code})`;
        li.onclick = () => {
          document.getElementById('hsCode').value = product.code;
          resultsList.innerHTML = '';
        };
        resultsList.appendChild(li);
      });
    });
}

// Function to fetch HS code details
function fetchHsCodeDetails() {
    const hsCode = document.getElementById('hsCode').value;
    fetch(`/fetchHsCodeDetails?hsCode=${hsCode}`)
      .then(response => response.json())
      .then(row => {
        document.getElementById('result').innerHTML = `
          <p>HS Code: ${row.code}</p>
          <p>Description: ${row.description}</p>
          <p>Customs Duty Rate: ${row.id}%</p>
          <p>VAT Rate: ${row.vat}%</p>
          <p>Levy: ${row.lvy}%</p>
          <p>Excise: ${row.exc}%</p>
        `;
      })
      .catch(error => {
        alert('Error: ' + error);
      });
  }
  
  // Function to calculate duty
  function calculateDuty() {
    const hsCode = document.getElementById('hsCode').value;
    const cifFob = document.getElementById('cifFob').value;
    let cifValue = parseFloat(document.getElementById('cifValue').value);
    const ancillaryCharges = parseFloat(document.getElementById('ancillaryCharges').value) || 0;
    const freightValue = parseFloat(document.getElementById('freightValue').value) || 0;
    const insurancePremiumRate = parseFloat(document.getElementById('insurancePremiumRate').value) / 100 || 0;
    const currency = document.getElementById('currency').value;
    const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);
  
    fetch(`/fetchHsCodeDetails?hsCode=${hsCode}`)
      .then(response => response.json())
      .then(row => {
        let fobValue = cifValue;
        if (cifFob === 'FOB') {
          fobValue = ancillaryCharges + cifValue;
          const insuranceValue = (fobValue + freightValue + (0.1 * (fobValue + freightValue))) * insurancePremiumRate;
          cifValue = fobValue + insuranceValue + freightValue;
        }
  
        const cifValueNaira = cifValue * exchangeRate;
        const fobValueNaira = fobValue * exchangeRate;
  
        const idRate = row.id / 100;
        const vatRate = row.vat / 100;
        const lvyRate = row.lvy / 100;
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
      })
      .catch(error => {
        alert('Error: ' + error);
      });
  }
  
  // Function to clear the form
  function clearForm() {
    document.getElementById('dutyForm').reset();
    document.getElementById('result').innerHTML = "";
  }
  