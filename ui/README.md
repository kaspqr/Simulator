create a .env file to the "ui" folder and add the following:
VITE_BACKEND_BASE_URL=http://localhost:8999
VITE_HIVE_URI=ws://localhost:8083/mqtt

"docker-compose up" into the terminal while at the root of the project to start HiveMq
cd into the "api" folder and enter "npm install", then "npm run json-server" into the terminal to start the json-server
cd into the "ui" folder and enter "npm install", then "npm run dev" into the terminal to start vite
