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

    // Security: Validate input parameters to prevent path traversal
    const safePathRegex = /^[a-zA-Z0-9._-]+$/;
    if (!safePathRegex.test(collection) || !safePathRegex.test(file)) {
        return res.status(400).json({ error: 'Invalid characters in collection or file parameter' });
    }

    // Security: Prevent path traversal sequences
    if (collection.includes('..') || file.includes('..')) {
        return res.status(400).json({ error: 'Path traversal not allowed' });
    }

    try {
        // Get the absolute path to the _data directory
        const dataDir = path.join(process.cwd(), '_data');
        const requestedPath = path.join(dataDir, collection, file);
        
        // Security: Ensure the resolved path is within the _data directory
        const resolvedPath = path.resolve(requestedPath);
        const resolvedDataDir = path.resolve(dataDir);
        
        if (!resolvedPath.startsWith(resolvedDataDir + path.sep) && resolvedPath !== resolvedDataDir) {
            return res.status(403).json({ error: 'Access denied: Path outside allowed directory' });
        }
        
        const dataPath = resolvedPath;
        
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
    let currentKey = null;
    let currentValue = '';
    let isMultiLine = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        if (trimmed && !trimmed.startsWith('#')) {
            const colonIndex = trimmed.indexOf(':');
            
            if (colonIndex > -1 && !isMultiLine) {
                // Finish previous multi-line value if exists
                if (currentKey && currentValue) {
                    data[currentKey] = currentValue.trim();
                    currentValue = '';
                }
                
                currentKey = trimmed.substring(0, colonIndex).trim();
                let value = trimmed.substring(colonIndex + 1).trim();
                
                // Check for multi-line indicators
                if (value === '|' || value === '>') {
                    isMultiLine = true;
                    currentValue = '';
                    continue;
                }
                
                // Remove quotes
                if ((value.startsWith('"') && value.endsWith('"')) || 
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                // Convert boolean and number values
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                else if (!isNaN(value) && value !== '') value = Number(value);
                
                data[currentKey] = value;
                currentKey = null;
            } else if (isMultiLine && currentKey) {
                // Handle multi-line content
                if (trimmed === '' || line.startsWith('  ')) {
                    currentValue += (currentValue ? '\n' : '') + line.substring(2); // Remove 2-space indent
                } else {
                    // End of multi-line, start new key
                    data[currentKey] = currentValue.trim();
                    currentValue = '';
                    isMultiLine = false;
                    i--; // Re-process this line as a new key
                }
            }
        }
    }
    
    // Handle final multi-line value
    if (currentKey && currentValue) {
        data[currentKey] = currentValue.trim();
    }
    
    return data;
}