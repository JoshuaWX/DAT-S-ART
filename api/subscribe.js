// Vercel Serverless Function for Mailchimp Newsletter Subscription
// File: /api/subscribe.js

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Only POST requests are allowed' 
        });
    }

    try {
        const { email } = req.body;

        // Basic email validation
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ 
                error: 'Invalid email',
                message: 'Please provide a valid email address' 
            });
        }

        // Mailchimp configuration
        const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
        const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
        const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., 'us1', 'us2', etc.

        if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID || !MAILCHIMP_SERVER_PREFIX) {
            console.error('Missing Mailchimp configuration');
            return res.status(500).json({ 
                error: 'Configuration error',
                message: 'Server configuration incomplete' 
            });
        }

        // Mailchimp API endpoint
        const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

        // Prepare the request data
        const data = {
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: email.split('@')[0], // Use email prefix as first name
                LNAME: '',
                SOURCE: 'Website Subscription',
                SIGNUP_DATE: new Date().toISOString().split('T')[0]
            },
            tags: ['website-subscriber', 'dats-art-newsletter']
        };

        // Make request to Mailchimp API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Success
            return res.status(200).json({ 
                success: true,
                message: 'Successfully subscribed to newsletter!',
                subscriber_id: result.id
            });
        } else if (response.status === 400 && result.title === 'Member Exists') {
            // Email already subscribed
            return res.status(200).json({ 
                success: true,
                message: 'You\'re already subscribed to our newsletter!',
                already_subscribed: true
            });
        } else {
            // Mailchimp API error
            console.error('Mailchimp API error:', result);
            return res.status(400).json({ 
                error: 'Subscription failed',
                message: result.detail || 'Unable to subscribe at this time'
            });
        }

    } catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Something went wrong. Please try again later.'
        });
    }
}

// Email validation helper function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
