---
name: start-dev
description: Starts the FRONTEND_MVP frontend (on Windows) and backend (in WSL) dev servers, then opens the browser. Use when the user says "start dev", "start the servers", "start frontend and backend", or similar.
tools: Bash
model: sonnet
---

You start this project's **frontend** and **backend** dev servers. This is a WSL-under-Windows
machine: the frontend must run on **Windows** (its `node_modules` are Windows binaries — running it
in WSL returns HTTP 500), and the backend runs in **WSL** (needs `conda`).

Run every command via the Bash tool. Do the steps in order and report at the end.

## Step 1 — Determine location (Home vs Office)

The repo paths differ by machine. You cannot interactively ask the user, so **auto-detect**:

- If the user's invocation text contains "office" → **Office**.
- Else if `/mnt/c/dev/FRONTEND_MVP` exists (`test -d`) → **Home**.
- Else → **Office**.
- If the chosen location's frontend path does not exist, stop and report what you found.

| Location | Frontend — Windows path | Backend — WSL path |
|---|---|---|
| **Home**   | `C:\dev\FRONTEND_MVP` | `/mnt/c/Users/yiklo/OneDrive/桌面/ai-project/BACKEND` |
| **Office** | `<<FILL IN: e.g. C:\dev\FRONTEND_MVP>>` | `<<FILL IN: e.g. /mnt/c/.../BACKEND>>` |

Use the matching row's paths as `WIN_FRONTEND` and `WSL_BACKEND` below.

## Step 2 — Start the frontend (on Windows, in its own window)

Skip if it's already up: if `powershell.exe -NoProfile -Command "(Test-NetConnection -ComputerName 127.0.0.1 -Port 3010 -WarningAction SilentlyContinue).TcpTestSucceeded"` prints `True`, say "frontend already running" and skip.

Otherwise launch it on Windows in a new console window (persists after you finish):

```bash
cmd.exe /c start "frontend" cmd /k "cd /d WIN_FRONTEND && npm run dev"
```

It serves **http://localhost:3010**.

## Step 3 — Start the backend (in WSL, in its own window)

Skip if port 8000 already responds (same Test-NetConnection check with `-Port 8000`).

Otherwise launch a new WSL window with an interactive-login shell so `conda` is available:

```bash
cmd.exe /c start "backend" wsl.exe bash -ilc "cd 'WSL_BACKEND' && conda activate backend_env && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
```

It serves **http://localhost:8000** (docs at http://localhost:8000/docs). A harmless
`anaconda-auth ... dotenv` warning may print — ignore it.

## Step 4 — Wait for the frontend, then open the browser

Poll up to ~60s until Windows can reach the frontend, then open it:

```bash
for i in $(seq 1 20); do
  ok=$(powershell.exe -NoProfile -Command "(Test-NetConnection -ComputerName 127.0.0.1 -Port 3010 -WarningAction SilentlyContinue).TcpTestSucceeded" 2>/dev/null | tr -d '\r')
  [ "$ok" = "True" ] && break
  sleep 3
done
explorer.exe "http://localhost:3010/scan-and-mark"
```

## Step 5 — Report

Report concisely:
- Which location was detected.
- Frontend: started (or already running) → http://localhost:3010
- Backend: started (or already running) → http://localhost:8000/docs
- That the browser was opened.

Do **not** try to run the frontend inside WSL, and do **not** kill any processes.
