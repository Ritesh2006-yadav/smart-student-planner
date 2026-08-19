# Smart Student Planner

A comprehensive, responsive React web application designed to help students manage their academic life efficiently. From tracking daily tasks to maintaining permanent habits, managing notes, and viewing schedules on a calendar, this planner provides all the tools a student needs to stay organized and productive.

## Features

- **User Authentication**: Secure login and registration functionality.
- **Interactive Dashboard**: A comprehensive overview of your tasks and activities, including a GitHub-style task completion heatmap to track consistency.
- **Task Management**: Create, edit, and organize your daily and upcoming tasks. 
- **Permanent/Recurring Tasks**: Dedicated section to track habits or tasks that repeat consistently.
- **Calendar View**: A visual calendar interface to manage your time and upcoming deadlines effectively.
- **Notes System**: Built-in note-taking feature to jot down important class notes, reminders, or ideas.
- **Profile & Settings**: Manage your user profile and customize app settings to your preference.
- **Responsive Design**: fully responsive and optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend Framework**: React.js 
- **Build Tool**: Vite (for fast development and optimized builds)
- **Styling**: Tailwind CSS for rapid, utility-first styling
- **Routing**: React Router DOM for seamless single-page application navigation
- **Icons**: React Icons for customizable UI elements

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository (or download the source code):**
   ```bash
   git clone <repository-url>
   cd smart-student-planner-main
   ```

2. **Install the dependencies:**
   Using npm:
   ```bash
   npm install
   ```
   Or using yarn:
   ```bash
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:9670` (as configured in package.json).

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview the production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```text
src/
├── components/       # Reusable UI components (Layout, Modals, Forms, Heatmap, etc.)
├── context/          # React Context providers (e.g., AuthContext)
├── pages/            # Page components (Dashboard, Tasks, Calendar, Notes, Auth, etc.)
├── App.jsx           # Main application routing and structure
├── main.jsx          # Application entry point
└── index.css         # Global styles and Tailwind directives
```

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## License

This project is licensed under the MIT License.
