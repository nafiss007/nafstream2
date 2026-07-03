# NafStream

NafStream is a simple open-source live streaming web app built with React, TypeScript, Vite, and Tailwind CSS.

It is designed as a clean web interface for playing legal, publicly available, or authorized live stream sources.

> Legal Notice: This project does not host, own, or distribute any TV channels, sports channels, or video content. Only use stream sources that are legal, public, or properly authorized.

## Features

- Simple live streaming interface
- Clean and responsive UI
- React + TypeScript project structure
- Fast development with Vite
- Tailwind CSS styling
- Easy to customize branding, colors, and layout
- Production build support
- Deployable on Vercel, Netlify, Cloudflare Pages, or any static hosting platform

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- PostCSS
- npm

## Project Structure

```text
nafstream2/
├── public/
├── src/
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nafiss007/nafstream2.git
cd nafstream2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Then open the local URL shown in the terminal. Usually it will be:

```text
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

The production build will be created inside the `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Deployment

You can deploy this project on:

- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

Recommended deployment settings:

```text
Build Command: npm run build
Output Directory: dist
```

## Important Disclaimer

NafStream is only a player/interface. It does not provide or host any copyrighted sports channels, TV channels, or video content.

The project owner is responsible for making sure all stream sources used with this project are legal and authorized.

## Author

Created by Nafis Mahmud.

GitHub: https://github.com/nafiss007

## License

This project is open-source. Add a LICENSE file if you want to define specific usage rights.
EOF

git add README.md
git commit -m "Add README"
git push
