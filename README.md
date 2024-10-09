# Theoguessr v1.0.1

The repo for the Theoguessr website project!

# Setup

## Env Variables
Put these environment variables in a `.env` file and set secure passwords.
```env
MYSQL_ROOT_PASSWORD=password
MYSQL_USERNAME=theoguessr_user
MYSQL_PASSWORD=password2
```

## Docker
This project runs within docker and once the environment variables are setup can be ran with the following:
```sh
docker compose up
```
The server should now be accessable on [localhost](localhost).


# Development Setup

## Air (OPTIONAL)

Now that you have go installed, you need to install a tool called `air`. It allows for
hot-reloading of the project for a better workflow. In your terminal, run:
```sh
go install github.com/cosmtrek/air@latest
```
This should install `air` globally to your computer.


## Project Dependencies

In your terminal, you'll need to run this command to grab the packages that the
project will use to run the server:
```sh
go mod tidy
```

In addition, you will need to install the packages required for tailwind:
```sh
npm install
```

Now you should be all setup to run the project!


# How do I run this?


## With Air
In VSCode (or whatever editor you are using) open a terminal. Make sure you
are in the root folder of the project, and type the command:
```sh
air
```

This will begin to "hot-reload", which means that as you work on the project and save
your progress, it will automatically reload the server so you can see your changes
fast!

If you want to stop `air`, just go to your terminal, and use the keybind 'Control-C'
(both on Windows and Mac) to cancel out of `air`.


## Without Air

In the terminal, run this command in the root directory of the theoguessr file structure to create an executable that you can run.
```sh
go build cmd/main.go
```
At least on mac and linux this will create a file that you can run with
```sh
./main.go
```
or
```sh
sudo ./main.go
```
if the executable requires higher privelages for running a web server.


