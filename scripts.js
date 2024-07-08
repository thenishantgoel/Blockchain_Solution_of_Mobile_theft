const IMEI_ABI = [{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "string",
      "name": "imei",
      "type": "string"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "reporter",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "timestamp",
      "type": "uint256"
    }
  ],
  "name": "DeviceReported",
  "type": "event"
},
{
  "inputs": [
    {
      "internalType": "string",
      "name": "_imei",
      "type": "string"
    }
  ],
  "name": "reportLostDevice",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    {
      "internalType": "string",
      "name": "_imei",
      "type": "string"
    }
  ],
  "name": "getLostDevice",
  "outputs": [
    {
      "internalType": "string",
      "name": "",
      "type": "string"
    },
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [
    {
      "internalType": "string",
      "name": "_imei",
      "type": "string"
    }
  ],
  "name": "deviceExists",
  "outputs": [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [],
  "name": "getTotalReportedDevices",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
},
{
  "inputs": [],
  "name": "getReportedImeis",
  "outputs": [
    {
      "internalType": "string[]",
      "name": "",
      "type": "string[]"
    }
  ],
  "stateMutability": "view",
  "type": "function",
  "constant": true
}
];

const IMEI_ADDRESS = '0x9Ba1E7bEe0bbf4BC3034aD2E77a97623721856EF'; // Replace with Seplia's contract address

let web3;
let IMEIContract;
let accounts;
let historyVisible = false;
async function initialize() {
  if (typeof window.ethereum !== 'undefined') {
    // Use MetaMask's provider
    web3 = new Web3(window.ethereum);

    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Get user accounts
      accounts = await web3.eth.getAccounts();
      const accountToUse = accounts[0];
      web3.eth.defaultAccount = accountToUse;

      console.log("Accounts available:", accounts);
      console.log(`Transactions will be sent from account: ${accountToUse}`);

      // Initialize contract
      IMEIContract = new web3.eth.Contract(IMEI_ABI, IMEI_ADDRESS);

      // Restore history visibility from localStorage
      const savedHistoryVisible = localStorage.getItem('historyVisible');
      historyVisible = savedHistoryVisible === 'true';
      updateHistoryVisibility();

      loadIMEIsFromLocalStorage();
      displayReportedIMEIs();
      const imeiInput = document.getElementById('imeiInput');
        if (imeiInput) {
          imeiInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
              event.preventDefault(); // Prevent form submission or any default behavior
              getLostDeviceDetails(); // Call the function to report the lost device
            }
          });
        }
    } catch (error) {
      console.error("User denied account access:", error);
    }
  } else {
    alert("Cryptocurrency wallet NOT detected.");
  }
}


function updateHistoryVisibility() {
  const imeiListContainer = document.getElementById('imei-list-container');
  if (historyVisible) {
    imeiListContainer.style.display = 'block';
    setTimeout(() => imeiListContainer.classList.add('show'), 10);
  } else {
    imeiListContainer.classList.remove('show');
    imeiListContainer.addEventListener('transitionend', () => {
      if (!historyVisible) imeiListContainer.style.display = 'none';
    }, { once: true });
  }

  localStorage.setItem('historyVisible', historyVisible.toString());
}

function toggleHistory() {
  historyVisible = !historyVisible;
  updateHistoryVisibility();
}

function loadIMEIsFromLocalStorage() {
  const imeis = JSON.parse(localStorage.getItem('imeiList')) || [];
  const imeiList = document.getElementById('imei-list');
  imeiList.innerHTML = ''; // Clear previous list items

  imeis.forEach(imei => prependIMEIToList(imei));
}

function saveIMEIsToLocalStorage(imeis) {
  localStorage.setItem('imeiList', JSON.stringify(imeis));
}

function prependIMEIToList(imei) {
  const imeiList = document.getElementById('imei-list');
  const li = document.createElement('li');
  li.textContent = imei;
  imeiList.insertBefore(li, imeiList.firstChild); // Prepend the new IMEI to the top of the list
}

async function displayReportedIMEIs() {
  try {
    const imeis = await IMEIContract.methods.getReportedImeis().call();
    console.log("Reported IMEIs:", imeis); // Check the output here

    // if (!imeis || imeis.length === 0) {
    //   console.warn("No IMEIs reported.");
    //   document.getElementById('imei-list').innerHTML = '<li>No IMEIs reported.</li>';
    //   return;
    // }

    const imeiList = document.getElementById('imei-list');
    imeiList.innerHTML = ''; // Clear previous list items

    imeis.forEach(imei => prependIMEIToList(imei));
    saveIMEIsToLocalStorage(imeis);

  } catch (error) {
    console.error("Error fetching reported IMEIs:", error);
  }
}



