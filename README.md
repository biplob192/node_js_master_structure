# About Project

This project is a clean and scalable Node.js starter template built with best coding practices in mind. It provides a solid foundation for backend applications using Express and MongoDB, featuring robust authentication, request validation, security enhancements, and convenient development tooling. Designed to be easy to extend and maintain, it serves as a reliable starting point for modern server-side applications.

## Installation

### Clone the repository
```bash
git clone https://github.com/biplob192/node_js_master_structure
```
### Install dependencies
```bash
npm install
```

### Run the development server

```bash
npm run dev
```

## License

This project is licensed under the MIT. Anyone can use it for free. You don't need to ask permission.

## Features

### Authentication and Authorization

- User registration
- User verification (email)
- User login (multiple devices)
- User logout (current device)
- User logout (other devices)
- User profile
- User password reset
- User password change
- JWT tokens for secure authentication
- Access tokens for short-lived authentication
- Refresh tokens for long-term authentication
- Automatic token rotation for security and efficiency
- Seeders for database initialization and data population
- Role-based access control (RBAC) for fine-grained permissions

## Dependencies

- **Node.js:** For server
- **Express:** As a web framework
- **MongoDB:** For database
- **Mongoose:** As an Object Data Modeling (ODM) library
- **dotenv:** For environment variables
- **Bcryptjs:** For password hashing
- **Jsonwebtoken:** For generating and verifying JWT tokens
- **Joi:** For input validation
- **Nodemon:** For live reloading
- **Compression:** For gzip compression
- **Helmet:** For security headers
- **CookieParser:** For parsing cookies
- **Cors:** For enabling CORS
- **HttpErrors:** For HTTP errors
- **Faker:** For generating fake data
- **Minimist:** For parsing CLI arguments
- **Morgan:** For logging HTTP requests
