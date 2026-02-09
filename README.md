# ClientsTree Project

This project is a full-stack web application designed to visualize and manage hierarchical data in a tree-like structure. It features a React-based front-end for interactive tree visualization and a Node.js/Express back-end with Prisma for data persistence and user authentication.

## Project Structure

The project is organized into two main parts: a `client` directory for the front-end application and a `server` directory for the back-end services.

```
.
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # API communication layer
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Application pages (Login, Dashboard, etc.)
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── vite.config.ts      # Vite configuration
│   └── package.json        # Frontend dependencies
│
├── server/                 # Node.js/Express Backend
│   ├── prisma/
│   │   └── schema.prisma   # Prisma schema for database models
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── db.ts           # Database connection setup
│   │   └── index.ts        # Server entry point
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript configuration
│
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # This file
```

## Running the Application

To run the server, you can use one of the following commands from the `server` directory:

-   **Development Mode:**
    This command starts the server in development mode, connecting to the local database defined in `.env.development`. It uses `nodemon` to automatically restart the server on file changes.

    ```bash
    cd server
    npm run dev
    ```

-   **Production Mode:**
    This command starts the server in production mode, connecting to the production database defined in `.env.production`.

    ```bash
    cd server
    npm start
    ```

## Development

### Working with Prisma

This project uses Prisma for database management. The following scripts are available in the `server` directory to help you work with Prisma in different environments.

-   **Development Environment:**
    To run Prisma commands against the development database, use the `npm run prisma` command. The `--` is important to pass arguments to the Prisma CLI.

    ```bash
    cd server
    # Example: Create a new migration
    npm run prisma -- migrate dev --name "your-migration-name"

    # Example: Generate the Prisma Client
    npm run prisma -- generate
    ```

-   **Production Environment:**
    To run Prisma commands against the production database, use the `npm run prisma:prod` command.

    ```bash
    cd server
    # Example: Apply migrations in production
    npm run prisma:prod -- migrate deploy
    ```

### Adding a New Field to the Database

To add a new field to an existing model in the database, follow these steps:

1.  **Modify the Prisma Schema:**
    Open the `server/prisma/schema.prisma` file and add the desired field to the relevant model.

2.  **Create a New Database Migration:**
    Run the following command from the `server` directory to generate a new migration file and apply the changes to your development database.

    ```bash
    cd server
    npm run prisma -- migrate dev --name "add_my_new_field"
    ```
    Replace `"add_my_new_field"` with a descriptive name for your migration.

3.  **Regenerate the Prisma Client:**
    The Prisma Client is automatically updated after the migration, but you can also run this command manually if needed.

    ```bash
    cd server
    npm run prisma -- generate
    ```
After these steps, your database schema and Prisma Client will be updated.