async function reportLostDevice() {
  const imei = document.getElementById('imeiInput').value;
  const spinner = document.getElementById('loading-spinner');

  if (!imei) return;

  spinner.style.display = 'block'; // Show the loading spinner

  try {
    document.getElementById('details-container').style.display = 'none';
    const exists = await IMEIContract.methods.deviceExists(imei).call();

        if (exists) {
            spinner.style.display = 'none';
            document.getElementById('details-container').style.display = 'block';
            document.getElementById('details-container').innerHTML = `<p>IMEI: <b>${imei}</b> already exists in the list.</p>`;
            clearTextBox(); // Clear input if IMEI exists
            return;
        }
    await IMEIContract.methods.reportLostDevice(imei).send({
      from: accounts[0],
      gas: 300000
    });
    spinner.style.display = 'none';
    document.getElementById('details-container').style.display = 'block';
    document.getElementById('details-container').innerHTML = `<p>Reported lost device with IMEI: <b>${imei}</b></p>`;

    prependIMEIToList(imei);
    const imeis = await IMEIContract.methods.getReportedImeis().call();
    saveIMEIsToLocalStorage(imeis);

    clearTextBox(); // Clear input after reporting

  } catch (error) {
    alert('Error: ' + error.message);
  } 
}



async function getLostDeviceDetails() {
  const imei = document.getElementById('imeiInput').value;
  const spinner = document.getElementById('loading-spinner');

  if (!imei) return;

  spinner.style.display = 'block'; // Show the loading spinner

  try {
    document.getElementById('details-container').style.display = 'none';
    const exists = await IMEIContract.methods.deviceExists(imei).call();

        if (!exists) {
            document.getElementById('details-container').style.display = 'block';
            document.getElementById('details-container').innerHTML = `<p>IMEI: <b>${imei}</b> does <b>NOT</b> exists.</p>`;
            clearTextBox(); // Clear input if IMEI exists
            return;
        }
    spinner.style.display = 'none';
    document.getElementById('details-container').style.display = 'none';
    const result = await IMEIContract.methods.getLostDevice(imei).call();
    const timestamp = parseInt(result[2]);
    const formattedTimestamp = new Date(timestamp * 1000).toLocaleString();

    document.getElementById('details-container').style.display = 'block';
    document.getElementById('details-container').innerHTML = `
      <p><b>IMEI:</b><br> ${result[0]}<br><br>
      <b>Reporter'address:</b><br> ${result[1]}<br><br>
      <b>Timestamp:</b><br>${result[2]}<br><br>
      <b>${formattedTimestamp}</b></p>`;
      clearTextBox();

  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function deviceExists() {
  const imei = document.getElementById('imeiInput').value;
  const spinner = document.getElementById('loading-spinner');

  if (!imei) return;

  spinner.style.display = 'block'; // Show the loading spinner

  try {
    document.getElementById('details-container').style.display = 'none';
    const exists = await IMEIContract.methods.deviceExists(imei).call();
    const message = exists 
      ? `IMEI: <b>${imei}</b> is reported.`
      : `IMEI: <b>${imei}</b> is <b>NOT</b> reported.`;
      
    spinner.style.display = 'none';
    document.getElementById('details-container').style.display = 'block';
    document.getElementById('details-container').innerHTML = `<p>${message}</p>`;
    clearTextBox();
  }
   catch (error) {
    alert('Error: ' + error.message);
  }
}

async function getTotalReportedDevices() {

  const spinner = document.getElementById('loading-spinner');
  spinner.style.display = 'block'; // Show the loading spinner
  try {
    document.getElementById('details-container').style.display = 'none';
    const total = await IMEIContract.methods.getTotalReportedDevices().call();
    spinner.style.display = 'none';
    document.getElementById('details-container').style.display = 'block';
    document.getElementById('details-container').innerHTML = `<p>Total Reported Devices: <b>${total}</b></p>`;
    clearTextBox();

  } catch (error) {
    alert('Error: ' + error.message);
  }
}
function clearTextBox() {
  const imeiInput = document.getElementById('imeiInput');
  if (imeiInput) {
    imeiInput.value = ''; // Clear the input field
  }
}


window.addEventListener('load', initialize);
