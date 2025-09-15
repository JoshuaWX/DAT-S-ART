const fs = require('fs').promises;
const path = require('path');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the absolute path to the settings file
        const settingsPath = path.join(process.cwd(), '_data', 'settings.yml');
        
        // Check if file exists and read it
        const fileContent = await fs.readFile(settingsPath, 'utf8');
        
        // Parse YAML content
        const data = parseYAML(fileContent);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error reading settings:', error);
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Settings file not found' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

function parseYAML(yamlContent) {
    const lines = yamlContent.split('\n');
    const data = {};
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const colonIndex = trimmed.indexOf(':');
            if (colonIndex > -1) {
                const key = trimmed.substring(0, colonIndex).trim();
                let value = trimmed.substring(colonIndex + 1).trim();
                
                // Remove quotes
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                // Convert boolean and number values
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                else if (!isNaN(value) && value !== '') value = Number(value);
                
                data[key] = value;
            }
        }
    }
    
    return data;
}