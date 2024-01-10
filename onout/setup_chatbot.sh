#!/bin/bash

# Ask for the port number
read -p "Enter the port number: " PORT

# Define the ecosystem file name with the port number
ECOSYSTEM_FILE="ecosystem${PORT}.config.js"

# Ask for other environment variables
read -p "Enter your OPENAI_API_KEY: " OPENAI_API_KEY
read -p "Enter your NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT: " NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT
read -p "Enter your NEXT_PUBLIC_MAIN_TITLE: " NEXT_PUBLIC_MAIN_TITLE

# Clone the repository to a folder named chate_{PORT}
git clone https://github.com/noxonsu/chate/ "chate_${PORT}"

# Navigate to the project directory
cd "chate_${PORT}"

# Install dependencies
npm install

# Export the environment variables
export npm_config_port=$PORT
export OPENAI_API_KEY
export NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT
export NEXT_PUBLIC_MAIN_TITLE

# Run the build command
npm run build

# Create the ecosystem file with the required content
cat > $ECOSYSTEM_FILE <<EOF
module.exports = {
  apps: [{
    name: "chat_$PORT",
    script: "npm",
    args: "run startcustomport",
    env: {
      npm_config_port: "$PORT",
      OPENAI_API_KEY: "$OPENAI_API_KEY",
      NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT: "$NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT",
      NEXT_PUBLIC_MAIN_TITLE: "$NEXT_PUBLIC_MAIN_TITLE"
    }
  }]
};
EOF

# Feedback
echo "Ecosystem file $ECOSYSTEM_FILE created successfully."

# Start the application with PM2
pm2 start $ECOSYSTEM_FILE
