# AfterPadel

AfterPadel is a web-based padel performance journal designed to help players reflect on their sessions, document their experiences, and develop a structured record of their performance over time.

The application follows a four-stage approach: **Play → Reflect → Understand → Improve**.

## Project Overview

AfterPadel was developed as a Human-Centered Design and Development capstone project at Penn State.

The application addresses a common challenge among padel players: important observations about match performance are often forgotten between sessions.

AfterPadel provides a structured reflection process that allows players to record their experiences, identify strengths and challenges, revisit previous sessions, and receive personalized guidance for future improvement.

## Technologies Used

**Frontend**
- React
- TypeScript
- Vite
- React Router
- CSS

**Backend**
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Maven

**Database**
- MySQL

**AI Integration**
- Google Gemini API
- Curated padel knowledge bank

## Implemented Features

- User registration and login
- First-time-user onboarding
- Personalized dashboard
- Session details and guided reflections
- AI-generated contextual follow-up questions
- Reflection review and approval
- Journal history and reflection viewing
- Progress tracking and personalized recommendations
- Session satisfaction tracking
- Coach feedback requests through private sharing links
- Coach feedback comparison
- User profiles and reflection milestones
- Notifications

## Installation and Setup

### Prerequisites

Before running AfterPadel, install:

1. **Java Development Kit (JDK) 17 or a compatible version**
2. **IntelliJ IDEA** for running the Spring Boot backend
3. **Node.js and npm** for the React frontend
4. **MySQL Server** for database storage
5. **Visual Studio Code** or another code editor for the frontend

The project was developed using Node.js 24 and npm 11.

An internet connection is required to download dependencies and use the Gemini AI functionality.

### Step 1: Download the Project

Visit the GitHub repository:

https://github.com/walaamz/afterpadel

Select **Code → Download ZIP**.

Extract the downloaded ZIP file to a folder on your computer.

Alternatively, clone the repository:

```bash
git clone https://github.com/walaamz/afterpadel.git
```

The repository contains both the React frontend and the Spring Boot backend.

### Step 2: Set Up MySQL

Start the MySQL Server.

Using MySQL Workbench or the MySQL command-line client, create a database named `afterpadel`:

```sql
CREATE DATABASE afterpadel;
```

The Spring Boot backend uses this database to store application information.

### Step 3: Configure the Backend

Open IntelliJ IDEA.

Select **File → Open** and navigate to:

```text
afterpadel/afterpadel.backend
```

Open this folder as a Maven project and allow IntelliJ to download the required dependencies.

Locate the application's main class under:

```text
src/main/java/com/afterpadel/backend/
```

The backend configuration is stored in:

```text
src/main/resources/application.properties
```

The application uses environment variables to protect sensitive information.

In IntelliJ, open:

**Run → Edit Configurations**

Select the Spring Boot application's run configuration and locate **Environment variables**.

Configure the following variables:

```text
DB_PASSWORD=your_mysql_password
GEMINI_API_KEY=your_gemini_api_key
```

Replace the example values with your own credentials.

Do not upload passwords or API keys to GitHub.

The default database configuration uses:

```text
jdbc:mysql://localhost:3306/afterpadel
```

with the MySQL username `root`.

If your MySQL configuration differs, adjust the database connection settings accordingly.

### Step 4: Start the Backend

In IntelliJ, open the main Spring Boot application class.

Click the green **Run** button.

Wait for the application to start successfully.

The backend runs locally at:

```text
http://localhost:8080
```

Keep the backend running while using AfterPadel.

**Alternative: Start with Maven**

From the backend directory, run:

Windows:

```bash
mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
./mvnw spring-boot:run
```

The required environment variables must be configured before running either command.

### Step 5: Start the Frontend

Open the main `afterpadel` project folder in Visual Studio Code.

Open a terminal in the project's root directory.

Install the required dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The terminal will display the local frontend address, typically:

```text
http://localhost:5173
```

Open this address in your browser.

Keep both the frontend and backend running while using the application.

## How to Use AfterPadel

### Create an Account

Open the application and select the registration option.

Enter your name, email address, and password.

After registration, sign in to access your personal dashboard.

New users receive an introductory onboarding tour.

### Record a Reflection

1. Select **Reflect on a Match**.
2. Enter the session details.
3. Complete the guided reflection questions.
4. Respond to the personalized follow-up questions.
5. Review your answers.
6. Approve and save the reflection.

### View Your Journal

Open the **Journal** tab to access previously saved reflections.

Use the available search and filtering options to locate specific sessions.

Select a reflection to view its details.

### Track Your Progress

Open the **Progress** tab to review your reflection history, identified strengths and challenges, recommendations, and session satisfaction.

### Request Coach Feedback

Open the **Coach** tab and select **Request Coach Review**.

Choose a saved reflection and generate a private sharing link.

Send the link to your coach so they can review the reflection and provide feedback.

Return to the Coach page to review completed feedback.

### View Your Profile

Open the **Profile** tab to access personal information, reflection milestones, and your reflection journey.

## Verifying the Installation

After starting both the backend and frontend, verify the following:

1. The application opens in the browser.
2. A new account can be registered.
3. The user can sign in successfully.
4. The dashboard loads.
5. A reflection can be completed and saved.
6. The saved reflection appears in the Journal.
7. Progress information updates based on saved reflections.
8. AI follow-up questions and recommendations can be generated when the Gemini API is configured.
9. Coach review requests can be created.
10. The user can sign out successfully.

## Production Build

To verify that the frontend compiles successfully:

```bash
npm run build
```

To preview the compiled frontend:

```bash
npm run preview
```

## Troubleshooting

**Frontend loads but account features do not work**

Verify that the Spring Boot backend is running on port 8080.

**Database connection fails**

Confirm that MySQL Server is running, the `afterpadel` database exists, and the database credentials are correct.

**AI features do not respond**

Verify that the Gemini API key is configured correctly and that the computer has internet access.

**Frontend dependencies fail to install**

Check that Node.js and npm are installed and available in the terminal.

**Backend does not start**

Verify that a compatible JDK is configured, Maven dependencies have been downloaded, and the required environment variables are set.

## AI-Assisted Development

Generative AI tools were used to support development activities, including implementation assistance, debugging, interface refinement, and documentation.

The application was developed and tested as part of the capstone project.

## Project Status

Functional full-stack capstone application.