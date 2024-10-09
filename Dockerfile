FROM golang:1.21
COPY . /theoguessr
WORKDIR /theoguessr
CMD go run cmd/main.go

