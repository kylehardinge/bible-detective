# Bible Detective v1.0.0

The repo for the Bible Detective website project!

# Initial Installations


## Golang

You will need to install the go programming language to build and run this project.
Here's the [website](https://go.dev/) for info on how to do that for your operating system.


## NPM

You will also need to install Node.js to be able to make the tailwind portion of the webiste work.
Here's the [website](https://nodejs.org/en/) for where you can download that to your operating system.


## MYSQL

You are going to need MYSQL for the servers database. The website to download it is [here](https://dev.mysql.com/downloads/mysql/). Follow the installation instructions and change the root password.


### Password configuration

Copy the `db.config.example` file and rename it to `db.config`. Change the password variable in the file to the password you set for the sql database.


### Setup database

Log into the database. If using the command line, you should be able to do `mysql -u root -p` and then enter the password when prompted. Once in you can run run the command `create database bible_detective;` to create the database that theoguessr is looking for. 


## The Project

Clone this repo to a place you like on your computer.


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


## Both options

Once you have the web server started, you are almost done, navigate to [localhost:8080](localhost:8080) and you should be able to play the game.
