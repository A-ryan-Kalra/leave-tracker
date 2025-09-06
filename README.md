# 📅 Leave Tracker

A smart and seamless leave management system designed for modern workplaces. It empowers employees to request leaves with ease, while managers can review, approve, or reject them in real-time. With automated tracking, **Google Calendar sync**, and insightful reports, Leave Tracker ensures transparency and efficiency for everyone in the organization.

---

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
- **Database:** PostgreSQL (Supabase / pgAdmin)
- **Authentication:** Google OAuth (Gmail login)
- **Email Service:** Gmail API / Nodemailer
- **Calendar Sync:** Google Calendar API
- **Cache:** React Query

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
git clone https://github.com/A-ryan-Kalra/leave-tracker
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
git clone https://github.com/A-ryan-Kalra/leave-tracker
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
