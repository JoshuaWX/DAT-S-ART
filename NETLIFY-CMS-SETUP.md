# Netlify CMS Integration Setup Guide

## Overview
This guide will help you complete the setup of Netlify CMS for your Dat's Art website hosted on Vercel. The CMS will allow you to easily manage your gallery and featured artwork through a web-based interface.

## Current Setup Status ✅
- ✅ Netlify CMS configuration files created
- ✅ Admin interface set up at `/admin`
- ✅ Data structure and initial content created
- ✅ API endpoints for content management created
- ✅ Dynamic content loading implemented
- ✅ Vercel configuration updated

## Required Steps to Complete Setup

**Important Note**: You'll have your site deployed on both platforms temporarily:
- **Vercel**: Your main website (keep using this URL for visitors)
- **Netlify**: Only for CMS authentication (you won't use this URL for visitors)

### 1. Enable Netlify Identity (Authentication)

Since your site is hosted on Vercel, you'll need to use Git Gateway for authentication:

1. **Create a Netlify account** (if you don't have one):
   - Go to https://netlify.com and sign up

2. **Deploy your site to Netlify**:
   - In Netlify dashboard, click "New site from Git"
   - Connect your GitHub account
   - Select your DAT-S-ART repository
   - Use these build settings:
     - Build command: (leave empty)
     - Publish directory: (leave empty or set to `/`)
   - Click "Deploy site"
   - Wait for deployment to complete

3. **Enable Identity & Git Gateway** (AFTER site is deployed):
   - Go to your site dashboard on Netlify
   - Navigate to "Identity" tab (this appears after deployment)
   - Click "Enable Identity"
   - Go to "Settings" → "Identity" → "Services"
   - Enable "Git Gateway"

4. **Configure Identity Settings**:
   - Registration: Set to "Invite only" (recommended for security)
   - External providers: You can enable GitHub, Google, etc. if desired

5. **Important**: Since you're using this for CMS only:
   - You now have the site deployed on both Netlify AND Vercel
   - Use your **Vercel URL** for your main website (keep using Vercel for hosting)
   - Use the **Netlify deployment** only for the CMS authentication
   - The CMS on your Vercel site will authenticate through Netlify's identity service

### 2. Deploy to Vercel

Push all the changes to your GitHub repository:

```bash
git add .
git commit -m "Add Netlify CMS integration"
git push origin main
```

Vercel will automatically deploy the changes.

### 3. Configure CMS Authentication

1. **First, make sure all files are pushed to GitHub**:
   ```bash
   git add .
   git commit -m "Add Netlify CMS integration"
   git push origin main
   ```

2. **Enable Identity on your Netlify site**:
   - Go to your Netlify site dashboard
   - Click on "Identity" tab
   - Click "Enable Identity"
   - Go to Settings → Identity → Services
   - Enable "Git Gateway"

3. **Invite yourself as an admin**:
   - In Netlify dashboard → Identity → "Invite users"
   - Add your email address
   - Check your email and accept the invitation
   - Set your password

4. **Access the CMS**:
   - Go to `https://your-vercel-domain.vercel.app/admin` (NOT the Netlify URL)
   - You should see the Netlify CMS login interface
   - Login with your Netlify Identity credentials
   - You should now see the CMS interface with Gallery, Featured Art, and Settings collections

## How to Use the CMS

### Managing Gallery Items
1. Go to `/admin` and login
2. Click on "Gallery" collection
3. Click "New Gallery" to add new artwork
4. Fill in the fields:
   - **Title**: Name of the artwork
   - **Description**: Brief description
   - **Image**: Upload your image file
   - **Category**: Art category (e.g., "Digital Art", "Mixed Media")
   - **Featured**: Check if you want it highlighted
   - **Order**: Number for display order (1 = first)

### Managing Featured Art
1. Click on "Featured Art" collection
2. Click "New Featured Art" to add new featured piece
3. Fill in all fields including price and availability
4. Set order for display sequence

### Managing Site Settings
1. Click on "Site Settings"
2. Update general information like contact details
3. Changes will be reflected across the site

## File Structure Created

```
your-project/
├── admin/
│   ├── config.yml          # CMS configuration
│   └── index.html          # CMS admin interface
├── _data/                  # Content data directory
│   ├── gallery/           # Gallery content files
│   ├── featured/          # Featured art content files
│   └── settings.yml       # Site settings
├── api/                   # Vercel API functions
│   ├── collections.js     # API for loading collections
│   ├── cms-content.js     # API for individual files
│   └── settings.js        # API for settings
├── scripts/
│   └── cms-content.js     # Frontend CMS content loader
└── vercel.json           # Updated Vercel configuration
```

## Features Available

### Content Management
- ✅ Add/edit/delete gallery items
- ✅ Add/edit/delete featured artworks  
- ✅ Upload and manage images
- ✅ Reorder content with order field
- ✅ Control availability of featured items
- ✅ Edit site-wide settings

### Technical Features
- ✅ Git-based workflow (changes saved to repository)
- ✅ Preview content before publishing
- ✅ Image optimization and CDN delivery
- ✅ Responsive admin interface
- ✅ Editorial workflow support

## Troubleshooting

### "Error loading the CMS configuration" (Config.yml 404 error)
This error means the CMS can't find the config.yml file. Here's how to fix it:

1. **Check which URL you're using**:
   - ❌ Don't use: `https://your-netlify-site.netlify.app/admin` (this won't work properly with our setup)
   - ✅ Use: `https://your-vercel-site.vercel.app/admin` (your main site)

2. **If you're on the correct Vercel URL and still getting the error**:
   - The issue might be that the admin folder files weren't committed to your repository
   - Check that both `admin/config.yml` and `admin/index.html` exist in your GitHub repo

3. **Make sure files are committed and pushed**:
   ```bash
   git add admin/
   git add _data/
   git add api/
   git add scripts/cms-content.js
   git commit -m "Add Netlify CMS files"
   git push origin main
   ```

4. **Verify the admin folder structure**:
   Your repository should have:
   ```
   admin/
   ├── config.yml
   └── index.html
   ```

### Can't access /admin
- Check that Netlify Identity is properly enabled on your Netlify deployment
- Verify your site URL is correctly set in Netlify
- Make sure you've accepted the invitation email
- Try accessing the admin via your Vercel URL, not Netlify URL

### Changes not showing on site
- Check that content is "Published" not just saved as draft
- Verify API endpoints are working by visiting `/api/collections?collection=gallery`
- Check browser console for any JavaScript errors

### Images not uploading
- Ensure Git Gateway is enabled in Netlify Identity settings
- Check that the media folder path is correct in config.yml
- Verify repository permissions

## Security Notes

- Keep "Registration" set to "Invite only"
- Only invite trusted users as admins
- Consider enabling external provider authentication (GitHub, Google) for better security
- Regularly review who has access in Netlify Identity dashboard

## Next Steps

After completing the setup:
1. Test adding a new gallery item
2. Test adding a new featured artwork
3. Verify changes appear on your live site
4. Invite other team members if needed
5. Consider setting up automated backups of your content

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all API endpoints are working
3. Check Netlify Identity configuration
4. Review the CMS logs in Netlify dashboard

The CMS is now ready to use! You can manage all your artwork content through the user-friendly web interface at `/admin`.