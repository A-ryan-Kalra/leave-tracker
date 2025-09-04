# 📅 Leave Tracker  

A smart and seamless leave management system designed for modern workplaces. It empowers employees to request leaves with ease, while managers can review, approve, or reject them in real-time. With automated tracking, **Google Calendar sync**, and insightful reports, Leave Tracker ensures transparency and efficiency for everyone in the organization.  

---

## 📌 Important Notes  

> [!IMPORTANT]
> - Logging in with **dummy/demo accounts** will not provide the full experience:  
> - Email confirmations will not work (requires SMTP with real Gmail).   
> - For the **best experience**, log in with your **own Gmail account**. 

<br>

> [!CAUTION]
> - The **Manage Leave Requests section is available only to Managers**.  
    - Please log in with a user account that has the **Manager role**.  
    - **Admins** and **Team Members** will **not** see this section.   

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
4. **Admin** configures users, leave quotas, projects, and groups.  

---

## 🛠️ Tech Stack  

- **Frontend:** React / ShadCN / TailwindCSS  
- **Backend:** Node.js / Express / Prisma  
- **Database:** PostgreSQL (Supabase / pgAdmin)  
- **Authentication:** Google OAuth (Gmail login)  
- **Email Service:** Gmail API / Nodemailer  
- **Calendar Sync:** Google Calendar API  

---

<br/>

## 🧪 Demo Data  

For quick testing, you can use the following demo accounts:  

1. **Manager** → Email: `john@leave-tracker.com` Password: `john`
2. **Team Member** → Email: `sam@leave-tracker.com`  Password: `sam`

---

## 📦 Installation  

```bash
# Clone the repo
git clone https://github.com/yourusername/leave-tracker.git
cd leave-tracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run the app
npm run dev
```
---

## 🐳 Docker Installation  

You can also run the Leave Tracker app using **Docker**:  

```bash
docker run -p 3000:3000 -e DOCKERIZED=true aryankalra363/leave-tracker
```
---

<div align="center">

<br/>
Powered by ☕️ & 🎧 <br>
Aryan Kalra

</div>
