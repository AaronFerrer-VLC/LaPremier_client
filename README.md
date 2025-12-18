# LaPremier Client

Frontend application for LaPremier - A cinema and movie management system built with React and Vite.

## Features

- 🎬 Movie and Cinema management
- 🔍 Advanced filtering and search
- 📊 Statistics and analytics
- 🗺️ Interactive maps for cinema locations
- ⭐ Movie reviews and ratings
- 🔐 Admin authentication
- 📱 Responsive design with Bootstrap
- 🎨 Modern UI/UX

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Bootstrap 5** - UI framework
- **React Bootstrap** - Bootstrap components for React
- **@nivo/pie** - Data visualization
- **@react-google-maps/api** - Google Maps integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```env
VITE_APP_API_URL=http://localhost:5005
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
LaPremier_client/
├── src/
│   ├── components/        # Reusable components
│   │   ├── CinemaCard/
│   │   ├── MovieCard/
│   │   ├── Navigation/
│   │   ├── ErrorBoundary/
│   │   └── ...
│   ├── config/           # Configuration files
│   │   ├── constants.js  # App constants
│   │   └── env.js        # Environment variables
│   ├── contexts/         # React contexts
│   │   └── auth.context.jsx
│   ├── pages/            # Page components
│   │   ├── CinemaPages/
│   │   ├── MoviePages/
│   │   └── ...
│   ├── routes/           # Route configuration
│   │   └── AppRoutes.jsx
│   ├── services/         # API services
│   │   ├── api.service.js
│   │   ├── movies.service.js
│   │   ├── cinemas.service.js
│   │   └── reviews.service.js
│   ├── utils/            # Utility functions
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── public/               # Static assets
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## Routes

| Path                      | Description                     |
| ------------------------- | ------------------------------- |
| `/`                       | Home page                       |
| `/cines`                  | List all cinemas                |
| `/cines/detalles/:id`     | Cinema details                  |
| `/cines/crear`            | Create new cinema (admin)       |
| `/cines/editar/:id`       | Edit cinema (admin)             |
| `/cines/eliminados`       | Restore deleted cinemas (admin) |
| `/peliculas`              | List all movies                 |
| `/peliculas/detalles/:id` | Movie details                   |
| `/peliculas/crear`        | Create new movie (admin)        |
| `/peliculas/editar/:id`   | Edit movie (admin)              |
| `/peliculas/eliminados`   | Restore deleted movies (admin)  |
| `/peliculas/reseña/:id`   | Review a movie                  |
| `/datos`                  | Statistics page (admin)         |

## Authentication

Default admin credentials:

**Authentication:**
- Authentication is handled by the backend using JWT tokens
- Create an admin user using: `node scripts/createAdminUser.js` in the server directory
- Default credentials are set via environment variables (see server README)

## Environment Variables

| Variable                   | Description         | Required          |
| -------------------------- | ------------------- | ----------------- |
| `VITE_APP_API_URL`         | Backend API URL     | Yes               |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API Key | No (has fallback) |

## Development

### Code Style

The project uses ESLint for code quality. Run `npm run lint` to check for issues.

### Error Handling

The application includes:

- Error Boundary for React error catching
- Centralized error handling utilities
- User-friendly error messages

### API Integration

All API calls are centralized in the `services/` directory:

- `api.service.js` - Base axios instance with interceptors
- `movies.service.js` - Movie-related API calls
- `cinemas.service.js` - Cinema-related API calls
- `reviews.service.js` - Review-related API calls

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add error handling for API calls
4. Write clean, maintainable code
5. Test your changes thoroughly

## License

ISC
