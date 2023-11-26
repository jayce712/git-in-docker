FROM ubuntu:latest

RUN apt-get update && apt-get install git -y

ENV ACTION "-v"

CMD git $ACTION