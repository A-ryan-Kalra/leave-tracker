# 📅 AI Leave Tracker

A smart and seamless AI leave management system designed for modern workplaces using modern AI. <br/>
Request, approve, and track leaves in real time with AI smart automation, google calendar sync, and effortless transparency.<br/>
No spreadsheets, no hassle, just smooth leave management that keeps work and life in balance.


<br />

<img width="1440" height="782" alt="leave-tracker" src="https://github.com/user-attachments/assets/41d2b1ca-afde-4381-b027-93c38d4a6d0a" />


---

<br />

<div>
<video alt="leave-tracker" src="https://github.com/user-attachments/assets/83de40ef-1755-4ec8-8084-ca8ae4b1effc" loop />
</div>

---
 
<br />



## 📌 Important Notes

> [!IMPORTANT]
>
> - Logging in with **dummy/demo accounts** will not provide the full experience:
> - Email confirmations will not work (requires SMTP with real Gmail).
> - For the **best experience**, log in with your **own Gmail account**.

<br>

> [!CAUTION]
>
> - The **Manage Leave Requests section is available only to Managers**.
> - Please log in with a user account that has the **Manager role**.
> - **Admins** and **Team Members** will **not** see this section.
> - Leave approvals are **done on a group basis**. Each Manager can only approve or reject leave requests for members of their **assigned group/project**.
> - Simply assigning someone as a Manager will **not** allow them to receive leave requests unless they are also a manager of a group/project.

 <br/>

## 🤖 Instructions for calling AI tools : 
- ### Currently It supports 4 tool methods for each task:
   - Get Events - Fetches all the events from Calendar.
   - Create Event - Creates or marks leaves on the calendar based on the employee’s leave balance, and syncs with Google Calendar.
   - Delete Event- Deletes any event from the calendar.
   - Show Balance- Displays the current employee’s leave balance.

 <br/>

## 🚀 Features

- **Role-based Access Control**

  - **Admin**
    - Create and manage users
    - Assign leave quotas
    - Create projects and groups
  - **Manager**
    - Approve or reject leave requests
    - Trigger automatic email confirmations on each action
  - **Team Member**
    - Apply for leave
    - Cancel/reject their own leaves
    - View history of approved, rejected, and cancelled leaves

- **Leave Quota Management**

  - Each user is assigned a custom leave quota.

- **Interactive Calendar**

  - A shared **big calendar** where all users can view applied/approved leaves.
  - Calendar updates automatically when leaves are approved (sometimes requires a refresh).

- **Google Calendar Sync**

  - Once a leave is approved, it is automatically **synced to Google Calendar**.

- **Gmail Authentication**
  - Logging in via Gmail automatically makes you an **Admin**, enabling configuration of system details.

---

## 📖 User Flow

1. **Team Member** applies for leave.
2. **Manager** approves/rejects the request.
   - Email confirmation is sent automatically.
3. Approved leaves appear on:

   - The shared **big calendar** inside the app
   - The user’s **Google Calendar** (if Gmail login is used)
   - Pressing on a **username** will open a popup with user details.
   - When running in Docker, clicking on the **calendar icon** will send an email containing a **Google Calendar link**.
   - Opening this link grants you permission to view live events synced with Google Calendar.

   - <img width="700" height="782" alt="Screenshot 2025-09-04 at 1 12 19 PM" src="https://github.com/user-attachments/assets/108b968a-c7aa-44f4-8556-b378b2732cc7" />

4. **Admin** configures users, leave quotas, projects, and groups.

---

## 🛠️ Tech Stack

- **Frontend:** React / ShadCN / TailwindCSS
- **Backend:** Node.js / Express / Prisma
- **Gen Ai:** LangChain, LangGraph, GROQ LLms, AI Tools
- **Database:** PostgreSQL (Supabase / pgAdmin)
- **Authentication:** Google OAuth (Gmail login) / JWT
- **Email Service:** Gmail API / Nodemailer
- **Calendar Sync:** Google Calendar API
- **Cache:** React Query
- **Containerization:** Docker

---

<br/>

## 🧪 Demo Data

For quick testing, you can use the following demo accounts:

1. **Admin** → Email: `mark@leave-tracker.com` Password: `mark`
2. **Manager** → Email: `john@leave-tracker.com` Password: `john`
3. **Team Member** → Email: `sam@leave-tracker.com` Password: `sam`

---

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/A-ryan-Kalra/leave-tracker-AI
cd leave-tracker

# Install dependencies
npm install

# Run the app
npm run dev
```

---

## 🐳 Docker Setup Instructions

Before running the Docker container , please follow these steps carefully:

1. **Clone the repository**

```bash
git clone https://github.com/A-ryan-Kalra/leave-tracker-AI
cd leave-tracker
```

2. **Set up environment variables**

- You will find the `.env.example` file stored in the server directory.
- Rename the `.env.example` to `.env` file:
- Open `.env` file and fill in your own credentials and fill all the environment variables as required:
- ⚠️ Make sure the `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` used in the docker-compose.yml file must share the same ID.

3. **Run Docker Compose**

```
docker compose up
```

4. **The app will now start and be available at `http://localhost:3000`**
<div align="center">

<br/>
Powered by ☕️ & 🎧 <br>
Aryan Kalra

</div>
