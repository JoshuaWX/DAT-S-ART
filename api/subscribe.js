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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Send welcome email after successful Mailchimp subscription
            try {
                console.log('Attempting to send welcome email to:', email);
                const emailResult = await sendWelcomeEmail(email);
                console.log('Welcome email sent successfully:', emailResult);
            } catch (emailError) {
                console.error('Welcome email failed:', emailError);
                console.error('EmailJS error details:', emailError.message);
                // Don't fail the whole request if email fails
            }

            // Success
            return res.status(200).json({
                success: true,
                message: 'Successfully subscribed to newsletter! 🎉 Welcome email is being sent - please check your Gmail inbox or Promotions tab within the next 5 minutes.',
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

// Send welcome email using EmailJS
async function sendWelcomeEmail(subscriberEmail) {
    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || 'service_vbar1qp';
    const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_9980p4c';
    const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || 'DuJICjw7gRklu_MSr';
    const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    if (!EMAILJS_PRIVATE_KEY) {
        console.log('EmailJS private key missing, skipping welcome email. Required env var: EMAILJS_PRIVATE_KEY');
        return;
    }

    // Prepare template parameters for EmailJS
    const templateParams = {
        to_email: subscriberEmail,
        to_name: subscriberEmail.split('@')[0], // Use email prefix as name
        from_name: 'DAT\'S ART',
        subject: '🎨 Welcome to DAT\'S ART Newsletter!',
        // Match your actual website URL from the template
        website_url: 'https://datsart-official.vercel.app/',
        gallery_url: 'https://datsart-official.vercel.app/#gallery',
        // Additional data that might be useful in the template
        subscriber_email: subscriberEmail,
        signup_date: new Date().toLocaleDateString(),
        current_year: new Date().getFullYear(),
        // Social media links (you can update these with your actual links)
        instagram_url: '#',
        twitter_url: '#',
        // Custom message if needed
        welcome_message: 'Welcome to the DAT\'S ART newsletter! You\'re now part of an exclusive community that explores the fascinating intersection of code and creativity.'
    };

    // EmailJS REST API endpoint for server-side usage
    const emailjsUrl = 'https://api.emailjs.com/api/v1.0/email/send';

    const requestData = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: templateParams
    };

    try {
        console.log('EmailJS request data:', JSON.stringify(requestData, null, 2));

        const response = await fetch(emailjsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log('EmailJS response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('EmailJS API error response:', errorText);
            throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
        }

        const result = await response.text(); // EmailJS returns plain text response
        console.log('Welcome email sent successfully via EmailJS:', result);
        return { success: true, response: result };
    } catch (error) {
        console.error('Failed to send welcome email via EmailJS:', error);
        console.error('Error details:', error.message);
        throw error;
    }
}
