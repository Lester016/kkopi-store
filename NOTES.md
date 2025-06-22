## Initialize npm

npm init -y

## Initialize Typescript

npx tsc --init

## Install Bare dependencies

npm install

## Update tsconfig.json && add a script for build, dev, start

"build": "npx tsc",
"start": "node dist/app.js",
"dev": "concurrently \"npx tsc --watch\" \" nodemon -q dist/app.js\""

## Structure project folders

src/
/config/
/constants/
/controllers/
/middleware/
/routers/
/utils/
/views/

## Todo's

- Create basic authentication(Login, Register).✔️
- CI/CD Pipeline Heroku.✔️
- Add tokens/session.✔️
- Email Verification.✔️
- Implement to RDBMS(MySQL).
- Reset Password.
- Learn Jest.
- Create a unit tests.
- OAuth.⌛
- SMS Feature.
- Read Express.js guide.
