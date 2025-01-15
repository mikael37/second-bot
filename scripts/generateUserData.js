const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
    keyFile: './config/google.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function readFromSheet(range) {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = '145RPOiOfbqfwuAe3wm62or-O0y2IkHorU2Qz1SPbOa8';

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        return res.data.values;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function getHeaders(range) {
    const headerRange = range.replace(/!\w+\d*:\w+\d*$/, '!A1:H1'); // Adjust for the first row of the columns
    const headers = await readFromSheet(headerRange);
    return headers ? headers[0] : [];
}

function processData(data, headers) {
    if (!data || data.length === 0) {
        console.log('No valid data found.');
        return [];
    }

    const discordIdIndex = headers.indexOf('Discord ID');
    const inGameUsernameIndex = headers.indexOf('In-game Username');
    const allianceIndex = headers.indexOf('Alliance');
    const multiAccountIndex = headers.indexOf('Sharing/Multi-Account');

    if (discordIdIndex === -1) {
        console.error('Discord ID column not found.');
        return [];
    }

    const processedDiscordIds = new Set();
    const userData = [];

    data.forEach((row, index) => {
        // console.log(`Row ${index + 1}:`, row); // Inspect each row's content

        if (!row || row.length === 0) {
            console.log(`Row ${index + 1}: Empty row. Skipping.`);
            return;
        }

        // Check if required fields (first three columns) are empty
        if (!row[0] || !row[1] || !row[2]) {
            console.log(`Row ${index + 1}: One of the required columns is empty. Skipping.`);
            return;
        }

        const discordId = row[discordIdIndex]?.toString();
        const inGameUsername = row[inGameUsernameIndex]?.toString() || '';
        let alliance = row[allianceIndex]?.toString() || '';
        const multiAccount = row[multiAccountIndex]?.toLowerCase() === 'true';

        if (!discordId || !inGameUsername) {
            console.log(`Row ${index + 1}: Missing Discord ID or In-game Username. Skipping.`);
            return;
        }

        if (!alliance || alliance.trim() === '') {
            console.log(`Row ${index + 1}: Alliance column is empty. Skipping.`);
            return;
        }

        if (alliance.toLowerCase() === 'none') {
            alliance = 'None';
        }

        if (multiAccount && !processedDiscordIds.has(discordId)) {
            let combinedUsernames = inGameUsername;
            data.forEach((otherRow, otherIndex) => {
                if (otherIndex !== index && otherRow[discordIdIndex]?.toString() === discordId) {
                    combinedUsernames += ` & ${otherRow[inGameUsernameIndex]}`;
                }
            });

            userData.push({
                discordId,
                inGameUsername: combinedUsernames,
                alliance
            });
            processedDiscordIds.add(discordId);
        } else if (!multiAccount) {
            userData.push({
                discordId,
                inGameUsername,
                alliance
            });
        }
    });

    return userData;
}

(async () => {
    const range = 'Main Database!A400:H450'; // Full range, including headers
    const dataRange = range.replace(/!\w+\d*:\w+\d*$/, '!A400:H450'); // Data range excluding header row

    // Get headers dynamically
    const headers = (await getHeaders(range)).map(header => header.trim());

    if (headers.length === 0) {
        console.error('Failed to detect headers. Exiting.');
        return;
    }

    console.log('Detected Headers:', headers);

    // Read data excluding the header row
    const data = await readFromSheet(dataRange);

    if (!data || data.length === 0) {
        console.log('No data retrieved from the sheet.');
        return;
    }

    // console.log('Raw Data:', data);

    // Process the data
    const processedData = processData(data, headers);

    if (processedData.length > 0) {
        fs.writeFile('userData.json', JSON.stringify(processedData, null, 4), (err) => {
            if (err) {
                console.error('Error writing JSON file:', err.message);
            } else {
                console.log('User data successfully saved to user_data.json.');
            }
        });
    } else {
        console.log('No data to save.');
    }
})();
