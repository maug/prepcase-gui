# PrepCASE

PrepCASE is a system developed for [CMCC](https://www.cmcc.it/)
that provides a web based user interface
for creating, configuring, and running Community Earth System Model ([CESM2](http://www.cesm.ucar.edu/models/cesm2/)) climate models.

PrepCASE uses [CIME](https://esmci.github.io/cime/versions/master/html/index.html), Common Infrastructure for Modeling the Earth,
scripts to configure and build a single-executable coupled Earth model,
also called "case" in the CESM terminology, or "experiment".

A CESM case configured and built with PrepCASE
can be run on a supercomputer as a
[CYLC](https://cylc.github.io/) suite.

CYLC is a "general purpose workflow engine that orchestrates cycling workflows very efficiently",
and is used in many meteorological and climatological centres. 

## Managing CESM CASEs with prepCASE

At CMCC a dedicated Linux VM has been provisioned to
to run PrepCASE server.

After login to the PrepCASE web app
user can create, configure and build CASM cases on the CMCC zeus supercomputer.

### Login to PrepCASE web app

PrepCASE is available at [http://prepcase.cmcc.scc/](http://prepcase.cmcc.scc/) to CMCC users via a VPN,
please contact CMCC calldesk to obtain a VPN account.

PrepCASE at CMCC is configured to manage CESM cases on the zeus supercomputer,
so users must have a zeus account.

PrepCASE executes CIME scripts on zeus over SSH connections.
To allow passwordless SSH connnections from PrepCASE VM to zeus
users must have their SSH keys installed on the PreCASE VM.
This is a one-off action that can be requested from CMCC calldesk.

After obtaining and configuring VPN account on their PC or laptop
and having the SSH keys installed
users have to create a file `.prepcase.json` in their home directory on zeus.
This can be done in zeus shell like below:

```
$ echo >$HOME/.prepcase.json '{ "password": "YOUR_PASSWORD_HERE", "cesm_path": "PATH_TO_CESM", "cesm_env_script": "PATH_TO_ENV_SCRIPT" }'
```

- "password" will be used to login to the PrepCASE web app. It should be different than your password on "zeus.cmcc.scc".
- "cesm\_path" should point to your CESM installation, for example "~/CESM".
- "cesm\_env\_script" is a path to an optional bash script used to set up environment before executing CESM script. Leave empty if not needed.

The file `.prepcase.json` should be readable and writable only by your user:

```
chmod 600 $HOME/.prepcase.json
```



# Developer's documentation

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Python backend

Python backend lives in directory `prepcase-gui/server`.

Dependencies of the project are managed by [Pipenv](https://github.com/pypa/pipenv).
To start Python environment loaded with project's dependencies:

```
$ cd prepcase-gui/server      
$ pipenv install
$ pipenv shell
```

## Running development server

After activating project's environment with `pipenv shell` you can start development server.

```
(server) $ cd src
(server) $ python api.py
 * Serving Flask app "api" (lazy loading)
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: on
 * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 332-332-280
```

## Testing

With the development environment running you can run tests in `test.py`:

```
(server) $ python test.py
```
