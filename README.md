# System Monitoring Desktop App

About `app`:
System Monitoring application for Windows, what handle your  system info in real time and showing client (Angular). 
For the BE part, we used the Electron framework, which has access to node processes and render part of the view, as I wrote above, Angular was used.
Native js in main process, typescript with rxjs on the client side


<p align='center'>
 <a href="#">
    <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  </a>&nbsp;&nbsp;
  <a href="#">
  <img alt="GitHub Repo stars" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
</a>&nbsp;&nbsp;
  <a href="#">
  <img style="width: 100px" alt="GitHub Repo stars" src="https://img.shields.io/badge/Electron-2B2E3A?logo=electron&logoColor=fff">
</a>&nbsp;&nbsp;

</p>


**DEMO**

You can install  itself , just go froward https://github.com/brolo1313/monitoring-app/releases.
Remember that it's for Windows only, this app is like a home project to learn and explore a new technology


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.4  and Electron 31.0.2.

## Development server

Run `npm run test-build` or `npm run test-local-both`  for a dev server ( electron only/browser version with electron).

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.


## Electron build
First `ng build`.
Then run `npm build-installer` packages the application and then creates a Windows installer with a better installation process.

OR you can do the same using native Electron builder , but with simplest  installer.

if you want see last changes in distribution version, you should run `ng build`.
Run `npm run start` to local test before package or make.
Run `npm run package` - packages the app for local testing and debugging. It creates a runnable version of your app but does not create an installer.
Run `npm run make` - packages the app and then creates platform-specific installers that you can distribute to users.

