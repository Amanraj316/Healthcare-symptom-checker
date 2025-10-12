# Healthcare Symptom Checker 🩺

This is a web application that takes user-inputted health symptoms and uses an AI Language Model (LLM) to suggest probable conditions and recommend next steps. All queries are saved to a MongoDB database.

**Disclaimer:** This tool is for **educational purposes only** and is not a substitute for professional medical advice, diagnosis, or treatment.

## Demo Video

[Link to your project demo video]

---

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **AI / LLM:** Cohere API

---

## How to Run

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/Amanraj316/Healthcare-symptom-checker](https://github.com/YourUsername/YourRepositoryName.git)
    cd healthcare-symptom-checker
    ```

2.  **Setup Backend:**

    - Navigate to the backend: `cd backend`
    - Install dependencies: `npm install`
    - Create a `.env` file and add your API key and database URI:
      ```
      COHERE_API_KEY="Your_Key_Here"
      MONGODB_URI="Your_MongoDB_URI_Here"
      ```
    - Start the server: `node server.js`

3.  **Setup Frontend:**
    - Open a **new terminal**.
    - Navigate to the frontend: `cd frontend`
    - Install dependencies: `npm install`
    - Start the client: `npm run dev`
