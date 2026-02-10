# Supabase Setup Guide

This guide will help you set up Supabase for REPOT authentication and database.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project name**: `REPOT` (or your preferred name)
   - **Database password**: Create a strong password (save it securely)
   - **Region**: Choose closest to your users
5. Click "Create new project" (this takes ~2 minutes)

## 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

3. Update your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Set Up Database Tables

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  name text not null,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create identifications table (for storing user's mushroom identifications)
create table public.identifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  species text not null,
  confidence numeric not null,
  identified_by text not null,
  image_url text,
  found_in_database boolean default false,
  location text,
  created_at timestamp with time zone default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.identifications enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Identifications policies
create policy "Users can view their own identifications"
  on public.identifications for select
  using (auth.uid() = user_id);

create policy "Users can insert their own identifications"
  on public.identifications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own identifications"
  on public.identifications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own identifications"
  on public.identifications for delete
  using (auth.uid() = user_id);

-- Create function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for profiles updated_at
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function handle_updated_at();

-- Create indexes for better performance
create index identifications_user_id_idx on public.identifications(user_id);
create index identifications_created_at_idx on public.identifications(created_at desc);
create index identifications_species_idx on public.identifications(species);
```

## 4. Configure Email Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Email provider should be enabled by default
3. Optional: Configure email templates under **Authentication** → **Email Templates**

## 5. Configure Email Settings (Optional but Recommended)

For production, set up custom SMTP:

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enable custom SMTP and configure your email provider (Gmail, SendGrid, etc.)

## 6. Test Your Setup

1. Restart your development server:
```bash
npm run dev
```

2. Navigate to `/auth` and try signing up with a new account
3. Check your email for confirmation link
4. Verify in Supabase dashboard under **Authentication** → **Users**

## Common Issues

### "Invalid API key"
- Make sure you're using the **anon/public** key, not the service role key
- Check for extra spaces in your `.env` file

### "Email not confirmed"
- For development, you can disable email confirmation in **Authentication** → **Providers** → **Email** → Disable "Confirm email"
- For production, keep it enabled for security

### "Row Level Security" errors
- Make sure you ran all the SQL policies
- Check that RLS is enabled on both tables

## Next Steps

- Set up email storage for mushroom images (Supabase Storage)
- Configure password reset email template
- Add social authentication (Google, GitHub, etc.)
- Set up database backups

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
