FROM golang:latest AS base
WORKDIR /theoguessr

FROM base as development
RUN go install github.com/air-verse/air@latest
COPY . /theoguessr
ENTRYPOINT ["air"]

FROM base as production
COPY . /theoguessr
CMD go run cmd/main.go

