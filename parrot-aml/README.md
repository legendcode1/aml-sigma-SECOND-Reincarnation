# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# AML Backend

## Credentials Setup

1. Navigate to the `/credentials` folder
2. Create a new file named `service-account.json`
3. Copy the contents from `service-account.template.json`
4. Replace the placeholder values with your Google Cloud credentials:
   - `YOUR_PROJECT_ID`
   - `YOUR_PRIVATE_KEY_ID`
   - `YOUR_PRIVATE_KEY`
   - `YOUR_CLIENT_EMAIL`
   - `YOUR_CLIENT_ID`
   - `YOUR_CLIENT_CERT_URL`

## Environment Variables

Create a `.env` file in the root directory with your configuration:

```env
PORT=3000
NODE_ENV=development
```

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```