const fs = require('fs');
const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const json = JSON.parse(data);
        const bidiModels = json.models.filter(m =>
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes('bidiGenerateContent')
        );

        console.log('Models supporting bidiGenerateContent on v1beta:');
        bidiModels.forEach(m => console.log(`- ${m.name} (${m.displayName})`));

        // Also check v1alpha just in case
        const urlAlpha = `https://generativelanguage.googleapis.com/v1alpha/models?key=${apiKey}`;
        https.get(urlAlpha, (resAlpha) => {
            let dataAlpha = '';
            resAlpha.on('data', (chunk) => { dataAlpha += chunk; });
            resAlpha.on('end', () => {
                const jsonAlpha = JSON.parse(dataAlpha);
                const bidiModelsAlpha = (jsonAlpha.models || []).filter(m =>
                    m.supportedGenerationMethods && m.supportedGenerationMethods.includes('bidiGenerateContent')
                );
                console.log('\nModels supporting bidiGenerateContent on v1alpha:');
                bidiModelsAlpha.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
            });
        });
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
