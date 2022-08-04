let db;
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    // When database is created or opened, save the database object in global variable db
    db = event.target.result;
    // Check if app is online before reading from database
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    // Log error
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    // Create a transaction on the database
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // Access the transaction object created in the database
    const store = transaction.objectStore('new_transaction');
    // Add record to the database
    store.add(record);
};

function uploadTransaction() {
    // Create a transaction on the database
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // Access the transaction object created in the database
    const store = transaction.objectStore('new_transaction');
    // Get all records from the database
    const getAll = store.getAll();
    
    getAll.onsuccess = function() {
        // If there's data in the database, upload it to the server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const store = transaction.objectStore('new_transaction');
                // clear items from store
                store.clear();

                alert('All saved transactions have been saved.');
            })
            .catch(err => {
                console.log(err);
                alert('Something went wrong. Please try again.');
            });
        }
    };
}

// Listen for app coming back online
window.addEventListener('online', uploadTransaction);