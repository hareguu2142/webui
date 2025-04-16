document.getElementById('submitBtn').addEventListener('click', function() {
    const inputValue = document.getElementById('myInput').value;

    // --- Path Correction for fetch ---
    // Since both the HTML file and data.json are outside the 'map' folder
    // and presumably in the same directory, the path is simply 'data.json'.
    fetch('data.json')
        .then(response => {
            // Check if the network request was successful
            if (!response.ok) {
                // If not, throw an error to be caught by .catch()
                throw new Error('Network response was not ok ' + response.statusText);
            }
            // Parse the response body as JSON
            return response.json();
        })
        .then(data => {
            // Successfully parsed the JSON data
            // Check if the input value matches the 'code' property from data.json
            if (inputValue === data.code) {
                // Construct the filename of the next HTML file (e.g., "page2.html")
                const nextHtmlFilename = `${data.next}.html`;

                // --- Path Correction for redirection ---
                // Since the current HTML is *outside* the 'map' folder,
                // and the next HTML file (e.g., "page2.html") is *inside*
                // the 'map' folder, we need to specify the 'map/' directory
                // in the path for redirection.
                const nextHtmlPath = `map/${nextHtmlFilename}`;

                // Redirect the browser to the next HTML file inside the 'map' folder
                window.location.href = nextHtmlPath;
            } else {
                // Input code doesn't match the code in data.json
                alert('입력한 코드가 일치하지 않습니다.'); // Alert: "Entered code does not match."
            }
        })
        .catch(error => {
            // Handle errors during fetch or JSON processing
            console.error('Error fetching or processing data.json:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.'); // Alert: "An error occurred while loading data."
        });
});