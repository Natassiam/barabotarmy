# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## 🛠️ Reset and Reinstall Project Dependencies

Follow these steps to clean up and reinstall your dependencies, update necessary packages, and ensure your chatbot project is running smoothly.

```bash
# 1. Remove old dependencies and lock file
rm -rf node_modules package-lock.json

# 2. Clear npm cache (useful to avoid corrupt installs)
npm cache clean --force

# 3. Reinstall all dependencies listed in package.json
npm install

# 4. Install React and ReactDOM (if not already present)
npm install react react-dom

# 5. Install the Model Context Protocol SDK (if your project requires it)
npm install @modelcontextprotocol/sdk

# 6. Check if @google/genai is already installed
npm ls @google/genai

# 7. Install or update @google/genai to the latest version
npm install @google/genai@latest

![My Chatbot Screenshot](/initial.png)
![BTS Logo](https://upload.wikimedia.org/wikipedia/commons/0/09/BTS_logo.svg)
![BTS page](https://ibighit.com/bts/eng/)