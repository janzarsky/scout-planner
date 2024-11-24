# Scout planner

Scout planner is a single-page app that helps with planning scout events.

You can try it at https://harmac.cz

## Running locally for development
1) Setup Firestore emulator (see [instructions](https://cloud.google.com/firestore/docs/emulator)) and start it: `gcloud emulators firestore start --host-port 127.0.0.1:8080`.
2) Save the Firestore emulator host to `.env.local` file - create `.env.local` file with the following content:
```
FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
```
3) Create `src/config.local.json` file with the following content:
```json
{}
```
4) Install dependencies using `npm ci` command.
5) Run the app using `npm start` command.
