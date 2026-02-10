# REPOT - Nature's ID

AI-powered mushroom and plant species identification application using BioCLIP and Nvidia Nemotron VLM models.

## Features

- **Email Authentication**: Secure user authentication with Supabase
- **Image Upload & Camera Capture**: Upload photos or use your device camera
- **BioCLIP Recognition**: Fast, accurate species identification using biological image models
- **VLM Fallback**: Nvidia Nemotron VLM for enhanced accuracy when BioCLIP confidence is low
- **MCC Campus Database**: Location data for species found at MCC campus
- **Interactive Maps**: View exact locations on Google Maps
- **Real-time Results**: Instant species identification with confidence scores
- **User Profiles**: Save and track your identification history

## Getting Started

**Local Development**

Requirements: Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Install dependencies
npm install

# Set up Supabase (see SUPABASE_SETUP.md for detailed instructions)
# Create a Supabase project at https://supabase.com
# Copy your credentials to .env file

# Create .env file with required environment variables
cat > .env << EOF
VITE_API_URL=http://localhost:7860
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
EOF

# Start development server
npm run dev
```

**⚠️ Important: Supabase Setup Required**

Before running the app, you must set up Supabase for authentication. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

## Backend Setup

The backend API must be running for species recognition to work.

```sh
# Navigate to backend directory
cd ../REPOT

# Install Python dependencies
pip install -r requirements.txt

# Set OpenRouter API key for VLM fallback (optional)
export OPENROUTER_API_KEY=your_api_key_here

# Run the API server
python api.py
- Supabase (Authentication & Database)
```

The API will run on `http://localhost:7860` by default.

## Technology Stack

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn-ui components
- React Router

**Backend:**
- FastAPI
- BioCLIP (Biological Image Recognition)
- OpenCLIP
- Nvidia Nemotron VLM via OpenRouter
- Pandas for database management

## Project Structure

```
frontend/REPOT-nature-s-id-main/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities and API client
│   ├── contexts/       # React contexts
│   └── data/           # Mock data
├── public/             # Static assets
└── .env                # Environment variables

REPOT/
├── api.py              # FastAPI backend
├── data/               # Species database
└── requirements.txt    # Python dependencies
```

## Environment Variables

**Frontend (.env):**
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:7860
```

**Backend:**
```
OPENROUTER_API_KEY=your_key_here  # Optional, for VLM fallback
```

## License

MIT
