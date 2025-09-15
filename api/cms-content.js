const fs = require('fs').promises;
const path = require('path');

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { collection, file } = req.query;

    if (!collection || !file) {
        return res.status(400).json({ error: 'Collection and file parameters required' });
    }

    try {
        // Get the absolute path to the _data directory
        const dataPath = path.join(process.cwd(), '_data', collection, file);
        
        // Check if file exists and read it
        const fileContent = await fs.readFile(dataPath, 'utf8');
        
        // Parse front matter
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
        const match = fileContent.match(frontMatterRegex);
        
        if (match) {
            const yamlContent = match[1];
            const data = parseYAML(yamlContent);
            res.status(200).json(data);
        } else {
            res.status(400).json({ error: 'Invalid markdown format' });
        }
    } catch (error) {
        console.error('Error reading file:', error);
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'File not found' });
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