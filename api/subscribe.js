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
            // Send welcome email after successful Mailchimp subscription
            try {
                await sendWelcomeEmail(email);
            } catch (emailError) {
                console.error('Welcome email failed:', emailError);
                // Don't fail the whole request if email fails
            }

            // Success
            return res.status(200).json({ 
                success: true,
                message: 'Successfully subscribed to newsletter! Check your email for confirmation.',
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

// Send welcome email using Resend API
async function sendWelcomeEmail(subscriberEmail) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
        console.log('No Resend API key found, skipping welcome email');
        return;
    }

    const welcomeEmailData = {
        from: 'DAT\'S ART <noreply@yourdomain.com>', // You'll need to verify your domain
        to: [subscriberEmail],
        subject: '🎨 Welcome to DAT\'S ART Newsletter!',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #c9a967, #b8956d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
                .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .benefit { margin: 10px 0; padding: 5px 0; }
                .cta { background: #c9a967; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">DAT'S ART</div>
                <h1>Welcome to the Newsletter! 🎨</h1>
            </div>
            
            <div class="content">
                <p>Hi there!</p>
                
                <p>Thank you for subscribing to <strong>DAT'S ART</strong> newsletter! You've just joined an exclusive community of art lovers.</p>
                
                <div class="benefits">
                    <h3>Here's what you'll receive:</h3>
                    <div class="benefit">✨ <strong>New Artwork Announcements</strong> - Be the first to see my latest creations</div>
                    <div class="benefit">🎨 <strong>Behind-the-Scenes Content</strong> - Discover my creative process</div>
                    <div class="benefit">💎 <strong>Exclusive Previews</strong> - Get sneak peeks before anyone else</div>
                    <div class="benefit">📧 <strong>Monthly Art Updates</strong> - Curated content just for subscribers</div>
                    <div class="benefit">🎁 <strong>Free Downloads</strong> - Access to exclusive digital art pieces</div>
                </div>
                
                <p>Want to explore my current gallery? Check out my latest work:</p>
                
                <a href="https://yourdomain.com/#gallery" class="cta">View Gallery →</a>
                
                <p>Thanks again for joining the DAT'S ART community. I can't wait to share my artistic journey with you!</p>
                
                <p>Best regards,<br><strong>DAT'S ART</strong></p>
            </div>
            
            <div class="footer">
                <p>You're receiving this because you subscribed to DAT'S ART newsletter.<br>
                You can unsubscribe anytime from your Mailchimp preferences.</p>
            </div>
        </body>
        </html>
        `
    };

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(welcomeEmailData)
        });

        if (!response.ok) {
            throw new Error(`Resend API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Welcome email sent successfully:', result.id);
        return result;
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        throw error;
    }
}
