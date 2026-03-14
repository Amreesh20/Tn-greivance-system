const { extractDistrict, classifyComplaint } = require('../services/mlService');

async function testMLFlow(req, res) {
    const testCases = [
        "Pothole near Madurai hospital",
        "Water leak in Chennai Tambaram",
        "Road broken in Coimbatore",
        "School wall collapsed Madrui",
        "No location power cut"
    ];

    const results = [];
    for (const text of testCases) {
        const districtId = await extractDistrict(text);
        const department = await classifyComplaint(text);
        results.push({ text, districtId, department });
    }

    res.json({
        success: true,
        tests: results,
        mlService: 'http://localhost:5000 ✅'
    });
}

module.exports = { testMLFlow };
