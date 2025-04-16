document.getElementById('submitBtn').addEventListener('click', function() {
    const inputValue = document.getElementById('myInput').value;

    // Fetch the data from data.json
    // Note: Assumes data.json is in the root directory relative to the HTML file's location
    fetch('../data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Check if the input value matches the code in data.json
            if (inputValue === data.code) {
                // Construct the path to the next HTML file
                // Assumes the next HTML file is in the same 'map' directory
                const nextHtmlFile = `${data.next}.html`;
                // Redirect the browser
                window.location.href = nextHtmlFile; // Relative path from start.html
            } else {
                // Optional: Provide feedback if the code doesn't match
                alert('입력한 코드가 일치하지 않습니다.');
            }
        })
        .catch(error => {
            console.error('Error fetching or processing data.json:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        });
});
