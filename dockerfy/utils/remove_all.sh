#!/bin/bash

read -r -p "Remove images (front - back - mysql) - Are you sure? [Y/n]" response
response=${response,,} # tolower
if [[ $response =~ ^(yes|y| ) ]] || [[ -z $response ]]; then
	docker image rm mysql:5.7 -f
	docker image rm ravada/front:latest -f
	docker image rm ravada/back:latest -f
fi

read -r -p "Remove volume dockerfy_sshkeys - Are you sure? [Y/n]" response
response=${response,,} # tolower
if [[ $response =~ ^(yes|y| ) ]] || [[ -z $response ]]; then
	docker volume rm dockerfy_sshkeys
fi

read -r -p "Remove persistent data (/opt/ravada/) - Are you sure? [Y/n]" response
response=${response,,} # tolower
if [[ $response =~ ^(yes|y| ) ]] || [[ -z $response ]]; then
	rm -rfv /opt/ravada/*
fi

read -r -p "Warning! - Remove Remove all dangling images - Are you sure? [Y/n]" response
response=${response,,} # tolower
if [[ $response =~ ^(yes|y| ) ]] || [[ -z $response ]]; then
    docker system prune
fi
