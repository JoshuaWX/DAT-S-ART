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

    const { collection } = req.query;

    if (!collection) {
        return res.status(400).json({ error: 'Collection parameter required' });
    }

    try {
        // Get the absolute path to the collection directory
        const collectionPath = path.join(process.cwd(), '_data', collection);
        
        // Read all files in the collection directory
        const files = await fs.readdir(collectionPath);
        const markdownFiles = files.filter(file => file.endsWith('.md'));
        
        const items = [];
        
        for (const file of markdownFiles) {
            try {
                const filePath = path.join(collectionPath, file);
                const fileContent = await fs.readFile(filePath, 'utf8');
                
                // Parse front matter
                const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
                const match = fileContent.match(frontMatterRegex);
                
                if (match) {
                    const yamlContent = match[1];
                    const data = parseYAML(yamlContent);
                    data.filename = file;
                    items.push(data);
                }
            } catch (fileError) {
                console.error(`Error reading file ${file}:`, fileError);
            }
        }
        
        // Sort by order field if available
        items.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        res.status(200).json(items);
    } catch (error) {
        console.error('Error reading collection:', error);
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Collection not found' });
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