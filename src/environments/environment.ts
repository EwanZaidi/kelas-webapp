// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebaseConfig : {
    apiKey: "AIzaSyBI0_dmvxoMTWCA-_tmMh0Awq31BshSbYw",
    authDomain: "kelas-dev.firebaseapp.com",
    databaseURL: "https://kelas-dev.firebaseio.com",
    projectId: "kelas-dev",
    storageBucket: "kelas-dev.appspot.com",
    messagingSenderId: "415474545324"
  }
};
