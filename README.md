# Forecasting Hotel Breakfast Items to Minimize Food Waste

## Project Overview

This application predicts the necessary quantities of various items for hotel breakfasts, aiming to minimize food waste. By inputting the number of guests expected for breakfast, hotels can receive detailed forecasts for meals/items required. This solution leverages Machine Learning deployed on AWS, utilizing FastAPI for rapid predictions through AWS Lambda, and ECS for parameter tuning via scheduled Docker containers.

## Team Members

- Gabriel LAFFITTE
- Maxime TATA

## Features

- **Forecasting Model**: Utilizes historical data to predict breakfast item quantities, reducing waste.
- **ML-Based Application**: FastAPI for quick predictions, AWS Lambda for serverless operations, and ECS for scalable container management.
- **Automated ML Pipeline**: Includes automated data processing, model training (with scheduled updates), and deployment.
- **CI/CD**: Utilizes GitHub Workflows for continuous integration and deployment across main, staging, and development branches.
- **Testing**: Incorporates unit, integration, and end-to-end tests to ensure application reliability.
- **Monitoring**: Employs MLflow for tracking model training sessions and performance monitoring.

## Technology Stack

- **AWS** (Lambda, ECS, ECR)
- **Docker/Docker Compose**
- **GitHub** (for version control and CI/CD)
- **FastAPI**
- **MLflow** (for ML model tracking and monitoring)
- **Jest** (for testing)

