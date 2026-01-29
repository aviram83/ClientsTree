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

## Development

### Adding a New Field to the Database

The project uses Prisma as its ORM. To add a new field to an existing model in the database, follow these steps:

1.  **Modify the Prisma Schema:**
    Open the `server/prisma/schema.prisma` file and add the desired field to the relevant model. For example, to add an `email` field to the `User` model:

    ```prisma
    model User {
      id        Int      @id @default(autoincrement())
      username  String   @unique
      password  String
      email     String   @unique // Add your new field here
      nodes     Node[]
    }
    ```

2.  **Create a New Database Migration:**
    Run the following command from the `server` directory to generate a new migration file and apply the changes to your development database.

    ```bash
    cd server
    npx prisma migrate dev --name "add_email_to_user"
    ```
    Replace `"add_email_to_user"` with a descriptive name for your migration.

3.  **Regenerate the Prisma Client:**
    The Prisma Client is automatically updated after the migration, but you can also run this command manually if needed to ensure your client has the latest schema changes.

    ```bash
    npx prisma generate
    ```

After these steps, your database schema and Prisma Client will be updated to include the new field. You can then update your back-end controllers, services, and front-end components to utilize it.
