# Nouasseur Events Website

A modern events website built with Bun.js, Elysia, React, and PostgreSQL, featuring a clean dark/light theme UI. This platform serves as the official events portal for the Nouasseur community.

## Features

- **Events Listing**: Browse and search through community events with sorting by date
- **Dark/Light Mode**: Toggle between dark and light themes for better user experience
- **User Authentication**: Register and login functionality
- **API Endpoints**: RESTful API for events and users
- **Modern UI**: Clean design using Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Database Integration**: PostgreSQL database integration for data persistence

## Tech Stack

- **Bun.js**: JavaScript runtime and toolkit designed for speed
- **Elysia**: Ergonomic framework for Bun with strong TypeScript support
- **HTML Rendering**: Server-side HTML rendering with @elysiajs/html
- **PostgreSQL**: Robust database for storing events and user data
- **Drizzle ORM**: Type-safe database toolkit for TypeScript
- **TailwindCSS**: Utility-first CSS framework for rapid UI development

## Project Structure

```
nouasseur-site/
├── public/          # Static assets
├── src/             # Source code
│   ├── components/  # UI components
│   ├── db/          # Database configurations and models
│   ├── pages/       # Page templates
│   ├── routes/      # API routes and handlers
│   ├── styles/      # Tailwind and CSS styles
│   └── utils/       # Utility functions
├── .env             # Environment variables (not in repo)
├── docker-compose.yml # Docker configuration
├── init.sql         # Database initialization script
└── ...
```

## Getting Started

### Using Docker Compose (Recommended)

The easiest way to get started is using Docker Compose, which will set up both the PostgreSQL database and the Bun.js application:


1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nouasseur-events.git
   cd nouasseur-events
   ```

2. Start the application with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Open your browser and navigate to `http://localhost:3000`

The database will be automatically initialized with the schema and sample data.

### Manual Installation

#### Prerequisites

- Bun.js installed (v1.0.0 or higher)
- PostgreSQL server
- Node.js 18+

#### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nouasseur-events.git
   cd nouasseur-events
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a PostgreSQL database and execute the SQL in `init.sql`

4. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgres://yourusername:yourpassword@localhost:5432/nouasseur_events
   PORT=3000
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
bun run build
bun run start
```

## Development

### Adding New Events

Events can be added through the admin interface or directly to the database. The event schema includes:
- Title
- Description
- Start Date/Time
- End Date/Time
- Location
- Category
- Image URL

### Database Migrations

When changing the database schema, update the `init.sql` file and run the migrations:

```bash
bun run migrate
```

## API Endpoints

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

The application can be deployed using Docker or directly on a server with Bun installed.

### Docker Deployment

The included Dockerfile and docker-compose.yml files provide everything needed for deployment.

### Manual Deployment

For manual deployment on a server:

1. Clone the repository on your server
2. Install Bun and dependencies
3. Set up a PostgreSQL database
4. Configure environment variables
5. Build the application: `bun run build`
6. Start the server: `bun run start`
7. Set up a reverse proxy (Nginx, Apache) if needed

## Troubleshooting

- **Database Connection Issues**: Ensure PostgreSQL is running and the connection string is correct
- **Rendering Problems**: Check that the HTML content type headers are properly set
- **Style Issues**: Make sure Tailwind CSS is properly compiled

## License

MIT 