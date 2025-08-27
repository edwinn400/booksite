# 🚀 Supabase Setup Guide for Cross-Device Sync

Your booksite now supports **cross-device synchronization**! All your book entries will be stored in the cloud and accessible from any device.

## 📋 What This Enables

✅ **Cross-device access** - View your books from any device  
✅ **Real-time sync** - Changes appear instantly everywhere  
✅ **Data backup** - Your entries are safely stored in the cloud  
✅ **Offline fallback** - Works even when internet is down  
✅ **Automatic migration** - Your existing entries are preserved  

## 🔧 Setup Steps

### Step 1: Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up with GitHub
3. Create a new organization (free tier is sufficient)

### Step 2: Create a New Project
1. Click "New Project"
2. Choose your organization
3. Enter project details:
   - **Name**: `booksite` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait for setup to complete (2-3 minutes)

### Step 3: Get Your Project Credentials
1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### Step 4: Update Your Configuration
1. Open `config.js` in your project
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'https://YOUR_ACTUAL_PROJECT_URL.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_ACTUAL_ANON_KEY';
   ```

### Step 5: Create the Database Table
1. In Supabase dashboard, go to **SQL Editor**
2. Run this SQL command:
   ```sql
   CREATE TABLE book_entries (
       id BIGINT PRIMARY KEY,
       title TEXT NOT NULL,
       author TEXT NOT NULL,
       publication_year TEXT,
       year_read TEXT,
       genres TEXT[],
       favorite TEXT,
       thoughts TEXT,
       latitude TEXT,
       longitude TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
3. Click "Run" to create the table

### Step 6: Test Your Setup
1. Save all files
2. Refresh your website
3. Add a new book entry
4. Check the browser console for success messages
5. Your existing entries will automatically migrate to the cloud!

## 🔍 How It Works

- **New entries** are saved to both cloud and local storage
- **Existing entries** are automatically migrated on first load
- **Offline mode** falls back to localStorage if cloud is unavailable
- **Real-time sync** ensures all devices stay updated

## 🚨 Troubleshooting

### "Supabase client not initialized"
- Check that `config.js` is loaded before `script.js`
- Verify your URL and key are correct

### "Table doesn't exist"
- Make sure you ran the SQL command in Step 5
- Check the table name matches exactly: `book_entries`

### "Migration failed"
- Check browser console for specific error messages
- Verify your Supabase project is active and accessible

## 💡 Pro Tips

- **Free tier limits**: 500MB database, 50,000 monthly active users
- **Backup**: Your data is automatically backed up by Supabase
- **Security**: All data is encrypted and secure
- **Performance**: Cloud database is much faster than localStorage

## 🎯 Next Steps

Once setup is complete:
1. **Test on different devices** - Your entries should appear everywhere!
2. **Share with friends** - They can see your reading list (if you want)
3. **Monitor usage** - Check Supabase dashboard for analytics

## 🆘 Need Help?

- Check the browser console for error messages
- Verify your Supabase credentials are correct
- Ensure the database table was created successfully
- Check that all files are saved and loaded in the correct order

---

**🎉 Congratulations!** Your booksite now syncs across all devices automatically! 