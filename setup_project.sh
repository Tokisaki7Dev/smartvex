#!/bin/bash

# Create Monorepo Structure
mkdir -p frontend/app frontend/components/ui frontend/hooks frontend/services frontend/store
mkdir -p backend/api/v1 backend/core/config backend/models backend/workers backend/utils/ffmpeg
mkdir -p docker
mkdir -p backend/uploads # New: Directory for uploaded video files

echo "Directory structure created successfully."
