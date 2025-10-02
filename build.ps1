# Stop script on error
$ErrorActionPreference = "Stop"

# Set variables
$imageName = "nextjs-app"

Write-Host "Building Docker image..."
docker build -t $imageName .

Write-Host "Docker image $imageName built successfully."
