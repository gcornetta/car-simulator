## Description
Electron Node.js neural network simulator for a **self-parking car**. This software is part of the [JavaScript self-parking car project](https://github.com/gcornetta/self-parking-car).

## Fundamentals of neural networks and API documentation
The fundamentals of neural network operation, a description of the software architecture, and the detailed APIs documentation of the `NeuralNetwork` class is available on the [project Wiki](https://github.com/gcornetta/car-simulator/wiki).

## Usage
To run the application follow the steps depicted in the sequel:
1. clone this repo typing `git clone https://github.com/gcornetta/car-simulator.git`.
2. in the project folder run `npm install` to install the project dependencies.
3. to run the application type `npm start`.

The easiest way to pack the Electron application and generate an executable for your platform is using `electron-forge`. All the scripts and configurations are automativally generated when the Electron application is created. To create and scaffold an Electron application you could use `npx` (that is bundled with the node package manager `npm`):

```
npm create-electron-app <app-name> --template=<template-name>
```

The electron application can be started from the application folder typing `npm start`. The electron application can be packaged typing `npm run make`.
The packager configuration is specified in the `package.json` file:

```
"config": {
    "forge": {
      "packagerConfig": {},
      "makers": [
        {
          "name": "@electron-forge/maker-squirrel",
          "config": {
            "name": "self-parking-car-sim"
          }
        },
        {
          "name": "@electron-forge/maker-zip",
          "platforms": [
            "darwin"
          ]
        },
        {
          "name": "@electron-forge/maker-deb",
          "config": {}
        },
        {
          "name": "@electron-forge/maker-rpm",
          "config": {}
        }
      ]
    }
  }
```

More information can be found on [electronforge.io](https://www.electronforge.io).

## Software requirements
This software has been tested with `Electron v.20.0.2`and `Node.js v.16.6.0`.

## Disclaimer
This software has been tested on a Mac with `MacOS 12.5` (Monterey). I would recommend using either a Mac or a PC with a Linux distribution.


