# JSport

JSport consists of a React/Vite frontend, an ASP.NET Core API, and a PostgreSQL database hosted in Google Cloud SQL.

## Prerequisites

Install Node.js/npm, the .NET SDK, Google Cloud CLI, Cloud SQL Auth Proxy, PostgreSQL `psql`, and Firebase CLI. Authenticate Google Cloud before starting the API or proxy:

```powershell
gcloud auth login
gcloud auth application-default login
gcloud config set project jsport-production
```

Create the local environment files if they do not exist, then replace their placeholder values with the development credentials:

```powershell
Copy-Item .env.example .env
Copy-Item frontend/.env.example frontend/.env
```

Never commit `.env` files or credentials.

## Run locally

The current local setup uses the production Cloud SQL database. Changes made while developing can therefore affect live data. A separate sandbox database has not yet been configured.

### Terminal 1: start the Cloud SQL proxy

Run from the repository root:

```powershell
cloud-sql-proxy --gcloud-auth --port 5433 jsport-production:asia-southeast2:jsport-prod-db
```

Leave this terminal running.

### Terminal 2: start the backend

ASP.NET Core does not load the root `.env` file automatically, so load its values into the current PowerShell process first:

```powershell
cd C:\Coding\JSport

Get-Content .env | Where-Object { $_ -match '^[^#].*=.*$' } | ForEach-Object {
    $key, $value = $_.Split('=', 2)
    Set-Item -Path "Env:$key" -Value $value
}

dotnet run --project src/JSport.Api
```

The API starts at `http://localhost:5237`.

### Terminal 3: start the frontend

```powershell
cd C:\Coding\JSport\frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies frontend `/api` requests to the local backend at `http://localhost:5237`.

## Connect to PostgreSQL manually

First start the Cloud SQL proxy as shown above. In another terminal, load the connection string from the root `.env` file and connect:

```powershell
$connection = (Get-Content .env | Where-Object { $_ -like 'ConnectionStrings__Postgres=*' }).Split('=', 2)[1]

$settings = @{}
$connection.Split(';') | ForEach-Object {
    $key, $value = $_.Split('=', 2)
    $settings[$key] = $value
}

$env:PGPASSWORD = $settings.Password

psql `
  -h $settings.Host `
  -p $settings.Port `
  -U $settings.Username `
  -d $settings.Database
```

Once connected, try:

```sql
SELECT * FROM courts;
```

Exit `psql` with:

```text
\q
```

Then clear the password from the terminal environment:

```powershell
Remove-Item Env:PGPASSWORD
```

## Deploy to production

Local changes are not published automatically. The frontend and backend are deployed separately.

### Deploy frontend changes

The frontend build reads its production configuration from `frontend/.env` and deploys `frontend/dist` to Firebase Hosting:

```powershell
cd C:\Coding\JSport\frontend
npm run build
cd ..
firebase deploy --only hosting
```

Live site: <https://jsport-production.web.app/>

### Deploy backend changes

Deploy a new revision of the API to Cloud Run:

```powershell
cd C:\Coding\JSport
gcloud run deploy jsport-api `
  --source src/JSport.Api `
  --region asia-southeast2 `
  --project jsport-production
```

Production API: <https://jsport-api-490123100639.asia-southeast2.run.app>

If both applications changed, deploy and verify the backend first, then deploy the frontend.

### Database schema changes

Changes to entity classes do not update the production database automatically. Create an EF Core migration, review it, apply it through the Cloud SQL proxy, and then deploy the compatible backend. Database migrations directly modify production data and should be backed up and tested before being applied.
