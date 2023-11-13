# Bible Detective

The repo for the Bible Detective website project!

# Initial Installations

## Golang

You will need to install the go programming language to build and run this project.
Here's the [website](https://go.dev/) for info on how to do that for your operating system.

## NPM

You will also need to install Node.js to be able to make the tailwind portion of the webiste work.
Here's the [website](https://nodejs.org/en/) for where you can download that to your operating system.

## The Project

Clone this repo to a place you like on your computer.

## Air

Now that you have go installed, you need to install a tool called `air`. It allows for
hot-reloading of the project for a better workflow. In your terminal, run:
```sh
go install github.com/cosmtrek/air@latest
```
This should install `air` globally to your computer.

## Plugins

If you are using VSCode, there are some helpful plugins you should install if you are wanting to edit the styling of the site.

* Tailwind CSS IntelliSense: Allows for autocompletion of tailwind styles
* Prettier: Allows for sorting of css classess



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

# Git Intro - How do I begin working on this?

First, you'll need to switch over to the `dev` branch in the git repo. This is so that development
code can be seperate from finished, released code.
```sh
git checkout dev
```
If that branch does not exist on your local machine, run this command to create it, and then switch over
to it.
```sh
git branch dev
git checkout dev
```

For the sake of testing, make a random file in the project titled with your name. It doesn't really
matter what you put in the file, just make a random one.
```sh
touch my_name # You don't have to do it in the terminal
```
Then you can add your changes using the terminal, or your editor, such as VSCode, should have git
capabilities:
```sh
git add --all
```
Then commit your changes with a nice message:
```sh
git commit -m "Git good"
```
Now you can push your changes to the cloud! However, at the moment, your computer does not know
where you want to put your changes. You can tell it by pushing with this command:
```sh
git push -u origin dev
```
Now that your computer knows where to push your changes, you only have to run this command:
```sh
git push
```
