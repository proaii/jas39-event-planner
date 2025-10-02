# Stop script on error
$ErrorActionPreference = "Stop"

# Set variables
$imageName = "nextjs-app"
$containerName = "nextjs-container"
$port = 3000

# Stop & remove old container if exists
if (docker ps -a -q -f name="^${containerName}$") {
    Write-Host "Stopping old container..."
    docker stop $containerName | Out-Null
    docker rm $containerName | Out-Null
} else {
    Write-Host "No old container found."
}

# Run new container
Write-Host "Running new container..."
docker run -d -p ${port}:3000 --name $containerName $imageName

Write-Host "App is running at http://localhost:$port"
